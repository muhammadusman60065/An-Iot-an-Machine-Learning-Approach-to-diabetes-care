import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are DiaCare AI, a knowledgeable and compassionate virtual health assistant specializing in diabetes care and management. 

Your expertise includes:
- Type 1 and Type 2 diabetes information
- Blood glucose monitoring and management
- Diet and nutrition for diabetics
- Exercise recommendations
- Medication awareness (insulin, metformin, etc.)
- Recognizing symptoms of hypo/hyperglycemia
- Lifestyle modifications
- Mental health support for chronic condition management

Guidelines:
- Be empathetic, supportive, and encouraging
- Provide evidence-based information
- Always recommend consulting healthcare professionals for medical decisions
- Never diagnose conditions or prescribe medications
- Use simple, clear language
- If asked about non-diabetes topics, politely redirect to diabetes-related help
- Keep responses concise but informative (2-3 paragraphs max)

Remember: You are an educational resource, not a replacement for medical professionals.`;

// Rate limiting: track requests per user/IP
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW_MS = 60000; // 1 minute window

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user identifier - prefer auth but allow anonymous with a fallback identifier
    let userId: string;
    const authHeader = req.headers.get("Authorization");
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Try to extract user from token if provided, but don't require it
      try {
        // For authenticated users, we can extract user ID from the JWT
        const token = authHeader.replace("Bearer ", "");
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.sub || "anonymous";
      } catch {
        userId = "anonymous";
      }
    } else {
      // For anonymous users, use IP-based or random identifier
      const clientIp = req.headers.get("x-forwarded-for") || 
                       req.headers.get("cf-connecting-ip") || 
                       "anonymous";
      userId = `anon_${clientIp}`;
    }

    console.log("Chat request from:", userId);

    // Rate limiting check
    if (!checkRateLimit(userId)) {
      console.log("Rate limit exceeded for:", userId);
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait before sending more messages." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
      });
    }

    const { messages } = await req.json();
    
    // Input validation
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request: messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limit message history to prevent abuse
    const limitedMessages = messages.slice(-20);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...limitedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

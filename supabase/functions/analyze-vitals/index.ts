import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VitalsData {
  temperature: number;
  humidity: number;
  heartRate: number;
  spO2: number;
  glucose: number;
  patientId?: string;
  historicalData?: VitalsData[];
}

interface AnalysisResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  anomalyDetected: boolean;
  confidence: number;
  analysis: string;
  recommendations: string[];
  predictedCondition: string | undefined;
  timestamp: string;
}

// Rate limiting: track requests per user
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW_MS = 60000; // 1 minute window

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(userId, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Input validation for vitals data
function validateVitals(vitals: unknown): vitals is VitalsData {
  if (!vitals || typeof vitals !== 'object') return false;
  
  const v = vitals as Record<string, unknown>;
  
  // Check required numeric fields are present and within reasonable ranges
  if (typeof v.temperature !== 'number' || v.temperature < 20 || v.temperature > 50) return false;
  if (typeof v.heartRate !== 'number' || v.heartRate < 0 || v.heartRate > 300) return false;
  if (typeof v.spO2 !== 'number' || v.spO2 < 0 || v.spO2 > 100) return false;
  if (typeof v.glucose !== 'number' || v.glucose < 0 || v.glucose > 1000) return false;
  if (typeof v.humidity !== 'number' || v.humidity < 0 || v.humidity > 100) return false;
  
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user with Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables not configured");
      throw new Error("Server configuration error");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log("Authentication failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Authenticated user:", user.id);

    // Rate limiting check
    if (!checkRateLimit(user.id)) {
      console.log("Rate limit exceeded for user:", user.id);
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait before sending more requests." }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }

    const rawVitals = await req.json();
    
    // Input validation
    if (!validateVitals(rawVitals)) {
      console.log("Invalid vitals data received:", rawVitals);
      return new Response(JSON.stringify({ error: "Invalid vitals data. All values must be numbers within valid ranges." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vitals: VitalsData = rawVitals;
    console.log("Analyzing vitals for user:", user.id);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a medical AI assistant specialized in analyzing patient vital signs and detecting anomalies. 
You analyze real-time health data from IoT sensors and identify patterns that may indicate health issues.

Normal ranges for reference:
- Body Temperature: 36.1°C - 37.2°C (Fever > 38°C, Hypothermia < 35°C)
- Heart Rate: 60-100 bpm (Tachycardia > 100, Bradycardia < 60)
- SpO2 (Oxygen Saturation): 95-100% (Hypoxemia < 90%)
- Blood Glucose: 70-130 mg/dL (Hypoglycemia < 70, Hyperglycemia > 180)
- Humidity (environmental): 30-50% optimal

Analyze the provided vitals and respond ONLY with a valid JSON object (no markdown, no extra text).`;

    const userPrompt = `Analyze these patient vitals for anomalies:
- Temperature: ${vitals.temperature}°C
- Heart Rate: ${vitals.heartRate} bpm
- SpO2: ${vitals.spO2}%
- Blood Glucose: ${vitals.glucose} mg/dL
- Environmental Humidity: ${vitals.humidity}%
${vitals.historicalData ? `\nHistorical trend (last ${vitals.historicalData.length} readings): ${JSON.stringify(vitals.historicalData.slice(-5))}` : ''}

Respond with this exact JSON structure:
{
  "riskLevel": "low|medium|high|critical",
  "anomalyDetected": boolean,
  "confidence": number (0-100),
  "analysis": "Brief clinical analysis",
  "recommendations": ["recommendation1", "recommendation2"],
  "predictedCondition": "Potential condition if any anomaly detected, or null"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    console.log("AI response received for user:", user.id);

    let analysisResult: AnalysisResult;
    
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      
      const parsed = JSON.parse(cleanContent.trim());
      analysisResult = {
        riskLevel: parsed.riskLevel || 'low',
        anomalyDetected: parsed.anomalyDetected || false,
        confidence: parsed.confidence || 85,
        analysis: parsed.analysis || 'Vitals within normal parameters',
        recommendations: parsed.recommendations || [],
        predictedCondition: parsed.predictedCondition || null,
        timestamp: new Date().toISOString(),
      };
    } catch (parseError) {
      console.error("Failed to parse AI response, using fallback:", parseError);
      // Fallback to rule-based detection
      analysisResult = performRuleBasedAnalysis(vitals);
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in analyze-vitals:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      riskLevel: 'low',
      anomalyDetected: false,
      confidence: 0,
      analysis: 'Analysis temporarily unavailable',
      recommendations: ['Please try again later'],
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function performRuleBasedAnalysis(vitals: VitalsData): AnalysisResult {
  const issues: string[] = [];
  let riskScore = 0;

  // Temperature analysis
  if (vitals.temperature < 35) {
    issues.push("Severe hypothermia detected");
    riskScore += 40;
  } else if (vitals.temperature < 36.1) {
    issues.push("Mild hypothermia");
    riskScore += 15;
  } else if (vitals.temperature > 38.5) {
    issues.push("High fever detected");
    riskScore += 35;
  } else if (vitals.temperature > 37.5) {
    issues.push("Mild fever");
    riskScore += 10;
  }

  // Heart rate analysis
  if (vitals.heartRate < 40 || vitals.heartRate > 150) {
    issues.push("Critical heart rate");
    riskScore += 45;
  } else if (vitals.heartRate < 60) {
    issues.push("Bradycardia detected");
    riskScore += 20;
  } else if (vitals.heartRate > 100) {
    issues.push("Tachycardia detected");
    riskScore += 20;
  }

  // SpO2 analysis
  if (vitals.spO2 < 90) {
    issues.push("Severe hypoxemia - immediate attention required");
    riskScore += 50;
  } else if (vitals.spO2 < 95) {
    issues.push("Low oxygen saturation");
    riskScore += 25;
  }

  // Glucose analysis
  if (vitals.glucose < 54) {
    issues.push("Severe hypoglycemia");
    riskScore += 45;
  } else if (vitals.glucose < 70) {
    issues.push("Low blood glucose");
    riskScore += 20;
  } else if (vitals.glucose > 250) {
    issues.push("Severe hyperglycemia");
    riskScore += 40;
  } else if (vitals.glucose > 180) {
    issues.push("Elevated blood glucose");
    riskScore += 15;
  }

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (riskScore >= 70) riskLevel = 'critical';
  else if (riskScore >= 40) riskLevel = 'high';
  else if (riskScore >= 15) riskLevel = 'medium';

  const recommendations: string[] = [];
  if (issues.length > 0) {
    recommendations.push("Contact healthcare provider");
    if (riskLevel === 'critical') {
      recommendations.push("Seek immediate medical attention");
    }
  } else {
    recommendations.push("Continue regular monitoring");
  }

  return {
    riskLevel,
    anomalyDetected: issues.length > 0,
    confidence: 75,
    analysis: issues.length > 0 ? issues.join(". ") : "All vitals within normal parameters",
    recommendations,
    predictedCondition: issues.length > 0 ? issues[0] : undefined,
    timestamp: new Date().toISOString(),
  };
}

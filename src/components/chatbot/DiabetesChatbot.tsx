import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/diabetes-chat`;

const QUICK_QUESTIONS = [
  "What is a normal blood sugar level?",
  "What foods should I avoid?",
  "How does exercise affect glucose?",
  "Signs of high blood sugar?",
  "Tips for managing diabetes",
];

const getUserId = (): string => {
  let userId = localStorage.getItem("diacare_chat_user_id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("diacare_chat_user_id", userId);
  }
  return userId;
};

const DiabetesChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = useRef(getUserId());

  const WELCOME_MESSAGE: Message = useRef({
    role: "assistant" as const,
    content: "Hello! I'm DiaCare AI, your diabetes health assistant. Ask me anything about diabetes management, blood sugar, diet, or lifestyle tips. How can I help you today?",
  }).current;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("user_id", userId.current)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));
        setMessages(loadedMessages);
      } else {
        setMessages([{
          role: "assistant" as const,
          content: "Hello! I'm DiaCare AI, your diabetes health assistant. Ask me anything about diabetes management, blood sugar, diet, or lifestyle tips. How can I help you today?",
        }]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([{
        role: "assistant" as const,
        content: "Hello! I'm DiaCare AI, your diabetes health assistant. Ask me anything about diabetes management, blood sugar, diet, or lifestyle tips. How can I help you today?",
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load chat history when component mounts or chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen, messages.length, loadChatHistory]);

  const saveMessage = async (message: Message) => {
    try {
      const { error } = await supabase.from("chat_messages").insert({
        user_id: userId.current,
        role: message.role,
        content: message.content,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const clearHistory = async () => {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", userId.current);

      if (error) throw error;

      setMessages([WELCOME_MESSAGE]);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear history");
    }
  };

  const streamChat = async (userMessages: Message[]) => {
    // Try to get session token if logged in, but don't require it
    const { data: { session } } = await supabase.auth.getSession();
    
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": anonKey,
      // Always send Authorization header - use session token if logged in, otherwise anon key
      "Authorization": `Bearer ${session?.access_token || anonKey}`,
    };

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages: userMessages }),
    });

    if (resp.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    if (resp.status === 402) {
      throw new Error("Service temporarily unavailable. Please try again later.");
    }
    if (!resp.ok || !resp.body) {
      throw new Error("Failed to get response. Please try again.");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1) {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Save user message
    await saveMessage(userMessage);

    try {
      // Filter out welcome message for API call
      const welcomeContent = "Hello! I'm DiaCare AI, your diabetes health assistant. Ask me anything about diabetes management, blood sugar, diet, or lifestyle tips. How can I help you today?";
      const apiMessages = updatedMessages.filter(
        (m) => m.content !== welcomeContent
      );
      const assistantContent = await streamChat(apiMessages);
      
      // Save assistant response
      if (assistantContent) {
        await saveMessage({ role: "assistant", content: assistantContent });
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 gradient-bg rounded-full shadow-lg flex items-center justify-center text-white"
        style={{ boxShadow: "var(--shadow-primary)" }}
        aria-label="Toggle chat"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[550px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <motion.div
              className="gradient-bg px-4 py-4 flex items-center justify-between"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Bot size={22} className="text-white" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-white">DiaCare AI</h3>
                  <p className="text-xs text-white/80">Diabetes Health Assistant</p>
                </div>
              </div>
              <motion.button
                onClick={clearHistory}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Clear chat history"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Trash2 size={16} className="text-white/80" />
              </motion.button>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {isLoadingHistory ? (
                <motion.div
                  className="flex items-center justify-center h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-6 h-6 text-primary" />
                  </motion.div>
                </motion.div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 20, x: message.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      {message.role === "assistant" && (
                        <motion.div
                          className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.1, type: "spring", stiffness: 200 }}
                        >
                          <Bot size={14} className="text-white" />
                        </motion.div>
                      )}
                      <motion.div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          message.role === "user"
                            ? "gradient-bg text-white rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        {message.content}
                      </motion.div>
                      {message.role === "user" && (
                        <motion.div
                          className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.1, type: "spring", stiffness: 200 }}
                        >
                          <User size={14} className="text-secondary-foreground" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <motion.div
                      className="flex gap-2 justify-start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1">
                          {[0, 150, 300].map((delay, idx) => (
                            <motion.span
                              key={idx}
                              className="w-2 h-2 bg-primary/60 rounded-full"
                              animate={{
                                y: [0, -8, 0],
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: delay / 1000,
                                ease: "easeInOut",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Quick Questions */}
            <AnimatePresence>
              {messages.length <= 1 && !isLoadingHistory && (
                <motion.div
                  className="px-4 pb-3 border-t border-border bg-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs text-muted-foreground my-2 font-medium">Quick questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_QUESTIONS.map((question, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleSend(question)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 bg-muted hover:bg-primary/10 text-foreground hover:text-primary rounded-full transition-colors font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05, duration: 0.2 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {question}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <motion.div
              className="p-4 border-t border-border bg-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about diabetes..."
                  className="flex-1 px-4 py-2.5 bg-muted rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="rounded-full gradient-bg hover:opacity-90"
                  >
                    <Send size={18} />
                  </Button>
                </motion.div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Powered by AI • Not medical advice
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DiabetesChatbot;

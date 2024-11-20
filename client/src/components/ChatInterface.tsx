import type { Message, ChatVocabulary } from "@/types/chat"
import { useToast } from "@/components/ui/use-toast"
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendWebSocketMessage } from "../lib/websocket";
import { Send, Plus, ChevronDown, Loader2, MessageCircle, Languages, BookOpen, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from 'react-markdown';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { VocabularyCard } from "@/components/VocabularyCard";

import { VocabularyItem } from "@/types/vocabulary";

interface ChatVocabulary {
  word: string;
  translation: string;
  usage_type: '正式' | '口语' | '书面';
  example?: string;
  example_translation?: string;
  grammar_notes?: string;
  explanation?: string;
}

// Helper function to convert ChatVocabulary to VocabularyItem
function toVocabularyItem(vocab: ChatVocabulary): VocabularyItem {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    word: vocab.word,
    translation: vocab.translation,
    usage_type: vocab.usage_type,
    example: vocab.example || '',
    example_translation: vocab.example_translation || '',
    grammar_notes: vocab.grammar_notes || '',
    lastReviewed: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  translation?: string;
  explanation?: string;
  detectedVocabulary?: ChatVocabulary[];
  examples?: string[];
  input_language?: "chinese" | "spanish";
  timestamp?: string;
}

// Logging utility
const logChat = {
  message: (type: "sent" | "received", content: string) => 
    console.log(`Chat ${type}:`, content),
  vocabulary: (items: ChatVocabulary[]) => 
    console.log("Detected vocabulary:", items),
  error: (error: unknown) => 
    console.error("Chat error:", error)
};

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const response = await fetch("/api/chat/messages");
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      logChat.message("sent", content);
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();
      logChat.message("received", data.response.content);
      if (data.detectedVocabulary?.length > 0) {
        logChat.vocabulary(data.detectedVocabulary);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      setInput("");
    },
    onError: (error) => {
      logChat.error(error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsTyping(false);
      sendMessage.mutate(input);
      // Scroll to bottom immediately when sending message
      if (endRef.current) {
        endRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden border-0 rounded-none bg-background">
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex flex-col gap-3 relative w-full max-w-3xl mx-auto",
                  message.role === "user" ? "items-end" : "items-start"
                )}
              >
                <Card className={cn(
                  "w-full",
                  message.role === "user" ? "bg-primary/10" : "bg-accent"
                )}>
                  <div className="p-4 space-y-4">
                    {/* Original Message */}
                    <div className="flex items-start gap-2">
                      <MessageCircle className="h-5 w-5 mt-1 shrink-0" />
                      <p className="text-lg font-medium">{message.content}</p>
                    </div>
                    
                    {/* Translation if exists */}
                    {message.translation && (
                      <div className="flex items-start gap-2 pl-7">
                        <Languages className="h-5 w-5 mt-1 shrink-0 text-blue-500" />
                        <p className="text-base text-muted-foreground">{message.translation}</p>
                      </div>
                    )}
                    
                    {/* Explanation if exists */}
                    {message.explanation && (
                      <div className="flex items-start gap-2 pl-7 bg-accent/50 p-3 rounded-md">
                        <BookOpen className="h-5 w-5 mt-1 shrink-0 text-emerald-500" />
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {message.explanation}
                        </p>
                      </div>
                    )}

                    {/* Vocabulary Section */}
                    {message.detectedVocabulary && message.detectedVocabulary.length > 0 && (
                      <div className="pl-7 mt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Book className="h-5 w-5 text-amber-500" />
                          <p className="text-sm font-medium">Vocabulary:</p>
                        </div>
                        <div className="grid gap-2">
                          {message.detectedVocabulary.map((vocab, idx) => {
                            console.log("Detected vocabulary:", vocab);
                            const vocabItem = toVocabularyItem(vocab);
                            console.log("Converted vocabulary item:", vocabItem);
                            return (
                              <VocabularyCard
                                key={`${vocabItem.word}-${idx}`}
                                vocab={vocabItem}
                                onCardClick={(v) => {
                                  console.log("Vocabulary clicked:", v);
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </Card>
      
      <div className="sticky bottom-0 w-full bg-background border-t z-50 shadow-lg">
        <form onSubmit={handleSubmit} className="px-2 sm:px-4 py-2 sm:py-4 flex gap-2 max-w-2xl mx-auto items-end">
          <div className="flex-1 min-w-0">
            <Input 
              placeholder="输入消息..."
              value={input}
              onChange={handleTyping}
              disabled={sendMessage.isPending}
              className={cn(
                "resize-none min-h-[40px] max-h-[200px] w-full transition-all duration-200",
                "sm:min-h-[44px] sm:text-base text-sm py-2 px-3",
                "focus:ring-2 focus:ring-primary",
                isTyping ? "h-[80px] sm:h-[100px]" : "h-[40px] sm:h-[44px]"
              )}
            />
          </div>
          <Button 
            type="submit" 
            size="icon" 
            disabled={sendMessage.isPending}
            className={cn(
              "shrink-0 transition-all duration-200",
              isTyping ? "h-[80px] sm:h-[100px] w-[50px] sm:w-[60px]" : "h-[40px] sm:h-[44px] w-[40px] sm:w-[44px]"
            )}
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendWebSocketMessage } from "../lib/websocket";
import { Send, Plus, ChevronDown } from "lucide-react";
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
import { VocabularyTooltip } from "./VocabularyTooltip";

interface DetectedVocabulary {
  word: string;
  translation: string;
  colloquial: boolean;
  colloquial_indicator?: string;
  type: string;
  level: string;
  example: string;
  example_translation: string;
  context: string;
  grammar_notes: string;
}

interface Message {
  content: string;
  role: "user" | "assistant";
  detectedVocabulary: DetectedVocabulary[] | null;
  timestamp?: string;
}

// Logging utility
const logChat = {
  message: (type: "sent" | "received", content: string) => 
    console.log(`Chat ${type}:`, content),
  vocabulary: (items: DetectedVocabulary[]) => 
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

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const response = await fetch("/api/chat/messages");
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
  });

  useEffect(() => {
    const scrollToBottom = () => {
      if (endRef.current) {
        endRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    scrollToBottom();
    const observer = new ResizeObserver(scrollToBottom);
    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }
    return () => observer.disconnect();
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      setInput("");
      if (data.detectedVocabulary?.length > 0) {
        toast({
          title: "New vocabulary detected",
          description: `${data.detectedVocabulary.length} new words added to your vocabulary list`,
        });
      }
    },
  });

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col overflow-hidden border-0 rounded-none">
        <ScrollArea ref={scrollRef} className="flex-1 px-4">
          <div className="max-w-2xl mx-auto py-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>
            <div ref={endRef} />
          </div>
        </ScrollArea>

        <Separator />
        
        <div className="p-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) sendMessage.mutate(input);
          }} className="flex gap-2">
            <Input 
              placeholder="输入消息..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              disabled={sendMessage.isPending}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={sendMessage.isPending || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

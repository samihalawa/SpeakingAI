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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage.mutate(input);
      // Scroll to bottom immediately when sending message
      if (endRef.current) {
        endRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="h-[600px] flex flex-col relative">
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col space-y-4">
          {messages.map((message, i) => (
            <div 
              key={i} 
              className={`max-w-[80%] ${
                message.role === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              <Card className={`${
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={message.role === "user" ? "/user-avatar.png" : "/bot-avatar.png"}
                        alt={message.role === "user" ? "User" : "Bot"}
                      />
                      <AvatarFallback>{message.role === "user" ? "U" : "B"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      {message.content.split('\n\n').map((part, index) => (
                        <div 
                          key={index}
                          className={`${
                            index === 0 ? 'text-base' : 'text-sm text-muted-foreground'
                          }`}
                        >
                          <ReactMarkdown className="prose prose-sm dark:prose-invert">
                            {part}
                          </ReactMarkdown>
                        </div>
                      ))}
                    </div>
                  </div>
                  <AnimatePresence>
                    {message.role === "assistant" && message.detectedVocabulary && message.detectedVocabulary.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-3 bg-accent rounded-md text-sm"
                    >
                      <div className="font-medium mb-2">
                        New Vocabulary:
                      </div>
                      {message.detectedVocabulary.map((vocab, index) => (
                        <motion.div
                          key={vocab.word}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.15 }}
                          className="mb-2 last:mb-0"
                        >
                          <div className="relative">
                            <div className="flex items-center justify-between">
                              <div className="p-2 bg-background rounded-md cursor-help">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{vocab.word}</span>
                                  <span>-</span>
                                  <span>{vocab.translation}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newVocab = {
                                    spanish: vocab.word,
                                    chinese: vocab.translation,
                                    example: vocab.example,
                                    notes: `${vocab.grammar_notes}\n${vocab.context}`,
                                    wordType: vocab.type.toLowerCase(),
                                    difficulty: vocab.level.toLowerCase(),
                                    tags: vocab.colloquial ? ['colloquial'] : [],
                                  };

                                  toast({
                                    title: "Adding vocabulary...",
                                    description: (
                                      <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2"
                                      >
                                        <span>{vocab.word}</span>
                                        <ChevronDown className="h-4 w-4" />
                                        <span>{vocab.translation}</span>
                                      </motion.div>
                                    ),
                                  });

                                  fetch("/api/vocabulary", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(newVocab),
                                  })
                                    .then((response) => response.json())
                                    .then((data) => {
                                      toast({
                                        title: "Success",
                                        description: (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-green-600"
                                          >
                                            Word added to vocabulary successfully!
                                          </motion.div>
                                        ),
                                      });
                                      sendWebSocketMessage({
                                        type: "vocabulary_update",
                                        item: data,
                                      });
                                      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
                                    })
                                    .catch(() => {
                                      toast({
                                        title: "Error",
                                        description: "Failed to add word",
                                        variant: "destructive",
                                      });
                                    });
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add to Vocabulary
                              </Button>
                            </div>
                            <div className="mt-2 p-2 bg-accent/10 rounded-md">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{vocab.type}</span>
                                  {vocab.colloquial && (
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">
                                      {vocab.colloquial_indicator || '口语'}
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs">
                                    {vocab.level}
                                  </span>
                                </div>
                                <div>
                                  <p className="italic">{vocab.example}</p>
                                  <p className="text-muted-foreground">{vocab.example_translation}</p>
                                </div>
                                {vocab.context && (
                                  <p className="text-muted-foreground">{vocab.context}</p>
                                )}
                                {vocab.grammar_notes && (
                                  <p className="text-muted-foreground">{vocab.grammar_notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </Card>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button 
              disabled={sendMessage.isPending}
              type="submit"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

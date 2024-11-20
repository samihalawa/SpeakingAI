import { useState } from "react";
import { Card } from "@/components/ui/card";
import { sendWebSocketMessage } from "../lib/websocket";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface DetectedVocabulary {
  word: string;
  translation: string;
  type: string;
  level: string;
  example: string;
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

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const response = await fetch("/api/chat/messages");
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
  });

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
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.map((message, i) => (
          <Card
            key={i}
            className={`p-4 max-w-[80%] ${
              message.role === "user"
                ? "ml-auto bg-[#E25822] text-white"
                : "bg-[#FBD38D]"
            }`}
          >
            <div className="space-y-2">
              <p>{message.content}</p>
              {message.role === "assistant" && message.detectedVocabulary && message.detectedVocabulary.length > 0 && (
                <div className="text-sm mt-2 p-2 bg-accent/50 rounded">
                  <p className="font-semibold mb-1">New Vocabulary:</p>
                  {message.detectedVocabulary?.map((vocab) => (
                    <div
                      key={vocab.word}
                      className="flex items-center justify-between gap-2 mb-1 group relative"
                    >
                      <div
                        className="hover:bg-accent/80 p-1 rounded cursor-help"
                        data-tooltip-id={`tooltip-${vocab.word}`}
                      >
                        <span className="font-medium">{vocab.word}</span>
                        <span className="mx-2">-</span>
                        <span>{vocab.translation}</span>
                        <div
                          className="absolute hidden group-hover:block bg-white border p-2 rounded shadow-lg z-10 -top-2 left-full ml-2 w-80"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-primary">{vocab.type}</p>
                              <span className="text-sm px-2 py-1 bg-accent rounded">{vocab.level}</span>
                            </div>
                            <p className="text-sm">{vocab.example}</p>
                            <p className="text-sm text-gray-600">{vocab.context}</p>
                            <p className="text-sm text-gray-600">{vocab.grammar_notes}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newVocab = {
                            spanish: vocab.word,
                            chinese: vocab.translation,
                            example: vocab.example,
                          };
                          fetch("/api/vocabulary", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(newVocab),
                          })
                            .then((response) => response.json())
                            .then((data) => {
                              toast({
                                title: "Success",
                                description: "Word added to vocabulary",
                              });
                              sendWebSocketMessage({
                                type: "vocabulary_update",
                                item: data,
                              });
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
                        Add to Vocabulary
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" disabled={sendMessage.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

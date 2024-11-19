import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface DetectedVocabulary {
  word: string;
  translation: string;
}

interface Message {
  content: string;
  role: "user" | "assistant";
  detectedVocabulary: DetectedVocabulary[] | null;
}

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
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      setInput("");
    },
    onError: () => {
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
              {message.role === "assistant" && message.detectedVocabulary?.length > 0 && (
                <div className="text-sm mt-2 p-2 bg-accent/50 rounded">
                  <p className="font-semibold mb-1">Vocabulary:</p>
                  {message.detectedVocabulary.map(({ word, translation }) => (
                    <p key={word} className="text-sm">
                      {word} - {translation}
                    </p>
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

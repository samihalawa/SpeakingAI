import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const response = await fetch("/api/chat/messages");
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
  });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end" 
      });
    }
  };

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ensure scroll on initial load
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setIsTyping(e.target.value.length > 0);
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new typing timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input.trim();
    setInput("");
    setIsTyping(false);

    try {
      // Add optimistic update
      queryClient.setQueryData<Message[]>(["chat-messages"], (old = []) => [
        ...old,
        { id: Date.now().toString(), content: currentInput, role: "user" }
      ]);

      // Scroll to bottom immediately after sending
      setTimeout(scrollToBottom, 50);

      // Process the message
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      
      // Ensure scroll to bottom after response
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      logChat.error(error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-background">
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pb-[100px] pt-4 px-4 space-y-6"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex flex-col max-w-[85%] space-y-2",
              message.role === "user" ? "ml-auto" : "mr-auto"
            )}
          >
            <div className={cn(
              "rounded-lg px-4 py-2",
              message.role === "user" 
                ? "bg-primary text-primary-foreground ml-auto" 
                : "bg-muted"
            )}>
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-background border-t z-50 shadow-lg">
        <form 
          onSubmit={handleSubmit} 
          className="container max-w-2xl mx-auto px-4 py-2 flex gap-2 items-end"
        >
          <div className="flex-1 min-w-0">
            <Input 
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={handleTyping}
              className={cn(
                "min-h-[44px] transition-all duration-200",
                "text-base py-2 px-3",
                "focus:ring-2 focus:ring-primary",
                "rounded-full"
              )}
            />
          </div>
          <Button 
            type="submit" 
            size="icon"
            className="rounded-full h-[44px] w-[44px] bg-primary hover:bg-primary/90"
            disabled={!input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

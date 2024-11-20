import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ChatInterface } from "./ChatInterface";
import { VocabularyList } from "./VocabularyList";
import { Button } from "@/components/ui/button";
import { MessageSquare, Book } from "lucide-react";

export function SplitLayout() {
  const [activeView, setActiveView] = useState<"chat" | "vocabulary">("chat");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return (
      <div className="h-screen grid grid-cols-[1fr_400px]">
        <ChatInterface />
        <VocabularyList />
      </div>
    );
  }

  return (
    <div className="h-screen relative">
      <div className="absolute inset-x-0 top-0 z-10 p-2 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex justify-center gap-2">
          <Button
            variant={activeView === "chat" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("chat")}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            聊天
          </Button>
          <Button
            variant={activeView === "vocabulary" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("vocabulary")}
          >
            <Book className="h-4 w-4 mr-2" />
            词汇
          </Button>
        </div>
      </div>

      <div className="h-full pt-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: activeView === "chat" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeView === "chat" ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeView === "chat" ? <ChatInterface /> : <VocabularyList />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

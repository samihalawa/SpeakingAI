import { IonContent, IonPage, IonSplitPane } from "@ionic/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatInterface } from "./ChatInterface";
import { VocabularyList } from "./VocabularyList";

export function SplitLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeView, setActiveView] = useState<"chat" | "vocabulary">("chat");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) {
    return (
      <IonPage>
        <IonContent>
          <IonSplitPane contentId="main" when="md">
            <div className="w-1/2 h-full border-r">
              <ChatInterface />
            </div>
            <div id="main" className="w-1/2 h-full">
              <VocabularyList />
            </div>
          </IonSplitPane>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent>
        <div className="h-full">
          <div className="flex justify-center gap-4 p-4 bg-background border-b">
            <button
              className={`px-4 py-2 rounded-full transition-colors ${
                activeView === "chat" ? "bg-primary text-white" : "bg-gray-100"
              }`}
              onClick={() => setActiveView("chat")}
            >
              Chat
            </button>
            <button
              className={`px-4 py-2 rounded-full transition-colors ${
                activeView === "vocabulary" ? "bg-primary text-white" : "bg-gray-100"
              }`}
              onClick={() => setActiveView("vocabulary")}
            >
              Vocabulary
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: activeView === "chat" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeView === "chat" ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className="h-[calc(100%-4rem)]"
            >
              {activeView === "chat" ? <ChatInterface /> : <VocabularyList />}
            </motion.div>
          </AnimatePresence>
        </div>
      </IonContent>
    </IonPage>
  );
}

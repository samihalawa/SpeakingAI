import { IonContent, IonPage, IonSplitPane } from "@ionic/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { ChatInterface } from "./ChatInterface";
import { VocabularyList } from "./VocabularyList";
import { ErrorBoundary } from "./ui/ErrorBoundary";

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
              <ErrorBoundary
                fallback={
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2">Chat Interface Error</h2>
                    <p className="text-gray-600">There was an error loading the chat interface. Please try refreshing the page.</p>
                  </div>
                }
              >
                <ChatInterface />
              </ErrorBoundary>
            </div>
            <div id="main" className="w-1/2 h-full">
              <ErrorBoundary
                fallback={
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2">Vocabulary List Error</h2>
                    <p className="text-gray-600">There was an error loading the vocabulary list. Please try refreshing the page.</p>
                  </div>
                }
              >
                <VocabularyList />
              </ErrorBoundary>
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
          {/* Navigation is handled through the dropdown menu in Navigation.tsx */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: activeView === "chat" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeView === "chat" ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className="h-[calc(100%-4rem)]"
            >
              <ErrorBoundary
                fallback={
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2">Component Error</h2>
                    <p className="text-gray-600">There was an error loading the {activeView} view. Please try refreshing the page.</p>
                  </div>
                }
              >
                {activeView === "chat" ? <ChatInterface /> : <VocabularyList />}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </IonContent>
    </IonPage>
  );
}

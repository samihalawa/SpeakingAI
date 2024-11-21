import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "./pages/HomePage";
import VocabularyPage from "./pages/VocabularyPage";
import Navigation from "./components/Navigation";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./index.css";

import { IonApp, IonContent, setupIonicReact } from "@ionic/react";

setupIonicReact();

function Router() {
  return (
    <IonApp>
      <div className="min-h-screen bg-background">
        <Navigation />
        <IonContent>
          <main className="container mx-auto px-4 py-8">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/vocabulary" component={VocabularyPage} />
              <Route>404 Page Not Found</Route>
            </Switch>
          </main>
        </IonContent>
        <Toaster />
      </div>
    </IonApp>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  </StrictMode>
);

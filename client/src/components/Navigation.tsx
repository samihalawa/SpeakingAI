import { Link } from "wouter";
import { BookOpen, MessageSquare } from "lucide-react";

import { IonHeader, IonToolbar, IonTitle } from "@ionic/react";

export default function Navigation() {
  return (
    <IonHeader>
      <IonToolbar color="primary" className="border-b bg-[#1B4965]">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/">
              <a className="text-2xl font-bold text-white">¡Aprende!</a>
            </Link>
            <div className="flex gap-6">
              <Link href="/">
                <a className="flex items-center gap-2 text-white hover:text-[#F2CC8F] transition-colors">
                  <MessageSquare className="h-5 w-5" />
                  Chat
                </a>
              </Link>
              <Link href="/vocabulary">
                <a className="flex items-center gap-2 text-white hover:text-[#F2CC8F] transition-colors">
                  <BookOpen className="h-5 w-5" />
                  Vocabulary
                </a>
              </Link>
            </div>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
}

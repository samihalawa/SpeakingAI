import { Link } from "wouter";
import { BookOpen, MessageSquare } from "lucide-react";

export default function Navigation() {
  return (
    <nav className="border-b bg-[#E25822]/10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold text-[#E25822]">¡Aprende!</a>
          </Link>
          <div className="flex gap-6">
            <Link href="/">
              <a className="flex items-center gap-2 hover:text-[#E25822] transition-colors">
                <MessageSquare className="h-5 w-5" />
                Chat
              </a>
            </Link>
            <Link href="/vocabulary">
              <a className="flex items-center gap-2 hover:text-[#E25822] transition-colors">
                <BookOpen className="h-5 w-5" />
                Vocabulary
              </a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

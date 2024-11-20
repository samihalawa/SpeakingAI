import { Link } from "wouter";
import { BookOpen, MessageSquare, Menu } from "lucide-react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const NavLinks = () => (
    <>
      <Link href="/">
        <a className="flex items-center gap-2 text-white hover:text-[#F2CC8F] transition-colors">
          <MessageSquare className="h-5 w-5" />
          <span>Chat</span>
        </a>
      </Link>
      <Link href="/vocabulary">
        <a className="flex items-center gap-2 text-white hover:text-[#F2CC8F] transition-colors">
          <BookOpen className="h-5 w-5" />
          <span>Vocabulary</span>
        </a>
      </Link>
    </>
  );

  return (
    <header className="border-b bg-[#1B4965] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold text-white hover:text-[#F2CC8F] transition-colors">
              ¡Aprende!
            </a>
          </Link>
          
          {isMobile ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="rounded-full w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  aria-label="Navigation menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[200px] bg-white rounded-lg shadow-lg p-2 animate-in slide-in-from-top-2"
                  sideOffset={5}
                >
                  <DropdownMenu.Item className="p-2 outline-none cursor-pointer rounded hover:bg-gray-100">
                    <Link href="/">
                      <a className="flex items-center gap-2 text-gray-700">
                        <MessageSquare className="h-5 w-5" />
                        Chat
                      </a>
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="p-2 outline-none cursor-pointer rounded hover:bg-gray-100">
                    <Link href="/vocabulary">
                      <a className="flex items-center gap-2 text-gray-700">
                        <BookOpen className="h-5 w-5" />
                        Vocabulary
                      </a>
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <nav className="flex gap-6">
              <NavLinks />
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

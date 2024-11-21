/**
 * Navigation Component
 * 
 * A responsive navigation bar component that adapts to both desktop and mobile views.
 * Uses Radix UI's DropdownMenu for accessible mobile navigation.
 * 
 * Features:
 * - Responsive design with mobile-first approach
 * - Accessible keyboard navigation
 * - Animated transitions
 * - ARIA-compliant markup
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * import Navigation from './Navigation';
 * 
 * function App() {
 *   return <Navigation />;
 * }
 * 
 * // The component will automatically handle responsive behavior
 * ```
 */

import { Link } from "wouter";
import { BookOpen, MessageSquare, Menu } from "lucide-react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";

const menuAnimation = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 }
};

export default function Navigation() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const NavLinks = () => (
    <>
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Link href="/" className="flex items-center gap-2 text-primary-foreground hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-md" role="menuitem">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
              <span>Chat</span>
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm">
              Practice Spanish conversation
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Link href="/vocabulary" className="flex items-center gap-2 text-primary-foreground hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-md" role="menuitem">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              <span>Vocabulary</span>
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm">
              Manage your vocabulary list
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </>
  );

  return (
    <header className="border-b bg-primary sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold transition-colors bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text hover:opacity-80">
            Kitty外语AI
          </Link>
          
          {isMobile ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="rounded-full w-10 h-10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
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
                    <Link href="/" className="flex items-center gap-2 text-gray-700 w-full text-left">
                      <MessageSquare className="h-5 w-5" />
                      Chat
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="p-2 outline-none cursor-pointer rounded hover:bg-gray-100">
                    <Link href="/vocabulary" className="flex items-center gap-2 text-gray-700 w-full text-left">
                      <BookOpen className="h-5 w-5" />
                      Vocabulary
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

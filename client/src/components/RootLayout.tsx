import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query"

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <QueryClientProvider client={queryClient}>
        <div className={cn(
          "min-h-screen bg-background font-sans antialiased",
          "flex flex-col"
        )}>
          <main className="flex flex-col flex-1 min-h-0">{children}</main>
          <Toaster />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  )
} 
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Book } from "lucide-react"
import { ChatInterface } from "./ChatInterface"
import { VocabularyList } from "./VocabularyList"

export function Layout() {
  const [showVocabulary, setShowVocabulary] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <div className={cn(
      "flex-1 grid overflow-hidden",
      isDesktop ? "grid-cols-[1fr_400px]" : "grid-cols-1"
    )}>
      <ChatInterface />
      {(isDesktop || showVocabulary) && (
        <VocabularyList />
      )}
      
      {!isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-10"
          onClick={() => setShowVocabulary(!showVocabulary)}
        >
          <Book className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
} 
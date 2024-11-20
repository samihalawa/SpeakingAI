import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function Layout() {
  const [showVocabulary, setShowVocabulary] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <div className={cn(
      "h-screen grid",
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
          className="fixed bottom-4 right-4"
          onClick={() => setShowVocabulary(!showVocabulary)}
        >
          <Book className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
} 
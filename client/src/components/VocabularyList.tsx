import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { motion } from "framer-motion"
import { VocabularyDialog } from "@/components/ui/VocabularyDialog"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

interface VocabularyItem {
  id: string;
  spanish: string;
  chinese: string;
  type?: string;
  example?: string;
  notes?: string;
}

export function VocabularyList() {
  const [selectedItem, setSelectedItem] = useState<VocabularyItem | null>(null);

  const { data: vocabularyItems = [] } = useQuery<VocabularyItem[]>({
    queryKey: ["vocabulary"],
    queryFn: async () => {
      const response = await fetch("/api/vocabulary");
      if (!response.ok) throw new Error("Failed to fetch vocabulary");
      return response.json();
    },
  });
  return (
    <Card className="h-screen flex flex-col overflow-hidden border-0 rounded-none">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">词汇表</h2>
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <motion.div 
          layout
          className="space-y-2"
        >
          {vocabularyItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <HoverCard>
                <HoverCardTrigger>
                  <Card className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.spanish}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.chinese}
                        </p>
                      </div>
                      <Badge>{item.type}</Badge>
                    </div>
                  </Card>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="p-3">
                    <p className="font-medium mb-2">Example:</p>
                    <p className="text-sm text-muted-foreground">{item.example}</p>
                    {item.notes && (
                      <>
                        <p className="font-medium mb-2 mt-4">Notes:</p>
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      </>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>
    </Card>
  )
}

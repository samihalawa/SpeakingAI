import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

export function VocabularyList() {
  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 rounded-none">
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
                  <VocabularyDetail item={item} />
                </HoverCardContent>
              </HoverCard>
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>
    </Card>
  )
}

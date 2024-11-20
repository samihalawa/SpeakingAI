import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { VocabularyDialog } from "@/components/ui/VocabularyDialog"
import { VocabularySearch } from "@/components/VocabularySearch"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { filterVocabulary } from "@/lib/vocabulary"

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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'spanish' | 'chinese' | 'lastReviewed'>('spanish');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: vocabularyItems = [], refetch } = useQuery<VocabularyItem[]>({
    queryKey: ["vocabulary"],
    queryFn: async () => {
      const response = await fetch("/api/vocabulary");
      if (!response.ok) throw new Error("Failed to fetch vocabulary");
      return response.json();
    },
  });

  const filteredItems = filterVocabulary({
    searchTerm,
    sortBy,
    sortOrder,
  });

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/vocabulary/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete vocabulary item');
      refetch();
    } catch (error) {
      console.error('Error deleting vocabulary item:', error);
    }
  };
  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 rounded-none">
      <VocabularySearch 
        onSearch={setSearchTerm}
        onSortChange={(sortBy, order) => {
          setSortBy(sortBy as 'spanish' | 'chinese' | 'lastReviewed');
          setSortOrder(order);
        }}
      />

      <ScrollArea className="flex-1 p-4">
        <motion.div 
          layout
          className="space-y-2"
        >
          {filteredItems.map((item) => (
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
                      <div className="flex items-center gap-2">
                        <Badge>{item.type}</Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
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

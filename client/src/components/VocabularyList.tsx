import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SortAsc } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VocabularyDialog } from "./VocabularyDialog";

export function VocabularyList() {
  const [search, setSearch] = useState("");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  
  const { data: vocabulary = [] } = useQuery({
    queryKey: ["vocabulary"],
    queryFn: async () => {
      const response = await fetch("/api/vocabulary");
      if (!response.ok) throw new Error("Failed to fetch vocabulary");
      return response.json();
    },
  });

  const filteredVocabulary = vocabulary.filter(item =>
    item.spanish.toLowerCase().includes(search.toLowerCase()) ||
    item.chinese.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 rounded-none">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索词汇..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <SortAsc className="mr-2 h-4 w-4" />
                按日期排序
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          <AnimatePresence initial={false}>
            {filteredVocabulary.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedWord(item.spanish)}
                className="cursor-pointer"
              >
                <Card className="p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.spanish}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.chinese}
                      </p>
                    </div>
                    <Badge>{item.type || 'noun'}</Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <VocabularyDialog
        word={vocabulary.find(v => v.spanish === selectedWord)}
        isOpen={!!selectedWord}
        onClose={() => setSelectedWord(null)}
      />
    </Card>
  );
}

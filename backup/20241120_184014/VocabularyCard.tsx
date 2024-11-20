import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { VocabularyItem } from "@/types/vocabulary";

interface Props {
  vocab: VocabularyItem;
  onCardClick: (vocab: VocabularyItem) => void;
}

export function VocabularyCard({ vocab, onCardClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card 
        className="p-4 hover:bg-accent/60 transition-all cursor-pointer group"
        onClick={() => onCardClick(vocab)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{vocab.word}</h3>
              <span className={`text-sm px-2 py-0.5 rounded-full ${
                vocab.usage_type === '正式' ? 'bg-blue-100 text-blue-700' :
                vocab.usage_type === '口语' ? 'bg-green-100 text-green-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {vocab.usage_type}
              </span>
            </div>
            <p className="text-muted-foreground">{vocab.translation}</p>
            {vocab.example && (
              <p className="text-sm text-muted-foreground mt-2 truncate">
                {vocab.example}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Card>
    </motion.div>
  );
}

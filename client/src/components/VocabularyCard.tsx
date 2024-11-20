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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="p-4 hover:bg-accent/60 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        onClick={() => onCardClick(vocab)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{vocab.word}</h3>
              <span className={`text-sm px-2 py-0.5 rounded-full ${
                vocab.usage_type === '正式' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' :
                vocab.usage_type === '口语' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' :
                'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
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

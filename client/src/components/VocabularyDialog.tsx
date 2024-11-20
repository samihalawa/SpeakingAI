import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { VocabularyItem } from "@/types/vocabulary";

interface Props {
  vocab: VocabularyItem;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function VocabularyDialog({ vocab, isOpen, onClose, onEdit, onDelete }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{vocab.word}</span>
              <Badge variant={
                vocab.usage_type === '正式' ? 'default' :
                vocab.usage_type === '口语' ? 'secondary' : 'outline'
              }>
                {vocab.usage_type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="icon" onClick={onEdit}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        <motion.div 
          className="space-y-6 py-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Translation */}
          <div className="space-y-2">
            <h4 className="font-medium">Translation</h4>
            <p className="text-muted-foreground">{vocab.translation}</p>
          </div>

          {/* Example */}
          {vocab.example && (
            <div className="space-y-2">
              <h4 className="font-medium">Example</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p>{vocab.example}</p>
                {vocab.example_translation && (
                  <p className="text-muted-foreground">{vocab.example_translation}</p>
                )}
              </div>
            </div>
          )}

          {/* Grammar Notes */}
          {vocab.grammar_notes && (
            <div className="space-y-2">
              <h4 className="font-medium">Grammar Notes</h4>
              <div className="bg-blue-50 text-blue-900 p-4 rounded-lg">
                <p>{vocab.grammar_notes}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t text-sm text-muted-foreground">
            <p>Last reviewed: {new Date(vocab.lastReviewed).toLocaleDateString()}</p>
            <p>Added: {new Date(vocab.createdAt).toLocaleDateString()}</p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

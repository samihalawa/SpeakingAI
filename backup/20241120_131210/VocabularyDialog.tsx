import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Edit2, Trash2 } from "lucide-react";
import { VocabularyItem } from "@/types/chat";
import { motion } from "framer-motion";

interface VocabularyDialogProps {
  vocab: VocabularyItem;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function VocabularyDialog({ vocab, isOpen, onClose, onEdit, onDelete }: VocabularyDialogProps) {
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
          transition={{ duration: 0.2 }}
        >
          {/* Translation */}
          <div className="space-y-2">
            <Label className="text-primary">Translation</Label>
            <p className="text-lg">{vocab.translation}</p>
          </div>
          
          {/* Example */}
          {vocab.example && (
            <div className="space-y-2">
              <Label className="text-primary">Example</Label>
              <div className="bg-accent/50 p-4 rounded-md space-y-2">
                <p className="text-base">{vocab.example}</p>
                <p className="text-sm text-muted-foreground">{vocab.example_translation}</p>
              </div>
            </div>
          )}
          
          {/* Grammar Notes */}
          {vocab.grammar_notes && (
            <div className="space-y-2">
              <Label className="text-blue-600">Grammar Notes</Label>
              <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{vocab.grammar_notes}</p>
              </div>
            </div>
          )}

          {/* Explanation */}
          {vocab.explanation && (
            <div className="space-y-2">
              <Label className="text-emerald-600">Usage Notes</Label>
              <div className="bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{vocab.explanation}</p>
              </div>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

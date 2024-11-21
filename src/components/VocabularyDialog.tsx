import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Volume2, Star, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { VocabularyItem } from "@/types/vocabulary";

interface Props {
  vocab: VocabularyItem;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function VocabularyDialog({ vocab, isOpen, onClose, onEdit, onDelete }: Props) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDelete = () => {
    onDelete?.();
    setShowDeleteAlert(false);
    onClose();
  };

  const playAudio = () => {
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(vocab.word);
    utterance.lang = 'es-ES';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{vocab.word}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isPlaying ? 'animate-pulse' : ''}`}
                  onClick={playAudio}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Badge variant={
                  vocab.usage_type === '正式' ? 'default' :
                  vocab.usage_type === '口语' ? 'secondary' : 'outline'
                }>
                  {vocab.usage_type}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      onEdit();
                      onClose();
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteAlert(true)}
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
              <h4 className="font-medium flex items-center gap-2">
                Translation
              </h4>
              <p className="text-muted-foreground">{vocab.translation}</p>
            </div>

            {/* Explanation */}
            {vocab.explanation && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h4 className="font-medium">Explanation</h4>
                <div className="bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{vocab.explanation}</p>
                </div>
              </motion.div>
            )}

            {/* Example */}
            {vocab.example && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h4 className="font-medium">Example</h4>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm italic">{vocab.example}</p>
                  {vocab.example_translation && (
                    <p className="text-sm text-muted-foreground">{vocab.example_translation}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Grammar Notes */}
            {vocab.grammar_notes && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h4 className="font-medium">Grammar Notes</h4>
                <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                  <p className="text-sm">{vocab.grammar_notes}</p>
                </div>
              </motion.div>
            )}

            {/* Usage Notes */}
            {vocab.usage_notes && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h4 className="font-medium">Usage Notes</h4>
                <div className="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-lg">
                  <p className="text-sm">{vocab.usage_notes}</p>
                </div>
              </motion.div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t flex justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Added: {new Date(vocab.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>Last reviewed: {new Date(vocab.lastReviewed).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vocabulary Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{vocab.word}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import * as Dialog from '@radix-ui/react-dialog';
import * as HoverCard from '@radix-ui/react-hover-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Cross2Icon } from '@radix-ui/react-icons';

interface VocabularyDialogProps {
  word: {
    spanish: string;
    chinese: string;
    example?: string;
    notes?: string;
    wordType?: string;
    difficulty?: string;
    tags?: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export function VocabularyDialog({ word, isOpen, onClose }: VocabularyDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-lg max-h-[85vh] overflow-y-auto focus:outline-none"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Dialog.Title className="text-xl font-bold mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>{word.spanish}</span>
                    <span className="text-gray-400">-</span>
                    <span>{word.chinese}</span>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
                      aria-label="Close"
                    >
                      <Cross2Icon className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </Dialog.Title>
                
                <div className="space-y-4">
                  {word.example && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium mb-2">Example:</h3>
                      <p className="text-gray-700">{word.example}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {word.wordType && (
                      <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {word.wordType}
                          </span>
                        </HoverCard.Trigger>
                        <HoverCard.Portal>
                          <HoverCard.Content className="bg-white p-2 rounded shadow-lg text-sm">
                            Word type
                            <HoverCard.Arrow className="fill-white" />
                          </HoverCard.Content>
                        </HoverCard.Portal>
                      </HoverCard.Root>
                    )}
                    
                    {word.difficulty && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {word.difficulty}
                      </span>
                    )}
                    
                    {word.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {word.notes && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium mb-2">Notes:</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{word.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

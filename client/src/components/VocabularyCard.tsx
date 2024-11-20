import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface DetectedVocabulary {
  word: string;
  translation: string;
  usage_type: '正式' | '口语' | '习语';
  explanation: string;
  example: string;
  example_translation: string;
  grammar_notes: string;
}

interface Message {
  content: string;
  role: "user" | "assistant";
  detectedVocabulary: DetectedVocabulary[] | null;
  explanation?: string;
  timestamp?: string;
}

interface VocabularyCardProps {
  message: Message;
}

export function VocabularyCard({ message }: VocabularyCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  const toggleCard = (index: number) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const addToVocabulary = useMutation({
    mutationFn: async (vocabulary: DetectedVocabulary) => {
      const response = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          spanish: vocabulary.word,
          chinese: vocabulary.translation,
          example: `${vocabulary.example}\n${vocabulary.example_translation}`,
          notes: `用法: ${vocabulary.usage_type}\n解释: ${vocabulary.explanation}\n语法: ${vocabulary.grammar_notes}`,
          wordType: vocabulary.usage_type === '正式' ? 'formal' : vocabulary.usage_type === '口语' ? 'colloquial' : 'idiom',
          difficulty: 'intermediate'
        }),
      });
      if (!response.ok) throw new Error("Failed to add vocabulary");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      toast({ title: "Success", description: "Word added to vocabulary" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add word to vocabulary",
        variant: "destructive",
      });
    },
  });

  if (!message.detectedVocabulary?.length) return null;

  return (
    <div className="w-full space-y-2 mt-2">
      {message.detectedVocabulary.map((vocab, index) => (
        <motion.div
          key={`${vocab.word}-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="group relative"
        >
          <Card 
            className="p-4 bg-accent/50 hover:bg-accent/60 transition-colors"
            onClick={() => toggleCard(index)}
            role="button"
            tabIndex={0}
            aria-expanded={expandedCards[index]}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleCard(index);
              }
            }}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                {/* Word and Translation - Always visible */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-lg tracking-wide">{vocab.word}</p>
                      <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${
                        vocab.usage_type === '正式' ? 'bg-blue-100 text-blue-700' :
                        vocab.usage_type === '口语' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {vocab.usage_type}
                      </span>
                    </div>
                    <p className="text-base text-muted-foreground font-medium">
                      {vocab.translation}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedCards[index] ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted-foreground"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </div>

                {/* Expandable Content */}
                <AnimatePresence initial={false}>
                  {expandedCards[index] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 mt-4 pt-4 border-t">
                        {/* Explanation */}
                        {vocab.explanation && (
                          <div className="bg-background/80 p-3 rounded-md border border-border/50">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {vocab.explanation}
                            </p>
                          </div>
                        )}

                        {/* Example */}
                        {vocab.example && (
                          <div className="space-y-2 bg-primary/5 p-3 rounded-md">
                            <p className="text-sm font-medium text-primary">例句:</p>
                            <div className="pl-2 border-l-2 border-primary/20">
                              <p className="text-sm font-medium">{vocab.example}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {vocab.example_translation}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Grammar Notes */}
                        {vocab.grammar_notes && (
                          <div className="bg-blue-50/80 p-3 rounded-md border border-blue-100">
                            <p className="text-sm font-medium mb-2 text-blue-700">语法笔记:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {vocab.grammar_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={() => addToVocabulary.mutate(vocab)}
              >
                <Plus className="h-4 w-4 mr-2" />
                加入词库
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

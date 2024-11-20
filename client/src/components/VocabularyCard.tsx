import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
          <Card className="p-4 bg-accent/50">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-3">
                {/* Word and Translation */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-lg">{vocab.word}</p>
                    <span className="text-sm px-2 py-0.5 bg-primary/10 rounded-full">
                      {vocab.usage_type}
                    </span>
                  </div>
                  <p className="text-base text-muted-foreground">
                    {vocab.translation}
                  </p>
                </div>

                {/* Explanation */}
                {vocab.explanation && (
                  <div className="bg-background/50 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {vocab.explanation}
                    </p>
                  </div>
                )}

                {/* Example */}
                {vocab.example && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">例句:</p>
                    <p className="text-sm">{vocab.example}</p>
                    <p className="text-sm text-muted-foreground">
                      {vocab.example_translation}
                    </p>
                  </div>
                )}

                {/* Grammar Notes */}
                {vocab.grammar_notes && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">语法笔记:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {vocab.grammar_notes}
                    </p>
                  </div>
                )}
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

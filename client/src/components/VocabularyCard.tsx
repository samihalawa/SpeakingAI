import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface DetectedVocabulary {
  word: string;
  translation: string;
  colloquial: boolean;
  colloquial_indicator?: string;
  type: string;
  level: string;
  example: string;
  example_translation: string;
  context: string;
  grammar_notes: string;
}

interface Message {
  content: string;
  role: "user" | "assistant";
  detectedVocabulary: DetectedVocabulary[] | null;
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spanish: vocabulary.word,
          chinese: vocabulary.translation,
          example: vocabulary.example,
          notes: vocabulary.grammar_notes,
          type: vocabulary.type,
          level: vocabulary.level
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
          <Card className="p-3 bg-accent/50">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{vocab.word}</p>
                <p className="text-sm text-muted-foreground">
                  {vocab.translation}
                </p>
                {vocab.example && (
                  <p className="text-sm mt-2 text-muted-foreground">
                    {vocab.example}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => addToVocabulary.mutate(vocab)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Vocabulary
              </Button>
            </div>
            {vocab.colloquial && (
              <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                {vocab.colloquial_indicator}
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

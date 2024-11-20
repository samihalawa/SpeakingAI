import { z } from "zod";

export interface VocabularyItem {
  word: string;
  translation: string;
  usage_type: '正式' | '口语' | '习语';
  explanation: string;
  example: string;
  example_translation: string;
  grammar_notes: string;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  translation?: string;
  explanation?: string;
  detectedVocabulary?: VocabularyItem[];
  timestamp?: string;
  input_language?: "chinese" | "spanish";
}

export const vocabularySchema = z.object({
  word: z.string(),
  translation: z.string(),
  usage_type: z.enum(['正式', '口语', '习语']),
  explanation: z.string(),
  example: z.string(),
  example_translation: z.string(),
  grammar_notes: z.string()
});

export type VocabularyFormData = z.infer<typeof vocabularySchema>;

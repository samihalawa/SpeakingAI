export interface VocabularyItem {
  id?: string;
  word: string;
  translation: string;
  usage_type: string;
  explanation?: string;
  example?: string;
  example_translation?: string;
  grammar_notes?: string;
  usage_notes?: string;
  createdAt: Date | string;
  lastReviewed: Date | string;
}

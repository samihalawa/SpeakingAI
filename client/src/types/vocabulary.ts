export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  usage_type: '正式' | '口语' | '书面';
  example?: string;
  example_translation?: string;
  grammar_notes?: string;
  lastReviewed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularyCardProps {
  vocab: VocabularyItem;
  onCardClick: (vocab: VocabularyItem) => void;
}

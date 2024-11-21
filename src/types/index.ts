export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  metadata?: {
    translation?: string;
    vocabulary?: VocabularyItem[];
  };
}

export interface VocabularyItem {
  word: string;
  translation: string;
  type: string;
  examples?: string[];
  createdAt: Date;
  lastReviewed: Date;
} 
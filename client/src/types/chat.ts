export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  translation?: string;
  explanation?: string;
  vocabularyItems?: Array<{
    word: string;
    translation: string;
    usage: string;
  }>;
}
export interface ChatVocabulary {
  word: string;
  translation: string;
  usage: string;
  context: string;
}

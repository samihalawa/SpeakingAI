import { create } from 'zustand';
import { Message } from '@/types';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  addMessage: (message) => 
    set((state) => ({ 
      messages: [...state.messages, message] 
    })),
  setLoading: (loading) => 
    set({ isLoading: loading }),
  setError: (error) => 
    set({ error }),
  clearMessages: () => 
    set({ messages: [] })
})); 
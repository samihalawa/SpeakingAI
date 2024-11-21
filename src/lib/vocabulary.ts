import { type Vocabulary } from "@db/schema";
import { connectWebSocket, addWebSocketListener, sendWebSocketMessage } from "./websocket";

// Type definitions
export interface VocabularyFilters {
  searchTerm?: string;
  sortBy?: 'spanish' | 'chinese' | 'lastReviewed';
  sortOrder?: 'asc' | 'desc';
}

// Cache for vocabulary items
let vocabularyCache: Vocabulary[] = [];

// Initialize WebSocket connection
connectWebSocket();

// Listen for real-time updates
addWebSocketListener((data) => {
  if (data.type === 'vocabulary_update') {
    vocabularyCache = data.items;
    notifyListeners();
  }
});

// Listeners for vocabulary updates
const listeners = new Set<() => void>();

export function subscribeToVocabulary(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

// CRUD Operations
export async function addVocabularyItem(item: Omit<Vocabulary, 'id' | 'createdAt' | 'lastReviewed'>) {
  const response = await fetch('/api/vocabulary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error('Failed to add vocabulary item');
  }

  const newItem = await response.json();
  vocabularyCache.push(newItem);
  sendWebSocketMessage({ type: 'vocabulary_update', item: newItem });
  notifyListeners();
  return newItem;
}

export async function fetchVocabulary() {
  const response = await fetch('/api/vocabulary');
  if (!response.ok) {
    throw new Error('Failed to fetch vocabulary');
  }
  vocabularyCache = await response.json();
  notifyListeners();
  return vocabularyCache;
}

// Filtering and sorting functions
export function filterVocabulary(items: Vocabulary[], filters: VocabularyFilters = {}) {
  let filtered = [...items];

  // Apply search filter
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(item => 
      item.spanish.toLowerCase().includes(searchLower) ||
      item.chinese.toLowerCase().includes(searchLower) ||
      item.example?.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let compareA = a[filters.sortBy!];
      let compareB = b[filters.sortBy!];

      if (filters.sortBy === 'lastReviewed') {
        const timeA = new Date(compareA as string).getTime();
        const timeB = new Date(compareB as string).getTime();
        return filters.sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }

      if (typeof compareA === 'string' && typeof compareB === 'string') {
        const comparison = compareA.localeCompare(compareB);
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      }

      return 0;
    });
  }

  return filtered;
}


// Initialize the vocabulary system
export function initializeVocabulary() {
  fetchVocabulary().catch(console.error);
}

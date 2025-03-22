// lib/stores/use-words-store.ts
import { create } from 'zustand';
import { Word } from '@/lib/supabase';

interface newWord {
  word: string;
  definition: string;
  context?: string | null;
  userId: string;
}

interface WordsStore {
  words: Word[];
  isLoading: boolean;
  error: string | null;
  setWords: (words: Word[]) => void;
  addWord: (wordData: newWord) => Promise<Word | null>;
  addWords: (wordsToAdd: newWord[]) => Promise<Word[]>;
  updateWord: (wordId: string, updates: Partial<Word>) => Promise<void>;
  deleteWord: (wordId: string) => Promise<void>;
}

export const useWordsStore = create<WordsStore>((set, get) => ({
  words: [],
  isLoading: false,
  error: null,

  setWords: (words) => set({ words }),

  // Add a single word
  addWord: async (wordData) => {
    set({ isLoading: true, error: null });
    try {
      // Make API call to save to database
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wordData),
      });

      if (!response.ok) {
        throw new Error('Failed to add word to database');
      }

      // Get the saved word with its DB-generated ID
      const data = await response.json();
      const newWord = data.data; // Adjust based on your API response structure

      // Update store with the new word from DB
      set((state) => ({
        words: [newWord, ...state.words],
        isLoading: false,
      }));

      return newWord;
    } catch (error) {
      console.error('Error saving word:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
      return null;
    }
  },

  // Add multiple words
  addWords: async (wordsToAdd) => {
    set({ isLoading: true, error: null });
    try {
      // Call your batch API endpoint
      const response = await fetch('/api/words/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words: wordsToAdd }),
      });

      if (!response.ok) {
        throw new Error('Failed to add words to database');
      }

      // Get the saved words with their DB-generated IDs
      const data = await response.json();
      const newWords = data.data; // Adjust based on your API response structure

      // Update store with the new words from DB
      set((state) => ({
        words: [...newWords, ...state.words],
        isLoading: false,
      }));

      return newWords;
    } catch (error) {
      console.error('Error saving words:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
      return [];
    }
  },

  // Update a word
  updateWord: async (wordId, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Make API call to update in database
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update word in database');
      }

      // Update local state
      set((state) => ({
        words: state.words.map((word) =>
          word.id === wordId ? { ...word, ...updates } : word
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating word:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  // Delete a word
  deleteWord: async (wordId) => {
    set({ isLoading: true, error: null });
    try {
      // Make API call to delete from database
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete word from database');
      }

      // Update local state
      set((state) => ({
        words: state.words.filter((word) => word.id !== wordId),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting word:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },
}));

// hooks/use-words.ts
import { create } from 'zustand';
import { Word } from '@/lib/supabase';

interface WordsStore {
  words: Word[];
  setWords: (words: Word[]) => void;
  addWord: (word: Word) => void;
}

export const useWords = create<WordsStore>((set) => ({
  words: [],
  setWords: (words) => set({ words }),
  addWord: (word) => set((state) => ({
    words: [word, ...state.words] // Add new word at the beginning
  })),
}));

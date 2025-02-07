// hooks/use-words.ts
import { create } from 'zustand';
import { Word } from '@/lib/supabase';

interface WordsStore {
  words: Word[];
  setWords: (words: Word[]) => void;
  addWord: (word: Word) => void;
  updateWord: (wordId: string, updates: Partial<Word>) => void;
  deleteWord: (wordId: string) => void;
}

export const useWords = create<WordsStore>((set) => ({
  words: [],
  setWords: (words) => set({ words }),
  addWord: (word) => set((state) => ({
    words: [word, ...state.words]
  })),
  updateWord: (wordId, updates) => set((state) => ({
    words: state.words.map((word) =>
      word.id === wordId ? { ...word, ...updates } : word
    )
  })),
  deleteWord: (wordId) => set((state) => ({
    words: state.words.filter((word) => word.id !== wordId)
  })),
}));

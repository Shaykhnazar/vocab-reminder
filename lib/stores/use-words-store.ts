// lib/stores/use-words-store.ts
import { create } from 'zustand';
import { Word } from '@/lib/supabase';

interface WordsStore {
  words: Word[];
  setWords: (words: Word[]) => void;
  addWord: (word: Word) => void;
  addWords: (wordsToAdd: any[]) => void;
  updateWord: (wordId: string, updates: Partial<Word>) => void;
  deleteWord: (wordId: string) => void;
}

export const useWordsStore = create<WordsStore>((set) => ({
  words: [],
  setWords: (words) => set({ words }),

  addWord: (word) => set((state) => ({
    words: [word, ...state.words]
  })),

  addWords: (wordsToAdd) => set((state) => {
    const newWords = wordsToAdd.map(wordData => {
      return {
        id: wordData.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        word: wordData.word,
        definition: wordData.definition,
        context: wordData.context || null,
        user_id: wordData.userId,
        created_at: new Date().toISOString(),
        review_stage: 0,
        mastered: false,
        next_review_at: null,
        last_reviewed_at: null,
      } as Word;
    });

    return {
      words: [...newWords, ...state.words]
    };
  }),

  updateWord: (wordId, updates) => set((state) => ({
    words: state.words.map((word) =>
      word.id === wordId ? { ...word, ...updates } : word
    )
  })),

  deleteWord: (wordId) => set((state) => ({
    words: state.words.filter((word) => word.id !== wordId)
  })),
}));

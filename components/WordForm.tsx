// components/WordForm.tsx
'use client';

import { useState } from 'react';
import { Word } from '@/lib/supabase';

interface WordFormProps {
  onSubmitAction: (word: Partial<Word>) => Promise<void>;
}

export default function WordForm({ onSubmitAction }: WordFormProps) {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [context, setContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmitAction({
        word,
        definition,
        context: context || null,  // Convert empty string to null
      });

      // Reset form
      setWord('');
      setDefinition('');
      setContext('');
    } catch (error) {
      console.error('Error submitting word:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="word" className="block text-sm font-medium text-gray-700">
          Word
        </label>
        <input
          type="text"
          id="word"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="definition" className="block text-sm font-medium text-gray-700">
          Definition
        </label>
        <input
          type="text"
          id="definition"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="context" className="block text-sm font-medium text-gray-700">
          Context (Optional)
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? 'Adding...' : 'Add Word'}
      </button>
    </form>
  );
}

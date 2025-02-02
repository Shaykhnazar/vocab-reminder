// components/WordsList.tsx
'use client';

import { Word } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface WordsListProps {
  initialWords: Word[];
}

export default function WordsList({ initialWords }: WordsListProps) {

  return (
    <div className="space-y-4">
      {initialWords.length === 0 ? (
        <p className="text-gray-500">No words added yet.</p>
      ) : (
        <div className="grid gap-4">
          {initialWords.map((word) => (
            <div
              key={word.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{word.word}</h3>
                  <p className="text-gray-600">{word.definition}</p>
                  {word.context && (
                    <p className="text-gray-500 text-sm mt-2">
                      Context: {word.context}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      word.mastered
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {word.mastered ? 'Mastered' : `Stage ${word.review_stage + 1}/6`}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-500">
                Added {formatDistanceToNow(new Date(word.created_at), { addSuffix: true })}
                {word.next_review_at && !word.mastered && (
                  <span className="ml-2">
                    • Next review:{' '}
                    {formatDistanceToNow(new Date(word.next_review_at), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

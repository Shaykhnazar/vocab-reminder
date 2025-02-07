// components/WordsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { Word } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";

interface WordsListProps {
  initialWords: Word[];
}

export default function WordsList({ initialWords }: WordsListProps) {
  const [words, setWords] = useState<Word[]>(initialWords);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchWords = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/words?userId=${session.user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch words');
      }

      setWords(data.data);
    } catch (error) {
      console.error('Error fetching words:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch words"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();

    // Set up real-time updates if needed
    const interval = setInterval(fetchWords, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  if (loading && words.length === 0) {
    return <div className="space-y-4">
      <div className="animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-gray-100 p-4 rounded-lg mb-4 h-24"/>
        ))}
      </div>
    </div>;
  }

  return (
    <div className="space-y-4">
      {words.length === 0 ? (
        <p className="text-gray-500">No words added yet.</p>
      ) : (
        <div className="grid gap-4">
          {words.map((word) => (
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

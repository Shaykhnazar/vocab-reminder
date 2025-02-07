// components/WordsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { useWords } from '@/hooks/use-words';
import { Word } from "@/lib/supabase";

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid date';
  }
};

const SkeletonItem = ({ index }: { index: number }) => (
  <div
    className="bg-gray-100 p-4 rounded-lg mb-4 h-24 animate-pulse"
  />
);

const Skeleton = () => {
  const skeletonItems = [1, 2, 3];
  return (
    <div className="space-y-4">
      {skeletonItems.map((item) => (
        <SkeletonItem key={`skeleton-item-${item}`} index={item} />
      ))}
    </div>
  );
};


interface WordCardProps {
  word: Word;
}

// Create a separate WordCard component
const WordCard = ({ word }: WordCardProps) => {
  const statusClasses = word.mastered
    ? 'bg-green-100 text-green-800'
    : 'bg-blue-100 text-blue-800';

  return (
    <div
      className="bg-white p-4 rounded-lg shadow border border-gray-200 transition-shadow hover:shadow-md"
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="font-semibold text-lg">{word.word}</h3>
          <p className="text-gray-600">{word.definition}</p>
          {word.context && (
            <p className="text-gray-500 text-sm mt-2">
              Context: {word.context}
            </p>
          )}
        </div>
        <div className="text-right ml-4 flex-shrink-0">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses}`}
          >
            {word.mastered ? 'Mastered' : `Stage ${word.review_stage + 1}/6`}
          </span>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        <span>Added {formatDate(word.created_at)}</span>
        {word.next_review_at && !word.mastered && (
          <span className="ml-2">
            • Next review: {formatDate(word.next_review_at)}
          </span>
        )}
      </div>
    </div>
  );
};

export default function WordsList() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();
  const { words, setWords } = useWords();

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
  }, [session?.user?.id]);

  if (loading && words.length === 0) {
    return <Skeleton />;
  }

  return (
    <div className="space-y-4">
      {words.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No words added yet. Start by adding a new word!
        </p>
      ) : (
        <div className="grid gap-4">
          {words.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      )}
    </div>
  );
}

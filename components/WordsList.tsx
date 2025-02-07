// components/WordsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { useWords } from '@/hooks/use-words';
import { Word } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { Button } from "@/components/shadcn-ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn-ui/alert-dialog";
import { Input } from "@/components/shadcn-ui/input";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { MoreVertical, Edit, Trash } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface WordCardProps {
  word: Word;
  onEdit: (word: Word) => void;
  onDelete: (wordId: string) => void;
}

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


const WordCard = ({ word, onEdit, onDelete }: WordCardProps) => {
  const statusClasses = word.mastered
    ? 'bg-green-100 text-green-800'
    : 'bg-blue-100 text-blue-800';

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 transition-shadow hover:shadow-md">
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
        <div className="flex items-start space-x-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses}`}>
            {word.mastered ? 'Mastered' : `Stage ${word.review_stage + 1}/6`}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(word)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(word.id)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

interface EditWordFormProps {
  word: Word;
  onSave: (updatedWord: Partial<Word>) => Promise<void>;
  onCancel: () => void;
}

const EditWordForm = ({ word, onSave, onCancel }: EditWordFormProps) => {
  const [formData, setFormData] = useState({
    word: word.word,
    definition: word.definition,
    context: word.context || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          value={formData.word}
          onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
          placeholder="Word"
          className="w-full"
        />
      </div>
      <div>
        <Input
          value={formData.definition}
          onChange={(e) => setFormData(prev => ({ ...prev, definition: e.target.value }))}
          placeholder="Definition"
          className="w-full"
        />
      </div>
      <div>
        <Textarea
          value={formData.context}
          onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
          placeholder="Context (optional)"
          className="w-full"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
};


export default function WordsList() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [deletingWordId, setDeletingWordId] = useState<string | null>(null);

  const { data: session } = useSession();
  const { toast } = useToast();
  const { words, setWords } = useWords();

  const fetchWords = async (pageNum: number = 1, replace: boolean = true) => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/words?userId=${session.user.id}&page=${pageNum}&status=${statusFilter}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch words');
      }

      setWords(replace ? data.data : [...words, ...data.data]);
      setHasMore(data.data.length === ITEMS_PER_PAGE);
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

  const handleEdit = async (updatedWord: Partial<Word>) => {
    if (!editingWord || !session?.user?.id) return;

    try {
      const response = await fetch(`/api/words/${editingWord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWord),
      });

      if (!response.ok) {
        throw new Error('Failed to update word');
      }

      const updated = await response.json();
      setWords(words.map(w => w.id === editingWord.id ? updated.data : w));
      setEditingWord(null);
      toast({
        title: "Success",
        description: "Word updated successfully"
      });
    } catch (error) {
      console.error('Error updating word:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update word"
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingWordId || !session?.user?.id) return;

    try {
      const response = await fetch(`/api/words/${deletingWordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete word');
      }

      setWords(words.filter(w => w.id !== deletingWordId));
      toast({
        title: "Success",
        description: "Word deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting word:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete word"
      });
    } finally {
      setDeletingWordId(null);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWords(nextPage, false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchWords(1);
  }, [session?.user?.id, statusFilter]);

  if (loading && words.length === 0) {
    return <Skeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Words</SelectItem>
            <SelectItem value="mastered">Mastered</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {words.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No words found. Start by adding a new word!
        </p>
      ) : (
        <div className="space-y-4">
          {words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              onEdit={setEditingWord}
              onDelete={setDeletingWordId}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingWord} onOpenChange={() => setEditingWord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Word</DialogTitle>
          </DialogHeader>
          {editingWord && (
            <EditWordForm
              word={editingWord}
              onSave={handleEdit}
              onCancel={() => setEditingWord(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingWordId}
        onOpenChange={() => setDeletingWordId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the word
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

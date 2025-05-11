// components/WordsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { useWordsStore } from '@/lib/stores/use-words-store';
import { Word } from "@/lib/supabase";
import { useTranslations } from 'next-intl';
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
import {
  MoreVertical,
  Edit,
  Trash,
  Search,
  SlidersHorizontal,
  Calendar,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  Bell,
  BookOpen,
  Star
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Progress } from "@/components/shadcn-ui/progress";

const ITEMS_PER_PAGE = 10;

interface WordCardProps {
  word: Word;
  onEdit: (word: Word) => void;
  onDelete: (wordId: string) => void;
  t: any;
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

const SkeletonItem = () => (
  <div className="animate-pulse">
    <div className="h-20 md:h-24 bg-gray-100 rounded-lg mb-3 md:mb-4"></div>
  </div>
);

const Skeleton = () => (
  <div className="space-y-3 md:space-y-4">
    {[1, 2, 3].map((item) => (
      <SkeletonItem key={`skeleton-item-${item}`}/>
    ))}
  </div>
);

const WordCard = ({ word, onEdit, onDelete, t }: WordCardProps) => {
  const progressPercent = word.mastered ? 100 : ((word.review_stage) / 5) * 100;

  const getStageLabel = () => {
    if (word.mastered) return t('mastered');
    const stages = [
      t('stages.new'),
      t('stages.learning'),
      t('stages.reviewing'),
      t('stages.familiar'),
      t('stages.known'),
      t('stages.almostMastered')
    ];
    return stages[word.review_stage] || t('stage', { stage: word.review_stage + 1, total: 6 });
  };

  const getProgressColor = () => {
    if (word.mastered) return "bg-green-500";
    const colors = [
      "bg-gray-400",
      "bg-blue-500",
      "bg-cyan-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-yellow-500"
    ];
    return colors[word.review_stage] || "bg-gray-400";
  };

  return (
    <Card className="mb-3 md:mb-4 overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
      <CardContent className="p-3 md:p-4">
        <div className="flex justify-between items-start gap-2 md:gap-4">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-semibold text-base md:text-lg truncate">{word.word}</h3>
              {word.mastered && <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
            </div>
            <p className="text-gray-700 text-sm md:text-base line-clamp-2">{word.definition}</p>
            {word.context && (
              <div className="mt-2 text-gray-600 text-xs md:text-sm bg-gray-50 rounded p-1.5 md:p-2 border-l-2 border-gray-200">
                <span className="italic line-clamp-2">{word.context}</span>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(word)}>
                <Edit className="mr-2 h-4 w-4" />
                {t('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(word.id)}
              >
                <Trash className="mr-2 h-4 w-4" />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 md:mt-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 mb-1 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className={`px-1.5 md:px-2 py-0.5 text-xs ${word.mastered ? 'border-green-200 text-green-700 bg-green-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}
              >
                {getStageLabel()}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1 inline" />
                <span className="hidden sm:inline">{t('added')}</span>
                {formatDate(word.created_at)}
              </span>

              {word.next_review_at && !word.mastered && (
                <span className="flex items-center">
                  <Bell className="h-3 w-3 mr-1 inline" />
                  <span className="hidden sm:inline">{t('nextReview')}:</span>
                  {formatDate(word.next_review_at)}
                </span>
              )}
            </div>
          </div>

          <Progress value={progressPercent} className="h-1.5" indicator-class-name={getProgressColor()} />
        </div>
      </CardContent>
    </Card>
  );
};

interface EditWordFormProps {
  word: Word;
  onSave: (updatedWord: Partial<Word>) => Promise<void>;
  onCancel: () => void;
  t: any; // Translations
}

const EditWordForm = ({ word, onSave, onCancel, t }: EditWordFormProps) => {
  const [formData, setFormData] = useState({
    word: word.word,
    definition: word.definition,
    context: word.context || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1.5">
          {t('wordLabel')}
        </label>
        <Input
          value={formData.word}
          onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
          placeholder={t('wordPlaceholder')}
          className="w-full"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">
          {t('definitionLabel')}
        </label>
        <Input
          value={formData.definition}
          onChange={(e) => setFormData(prev => ({ ...prev, definition: e.target.value }))}
          placeholder={t('definitionPlaceholder')}
          className="w-full"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">
          {t('contextLabel')}
        </label>
        <Textarea
          value={formData.context}
          onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
          placeholder={t('contextPlaceholder')}
          className="w-full"
          rows={3}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            t('saveChanges')
          )}
        </Button>
      </div>
    </form>
  );
};

export default function WordsList() {
  const t = useTranslations('WordsList');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'due' | 'mastered'>('all');
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [deletingWordId, setDeletingWordId] = useState<string | null>(null);

  const { data: session } = useSession();
  const { toast } = useToast();
  const { words, setWords } = useWordsStore();

  const fetchWords = async (pageNum: number = 1, replace: boolean = true) => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/words?userId=${session.user.id}&page=${pageNum}&status=${statusFilter}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.fetchFailed'));
      }

      setWords(replace ? data.data : [...words, ...data.data]);
      setHasMore(data.data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching words:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.fetchError')
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
        throw new Error(t('errors.updateFailed'));
      }

      const updated = await response.json();
      setWords(words.map(w => w.id === editingWord.id ? updated.data : w));
      setEditingWord(null);
      toast({
        title: t('toast.success'),
        description: t('toast.updateSuccess')
      });
    } catch (error) {
      console.error('Error updating word:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.updateError')
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
        throw new Error(t('errors.deleteFailed'));
      }

      setWords(words.filter(w => w.id !== deletingWordId));
      toast({
        title: t('toast.success'),
        description: t('toast.deleteSuccess')
      });
    } catch (error) {
      console.error('Error deleting word:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.deleteError')
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

  // Filter words based on search term and view mode
  const filteredWords = words.filter(word => {
    const matchesSearch =
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (word.context && word.context.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesViewMode =
      viewMode === 'all' ||
      (viewMode === 'mastered' && word.mastered) ||
      (viewMode === 'due' && !word.mastered);

    return matchesSearch && matchesViewMode;
  });

  const wordStats = {
    total: words.length,
    mastered: words.filter(w => w.mastered).length,
    learning: words.filter(w => !w.mastered).length,
    dueToday: words.filter(w =>
      !w.mastered &&
      w.next_review_at &&
      new Date(w.next_review_at) <= new Date()
    ).length
  };

  if (loading && words.length === 0) {
    return <Skeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards - Mobile Responsive */}
      <div className="bg-white rounded-lg p-3 md:p-4 mb-4 md:mb-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
          <div className="bg-purple-50 rounded-lg p-2 md:p-3 text-center">
            <div className="text-lg md:text-2xl font-semibold text-purple-700">{wordStats.total}</div>
            <div className="text-xs text-gray-500">{t('stats.totalWords')}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 md:p-3 text-center">
            <div className="text-lg md:text-2xl font-semibold text-green-700">{wordStats.mastered}</div>
            <div className="text-xs text-gray-500">{t('stats.mastered')}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 md:p-3 text-center">
            <div className="text-lg md:text-2xl font-semibold text-blue-700">{wordStats.dueToday}</div>
            <div className="text-xs text-gray-500">{t('stats.dueToday')}</div>
          </div>
        </div>

        {/* Search and Filters - Stack on mobile */}
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as 'all' | 'due' | 'mastered')}
              className="flex-1"
            >
              <TabsList className="grid grid-cols-2 w-full h-9">
                <TabsTrigger value="all" className="text-xs px-2">
                  {t('filters.all')}
                </TabsTrigger>
                <TabsTrigger value="due" className="text-xs px-2">
                  {t('filters.due')}
                </TabsTrigger>
                {/*<TabsTrigger value="mastered" className="text-xs px-2">*/}
                {/*  {t('filters.mastered')}*/}
                {/*</TabsTrigger>*/}
              </TabsList>
            </Tabs>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[110px] md:w-[130px]">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder={t('filterPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allStages')}</SelectItem>
                <SelectItem value="new">{t('filters.new')}</SelectItem>
                <SelectItem value="learning">{t('filters.learning')}</SelectItem>
                <SelectItem value="mastered">{t('filters.mastered')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Words List */}
      {filteredWords.length === 0 ? (
        <div className="text-center py-8 md:py-12 rounded-lg border border-dashed border-gray-200 bg-gray-50">
          <BookOpen className="h-10 w-10 md:h-12 md:w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-base md:text-lg font-medium text-gray-700 mb-1">
            {t('noWordsFound')}
          </h3>
          <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto px-4">
            {searchTerm ? t('noMatchingWords') : t('addFirstWord')}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredWords.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              onEdit={setEditingWord}
              onDelete={setDeletingWordId}
              t={t}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center mt-4 md:mt-6">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outline"
                className="w-32 md:w-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  t('loadMore')
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog - Mobile Responsive */}
      <Dialog open={!!editingWord} onOpenChange={(open) => !open && setEditingWord(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('editWord')}</DialogTitle>
          </DialogHeader>
          {editingWord && (
            <EditWordForm
              word={editingWord}
              onSave={handleEdit}
              onCancel={() => setEditingWord(null)}
              t={t}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingWordId}
        onOpenChange={(open) => !open && setDeletingWordId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmation.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmation.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

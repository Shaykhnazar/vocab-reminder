// components/WordForm.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { useWordsStore } from '@/lib/stores/use-words-store';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { Label } from "@/components/shadcn-ui/label";
import {
  BookOpen,
  Loader2,
  Send,
  Sparkles,
  Check,
  AlertCircle
} from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/shadcn-ui/alert";

export default function WordForm() {
  const t = useTranslations('WordForm');
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [context, setContext] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { toast } = useToast();
  const { data: session } = useSession();
  const { addWord } = useWordsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setLoading(true);

    try {
      if (!word || !definition) {
        throw new Error(t('errors.requiredFields'));
      }

      await addWord({
        word: word,
        definition: definition,
        context: context || null,
        userId: session.user.id,
      });

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      toast({
        title: t('toast.success'),
        description: t('toast.wordAdded'),
      });

      // Reset form state
      setWord('');
      setDefinition('');
      setContext('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.addWordFailed');

      toast({
        title: t('toast.error'),
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAiLookup = async () => {
    if (!word) {
      toast({
        title: t('toast.error'),
        description: t('errors.wordRequired')
      });
      return;
    }

    setAiLoading(true);

    try {
      // Simulate API call to dictionary service
      setTimeout(() => {
        // Mock auto-generated definition
        setDefinition(`The meaning of "${word}" (simulated AI definition)`);
        setAiLoading(false);

        toast({
          title: t('toast.success'),
          description: t('toast.definitionFound')
        });
      }, 1000);
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('errors.lookupFailed')
      });
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription>
            {t('success.wordAdded')} {word} {t('success.reminderScheduled')}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="word" className="text-sm font-medium mb-1.5 block">
              {t('fields.word.label')}
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder={t('fields.word.placeholder')}
                className="flex-1"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAiLookup}
                disabled={aiLoading || !word}
                className="h-10 w-10 flex-shrink-0"
                title={t('buttons.lookupDefinition')}
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="definition" className="text-sm font-medium mb-1.5 block">
              {t('fields.definition.label')}
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                id="definition"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder={t('fields.definition.placeholder')}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => window.open(`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`, '_blank')}
                disabled={!word}
                className="h-10 w-10 flex-shrink-0"
                title={t('buttons.openDictionary')}
              >
                <BookOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="context" className="text-sm font-medium mb-1.5 block flex items-center">
              {t('fields.context.label')}
              <span className="text-xs text-gray-500 ml-2 font-normal">
                ({t('fields.context.optional')})
              </span>
            </Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={t('fields.context.placeholder')}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !word || !definition}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('buttons.adding')}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {t('buttons.addWord')}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

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
import { Loader2 } from "lucide-react";

export default function WordForm() {
  const t = useTranslations('WordForm');
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [context, setContext] = useState<string>('');
  const [loading, setLoading] = useState(false);

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

      addWord({
        word: word,
        definition: definition,
        context: context || null,
        userId: session.user.id,
      });

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="word" className="block text-sm font-medium">
          {t('fields.word.label')}
        </Label>
        <Input
          type="text"
          id="word"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder={t('fields.word.placeholder')}
          required
        />
      </div>

      <div>
        <Label htmlFor="definition" className="block text-sm font-medium">
          {t('fields.definition.label')}
        </Label>
        <Input
          type="text"
          id="definition"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          placeholder={t('fields.definition.placeholder')}
          required
        />
      </div>

      <div>
        <Label htmlFor="context" className="block text-sm font-medium">
          {t('fields.context.label')}
        </Label>
        <Textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={t('fields.context.placeholder')}
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={loading || !word || !definition}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('buttons.adding')}
          </>
        ) : (
          t('buttons.addWord')
        )}
      </Button>
    </form>
  );
}

// components/WordForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { useWordsStore } from '@/lib/stores/use-words-store';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { Label } from "@/components/shadcn-ui/label";
import { Card } from "@/components/shadcn-ui/card";
import { Progress } from "@/components/shadcn-ui/progress";
import {
  BookOpen,
  Loader2,
  Send,
  Sparkles,
  Check,
  AlertCircle,
  Book,
  ArrowRight,
  Info
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/shadcn-ui/alert";
import Link from 'next/link';

interface SubscriptionStatus {
  canAddWord: boolean;
  message?: string;
  subscription?: {
    plan: string;
    wordLimit: number;
    wordsUsed: number;
    wordsRemaining: number;
    daysRemaining: number;
    expiresAt: string | null;
    features: string[];
  };
}

export default function WordForm() {
  const t = useTranslations('WordForm');
  const router = useRouter();
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [context, setContext] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const { toast } = useToast();
  const { data: session } = useSession();
  const { addWord } = useWordsStore();

  // Check subscription limits on mount
  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.user?.id) return;

      try {
        setSubscriptionLoading(true);
        const response = await fetch('/api/subscriptions/check-limits');
        if (!response.ok) throw new Error('Failed to check subscription limits');

        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error('Error checking subscription:', error);
        toast({
          title: t('toast.error'),
          description: t('errors.subscriptionCheckFailed'),
        });
      } finally {
        setSubscriptionLoading(false);
      }
    };

    checkSubscription();
  }, [session, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    // Check if user can add more words
    if (subscription && !subscription.canAddWord) {
      toast({
        title: t('toast.error'),
        description: subscription.message || t('errors.wordLimitReached'),
      });

      // Show a modal or redirect to subscription page after a delay
      setTimeout(() => {
        router.push('/subscriptions');
      }, 2000);
      return;
    }

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

      // Refresh subscription status after adding a word
      const response = await fetch('/api/subscriptions/check-limits');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.addWordFailed');

      // Check if the error is related to subscription limits
      if (errorMessage && errorMessage.includes('limit')) {
        toast({
          title: t('toast.error'),
          description: errorMessage,
        });

        // Redirect to subscription page after a delay
        setTimeout(() => {
          router.push('/subscriptions');
        }, 2000);
      } else {
        toast({
          title: t('toast.error'),
          description: errorMessage
        });
      }
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

  // Calculate usage percentage for progress bar
  const usagePercentage = subscription?.subscription
    ? (subscription.subscription.wordsUsed / subscription.subscription.wordLimit) * 100
    : 0;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Subscription Status Display - Mobile Responsive */}
      {subscription && !subscriptionLoading && (
        <Card className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <h3 className="font-semibold text-sm md:text-base text-blue-900">
                  {t('subscription.title')}
                </h3>
              </div>
              {subscription.subscription && (
                <span className="text-xs md:text-sm font-medium bg-blue-100 text-blue-700 px-2 py-0.5 md:py-1 rounded">
                  {subscription.subscription.plan}
                </span>
              )}
            </div>

            {/* Usage Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs md:text-sm text-gray-600">
                <span>
                  {subscription.subscription
                    ? t('subscription.wordsUsed', {
                        used: subscription.subscription.wordsUsed,
                        total: subscription.subscription.wordLimit
                      })
                    : t('subscription.checking')}
                </span>
                <span>
                  {subscription.subscription
                    ? `${Math.round(usagePercentage)}%`
                    : ''}
                </span>
              </div>
              <Progress
                value={usagePercentage}
                className={`h-1.5 md:h-2 ${usagePercentage >= 90 ? 'bg-red-200' : usagePercentage >= 75 ? 'bg-amber-200' : 'bg-green-200'}`}
              />
            </div>

            {/* Usage Alert */}
            {subscription.canAddWord ? (
              subscription.subscription && subscription.subscription.wordsRemaining < 10 && (
                <Alert className="bg-amber-50 border-amber-200 p-2 md:p-3">
                  <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-amber-500" />
                  <AlertDescription className="text-xs md:text-sm text-amber-800 ml-2">
                    {t('subscription.limitWarning', {
                      remaining: subscription.subscription.wordsRemaining
                    })}
                  </AlertDescription>
                </Alert>
              )
            ) : (
              <Alert className="bg-red-50 border-red-200 p-2 md:p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <AlertTitle className="text-sm md:text-base text-red-800 mb-1">
                      {t('subscription.limitReached')}
                    </AlertTitle>
                    <AlertDescription className="text-xs md:text-sm text-red-700">
                      {subscription.message || t('subscription.upgradeMessage')}
                      <div className="mt-2">
                        <Button size="sm" variant="outline" asChild className="h-7 md:h-8 text-xs md:text-sm">
                          <Link href="/subscriptions">
                            {t('subscription.upgradePlan')}
                            <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                          </Link>
                        </Button>
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </div>
        </Card>
      )}

      {/* Loading skeleton for subscription status */}
      {subscriptionLoading && (
        <Card className="p-3 md:p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 md:h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-1.5 md:h-2 bg-gray-200 rounded"></div>
            <div className="h-3 md:h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </Card>
      )}

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200 text-green-800 p-2 md:p-3">
          <div className="flex items-center gap-2">
            <Check className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
            <AlertDescription className="text-xs md:text-sm">
              {t('success.wordAdded')} {word} {t('success.reminderScheduled')}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
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
                className="flex-1 text-sm"
                required
                disabled={subscription && !subscription.canAddWord || false}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAiLookup}
                disabled={aiLoading || !word || (subscription && !subscription.canAddWord || false)}
                className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0"
                title={t('buttons.lookupDefinition')}
              >
                {aiLoading ? (
                  <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
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
                className="text-sm"
                required
                disabled={subscription && !subscription.canAddWord || false}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => window.open(`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`, '_blank')}
                disabled={!word || (subscription && !subscription.canAddWord || false)}
                className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0"
                title={t('buttons.openDictionary')}
              >
                <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
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
              className="resize-none text-sm"
              disabled={subscription && !subscription.canAddWord || false}
            />
          </div>
        </div>

        {/* Info about spaced repetition */}
        <Alert className="bg-blue-50 border-blue-200 p-2 md:p-3">
          <div className="flex items-start gap-2">
            <Info className="h-3 w-3 md:h-4 md:w-4 text-blue-600 mt-0.5" />
            <AlertDescription className="text-xs md:text-sm text-blue-700">
              {t('info.spacedRepetition')}
            </AlertDescription>
          </div>
        </Alert>

        <Button
          type="submit"
          disabled={loading || !word || !definition || (subscription && !subscription.canAddWord || false)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-sm md:text-base h-9 md:h-10"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
              {t('buttons.adding')}
            </>
          ) : (
            <>
              <Send className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              {t('buttons.addWord')}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/shadcn-ui/button';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Progress } from '@/components/shadcn-ui/progress';
import { Badge } from '@/components/shadcn-ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  X,
  RotateCcw,
  Volume2,
  Clock,
  SkipForward,
  Lightbulb,
  Pause,
  Trophy,
  List,
  Home,
  Loader2,
  BookOpen
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Define the possible status types
type CardStatus = 'correct' | 'incorrect' | 'skipped' | null;

// Interface for flashcard
interface Flashcard {
  id: string;
  word: string;
  definition: string;
  context?: string;
  stage: number;
  reviewed: boolean;
  status: CardStatus;
}

interface ReviewResult {
  wordId: string;
  success: boolean;
  responseTimeMs: number;
  confidenceLevel: number;
}

const FlashcardReview = () => {
  const t = useTranslations('Review');
  const router = useRouter();
  const { toast } = useToast();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Real review session data
  const [session, setSession] = useState({
    id: '',
    current: 0,
    total: 0,
    correct: 0,
    incorrect: 0,
    skipped: 0,
    timeSpent: 0,
    isComplete: false,
    isPaused: false,
    startTime: Date.now()
  });

  // Real flashcards data
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [reviewResults, setReviewResults] = useState<ReviewResult[]>([]);

  // State for tracking card flip
  const [isFlipped, setIsFlipped] = useState(false);

  // State for tracking session timer
  const [timer, setTimer] = useState(0);

  // State for showing hint
  const [showHint, setShowHint] = useState(false);
  const [cardStartTime, setCardStartTime] = useState(Date.now());

  // Fetch review words on component mount
  useEffect(() => {
    const fetchReviewWords = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/review/words');

        if (!response.ok) {
          throw new Error('Failed to fetch review words');
        }

        const data = await response.json();

        if (data.words.length === 0) {
          // No words to review
          setSession(prev => ({ ...prev, isComplete: true, total: 0 }));
          setCards([]);
        } else {
          setCards(data.words);
          setSession(prev => ({
            ...prev,
            id: data.sessionId,
            total: data.words.length,
            isComplete: false
          }));
        }
      } catch (err) {
        console.error('Error fetching review words:', err);
        setError(err instanceof Error ? err.message : 'Failed to load review words');
        toast({
          title: t('error'),
          description: t('loadError'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviewWords();
  }, [toast, t]);

  // Effect for timer
  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;

    if (!session.isPaused && !session.isComplete && !loading) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        setSession(prev => ({...prev, timeSpent: prev.timeSpent + 1}));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [session.isPaused, session.isComplete, loading]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate session progress
  const progress = ((session.correct + session.incorrect + session.skipped) / session.total) * 100;

  // Get current card
  const currentCard = cards[session.current];

  // Handle card flip
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Record review result
  const recordReviewResult = (success: boolean, confidence = 5) => {
    const responseTime = Date.now() - cardStartTime;
    const result: ReviewResult = {
      wordId: currentCard.id,
      success,
      responseTimeMs: responseTime,
      confidenceLevel: confidence
    };

    setReviewResults(prev => [...prev, result]);
  };

  // Handle marking card as correct
  const handleCorrect = () => {
    recordReviewResult(true);

    // Update card status
    const updatedCards = [...cards];
    updatedCards[session.current] = {
      ...updatedCards[session.current],
      reviewed: true,
      status: 'correct'
    };

    setCards(updatedCards);

    // Update session stats and move to next card
    setSession(prev => ({
      ...prev,
      correct: prev.correct + 1,
      current: prev.current + 1,
      isComplete: prev.current + 1 >= prev.total
    }));

    // Reset card state
    setIsFlipped(false);
    setShowHint(false);
    setCardStartTime(Date.now());
  };

  // Handle marking card as incorrect
  const handleIncorrect = () => {
    recordReviewResult(false, 2);

    // Update card status
    const updatedCards = [...cards];
    updatedCards[session.current] = {
      ...updatedCards[session.current],
      reviewed: true,
      status: 'incorrect'
    };

    setCards(updatedCards);

    // Update session stats and move to next card
    setSession(prev => ({
      ...prev,
      incorrect: prev.incorrect + 1,
      current: prev.current + 1,
      isComplete: prev.current + 1 >= prev.total
    }));

    // Reset card state
    setIsFlipped(false);
    setShowHint(false);
    setCardStartTime(Date.now());
  };

  // Handle skipping card
  const handleSkip = () => {
    recordReviewResult(false, 1);

    // Update card status
    const updatedCards = [...cards];
    updatedCards[session.current] = {
      ...updatedCards[session.current],
      reviewed: true,
      status: 'skipped'
    };

    setCards(updatedCards);

    // Update session stats and move to next card
    setSession(prev => ({
      ...prev,
      skipped: prev.skipped + 1,
      current: prev.current + 1,
      isComplete: prev.current + 1 >= prev.total
    }));

    // Reset card state
    setIsFlipped(false);
    setShowHint(false);
    setCardStartTime(Date.now());
  };

  // Submit review session results
  const submitReviewSession = async () => {
    if (reviewResults.length === 0) return;

    try {
      setSubmitting(true);
      const sessionData = {
        sessionId: session.id,
        results: reviewResults,
        totalTimeMs: session.timeSpent * 1000
      };

      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review session');
      }

      const result = await response.json();
      console.log('Review session submitted successfully:', result);

      toast({
        title: t('sessionComplete'),
        description: t('reviewsSubmitted', { count: result.successful }),
        variant: 'default',
      });

    } catch (err) {
      console.error('Error submitting review session:', err);
      toast({
        title: t('error'),
        description: t('submitError'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit results when session completes
  useEffect(() => {
    if (session.isComplete && reviewResults.length > 0 && !submitting) {
      submitReviewSession();
    }
  }, [session.isComplete, reviewResults.length, submitting]);

  // Toggle session pause
  const togglePause = () => {
    setSession(prev => ({...prev, isPaused: !prev.isPaused}));
  };

  // Handle text-to-speech
  const handleSpeak = (text: string | undefined) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Early returns for different states
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <Loader2 className="mx-auto h-12 w-12 text-purple-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('loading')}</h2>
          <p className="text-gray-600">{t('loadingWords')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <X className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">{t('error')}</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="mb-2">
              <RotateCcw size={16} className="mr-2" />
              {t('retry')}
            </Button>
            <br />
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <Home size={16} className="mr-2" />
              {t('dashboard')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (session.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('noWordsTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('noWordsDescription')}</p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/words')} className="w-full">
              <Plus size={16} className="mr-2" />
              {t('addWords')}
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
              <Home size={16} className="mr-2" />
              {t('dashboard')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render session complete view
  if (session.isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-2xl bg-white shadow-md">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <Trophy className="h-16 w-16 sm:h-20 sm:w-20 text-amber-500 mb-4" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {t('sessionComplete')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {t('youCompleted')} {session.total} {t('words')}
              </p>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md mb-6 sm:mb-8">
                <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">{t('correct')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{session.correct}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">{t('incorrect')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{session.incorrect}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">{t('skipped')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{session.skipped}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center justify-center gap-2 text-sm sm:text-base"
                  onClick={() => router.push('/dashboard')}
                >
                  <Home className="h-4 w-4" />
                  {t('returnToDashboard')}
                </Button>
                <Button
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
                  size="lg"
                  onClick={() => {
                    // Reset session
                    setSession({
                      id: session.id,
                      current: 0,
                      total: session.total,
                      correct: 0,
                      incorrect: 0,
                      skipped: 0,
                      timeSpent: 0,
                      isComplete: false,
                      isPaused: false,
                      startTime: Date.now()
                    });

                    // Reset cards
                    setCards(cards.map(card => ({...card, reviewed: false, status: null})));

                    // Reset timer
                    setTimer(0);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('reviewAgain')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header - Mobile Responsive */}
      <header className="bg-white border-b border-gray-200 py-2 sm:py-3 px-3 sm:px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 h-8 px-2 sm:px-3"
              onClick={() => router.push('/dashboard')}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">{t('back')}</span>
            </Button>
            <h1 className="text-base sm:text-lg font-semibold hidden sm:block">{t('flashcardReview')}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Badge className="flex items-center gap-1 bg-purple-100 text-purple-800 border-purple-200 px-2 py-0.5 text-xs">
              <Clock className="h-3 w-3" />
              {formatTime(timer)}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 h-8 px-2 sm:px-3"
              onClick={togglePause}
            >
              {session.isPaused ?
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" /> :
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
              }
              <span className="hidden sm:inline text-xs sm:text-sm">
                {session.isPaused ? t('resume') : t('pause')}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - Mobile Responsive */}
      <main className="flex-1 container mx-auto p-3 sm:p-4 flex flex-col items-center justify-center">
        {/* Progress bar */}
        <div className="w-full max-w-2xl mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs sm:text-sm text-gray-500">
              {t('progress')}: {session.current + 1}/{session.total}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                <Check className="h-3 w-3 sm:h-4 sm:w-4" /> {session.correct}
              </span>
              <span className="flex items-center gap-1 text-xs sm:text-sm text-red-600">
                <X className="h-3 w-3 sm:h-4 sm:w-4" /> {session.incorrect}
              </span>
              <span className="flex items-center gap-1 text-xs sm:text-sm text-blue-600">
                <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" /> {session.skipped}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Flashcard - Mobile Responsive */}
        <div
          className={`w-full max-w-2xl h-[400px] sm:h-80 md:h-96 relative perspective-1000 ${session.isPaused ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={handleFlip}
        >
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Card Front */}
            <div className="absolute w-full h-full rounded-lg sm:rounded-xl shadow-lg bg-white flex flex-col items-center justify-center p-4 sm:p-6 backface-hidden">
              <Badge
                className={`mb-4 sm:mb-6 text-xs sm:text-sm ${
                  currentCard.stage <= 2 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    currentCard.stage <= 4 ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                      'bg-purple-100 text-purple-800 border-purple-200'
                }`}
              >
                {t('stage')} {currentCard.stage}/6
              </Badge>

              <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-3 sm:mb-4">
                {currentCard.word}
              </h2>

              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(currentCard.word);
                }}
              >
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <p className="text-gray-500 mt-auto text-center text-xs sm:text-sm">
                {t('tapToReveal')}
              </p>
            </div>

            {/* Card Back */}
            <div className="absolute w-full h-full rounded-lg sm:rounded-xl shadow-lg bg-white flex flex-col p-4 sm:p-6 rotate-y-180 backface-hidden">
              <h3 className="text-base sm:text-xl font-medium text-gray-700 mb-3 sm:mb-4 text-center">
                {t('definition')}:
              </h3>

              <p className="text-center text-gray-800 text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">
                {currentCard.definition}
              </p>

              {(showHint || currentCard.context) && (
                <div className="mt-2 mb-3 sm:mb-4 w-full">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                    {t('exampleContext')}:
                  </h4>
                  <p className="text-xs sm:text-sm italic text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-md border border-gray-200 leading-relaxed">
                    {currentCard.context}
                  </p>
                </div>
              )}

              {!showHint && !currentCard.context && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 mb-3 sm:mb-4 text-xs sm:text-sm h-8 mx-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(true);
                  }}
                >
                  <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {t('showContext')}
                </Button>
              )}

              <div className="mt-auto flex items-center gap-2 sm:gap-3 w-full justify-center">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4 flex-1 sm:flex-initial"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncorrect();
                  }}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                  {t('incorrect')}
                </Button>

                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4 flex-1 sm:flex-initial"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkip();
                  }}
                >
                  <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                  {t('skip')}
                </Button>

                <Button
                  className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4 flex-1 sm:flex-initial"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCorrect();
                  }}
                >
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                  {t('correct')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pause overlay - Mobile Responsive */}
        {session.isPaused && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white shadow-lg">
              <CardContent className="p-4 sm:p-6 text-center">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t('sessionPaused')}</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{t('sessionPausedDescription')}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => router.push('/dashboard')}
                  >
                    {t('quitSession')}
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-sm"
                    onClick={togglePause}
                  >
                    {t('resume')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Navigation arrows - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block fixed left-4 top-1/2 transform -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white shadow-md h-12 w-12"
          disabled={session.current <= 0}
          onClick={() => {
            if (session.current > 0) {
              setSession(prev => ({...prev, current: prev.current - 1}));
              setIsFlipped(false);
            }
          }}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="hidden md:block fixed right-4 top-1/2 transform -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white shadow-md h-12 w-12"
          disabled={session.current >= session.total - 1}
          onClick={() => {
            if (session.current < session.total - 1) {
              setSession(prev => ({...prev, current: prev.current + 1}));
              setIsFlipped(false);
            }
          }}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardReview;

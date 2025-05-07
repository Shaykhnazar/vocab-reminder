'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/shadcn-ui/button';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Progress } from '@/components/shadcn-ui/progress';
import { Badge } from '@/components/shadcn-ui/badge';
import {
  ChevronLeft,
  ChevronRight,
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
  Home
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

// Define the possible status types
type CardStatus = 'correct' | 'incorrect' | 'skipped' | null;

// Interface for flashcard
interface Flashcard {
  id: number;
  word: string;
  definition: string;
  context: string | undefined;
  stage: number;
  reviewed: boolean;
  status: CardStatus;
}

const FlashcardReview = () => {
  const t = useTranslations('Review');
  const router = useRouter();

  // Mock review session data
  const [session, setSession] = useState({
    current: 0,
    total: 12,
    correct: 0,
    incorrect: 0,
    skipped: 0,
    timeSpent: 0,
    isComplete: false,
    isPaused: false
  });

  // Mock flashcards data with proper typing
  const [cards, setCards] = useState<Flashcard[]>([
    {
      id: 1,
      word: "ephemeral",
      definition: "Lasting for a very short time",
      context: "The beauty of cherry blossoms is ephemeral, lasting only a few days each year.",
      stage: 3,
      reviewed: false,
      status: null // now properly typed as null
    },
    {
      id: 2,
      word: "ubiquitous",
      definition: "Present, appearing, or found everywhere",
      context: "Mobile phones have become ubiquitous in modern society.",
      stage: 2,
      reviewed: false,
      status: null
    },
    {
      id: 3,
      word: "serendipity",
      definition: "The occurrence of events by chance in a happy or beneficial way",
      context: "Finding my favorite book in that tiny bookstore was pure serendipity.",
      stage: 1,
      reviewed: false,
      status: null
    },
    // Additional cards would be here in real implementation
  ]);

  // State for tracking card flip
  const [isFlipped, setIsFlipped] = useState(false);

  // State for tracking session timer
  const [timer, setTimer] = useState(0);

  // State for showing hint
  const [showHint, setShowHint] = useState(false);

  // Effect for timer
  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;

    if (!session.isPaused && !session.isComplete) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        setSession(prev => ({...prev, timeSpent: prev.timeSpent + 1}));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [session.isPaused, session.isComplete]);

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

  // Handle marking card as correct
  const handleCorrect = () => {
    // Update card status
    const updatedCards = [...cards];
    updatedCards[session.current] = {
      ...updatedCards[session.current],
      reviewed: true,
      status: 'correct'
    };

    setCards(updatedCards);

    // Update session stats
    setSession(prev => ({
      ...prev,
      correct: prev.correct + 1,
      current: prev.current + 1,
      isComplete: prev.current + 1 >= prev.total
    }));

    // Reset card flip
    setIsFlipped(false);
    setShowHint(false);
  };

  // Handle marking card as incorrect
  const handleIncorrect = () => {
    // Update card status
    const updatedCards = [...cards];
    updatedCards[session.current] = {
      ...updatedCards[session.current],
      reviewed: true,
      status: 'incorrect'
    };

    setCards(updatedCards);

    // Update session stats
    setSession(prev => ({
      ...prev,
      incorrect: prev.incorrect + 1,
      current: prev.current + 1,
      isComplete: prev.current + 1 >= prev.total
    }));

    // Reset card flip
    setIsFlipped(false);
    setShowHint(false);
  };

  // Handle skipping card
  const handleSkip = () => {
    // Update card status
    const updatedCards = [...cards];
    updatedCards[session.current] = {
      ...updatedCards[session.current],
      reviewed: true,
      status: 'skipped'
    };

    setCards(updatedCards);

    // Update session stats
    setSession(prev => ({
      ...prev,
      skipped: prev.skipped + 1,
      current: prev.current + 1,
      isComplete: prev.current + 1 >= prev.total
    }));

    // Reset card flip
    setIsFlipped(false);
    setShowHint(false);
  };

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

  // Render session complete view
  if (session.isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-2xl bg-white shadow-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <Trophy className="h-20 w-20 text-amber-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {t('sessionComplete')}
              </h1>
              <p className="text-gray-600 mb-6">
                {t('youCompleted')} {session.total} {t('words')}
              </p>

              <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-8">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">{t('correct')}</p>
                  <p className="text-2xl font-bold text-green-600">{session.correct}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">{t('incorrect')}</p>
                  <p className="text-2xl font-bold text-red-600">{session.incorrect}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">{t('skipped')}</p>
                  <p className="text-2xl font-bold text-blue-600">{session.skipped}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                  onClick={() => router.push('/dashboard')}
                >
                  <Home className="h-4 w-4" />
                  {t('returnToDashboard')}
                </Button>
                <Button
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                  size="lg"
                  onClick={() => {
                    // Reset session
                    setSession({
                      current: 0,
                      total: session.total,
                      correct: 0,
                      incorrect: 0,
                      skipped: 0,
                      timeSpent: 0,
                      isComplete: false,
                      isPaused: false
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => router.push('/dashboard')}
            >
              <ChevronLeft className="h-4 w-4" />
              {t('back')}
            </Button>
            <h1 className="text-lg font-semibold">{t('flashcardReview')}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="flex items-center gap-1 bg-purple-100 text-purple-800 border-purple-200">
              <Clock className="h-3 w-3" />
              {formatTime(timer)}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={togglePause}
            >
              {session.isPaused ? t('resume') : t('pause')}
              {session.isPaused ?
                <RotateCcw className="h-4 w-4" /> :
                <Pause className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-4 flex flex-col items-center justify-center">
        {/* Progress bar */}
        <div className="w-full max-w-2xl mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-500">
              {t('progress')}: {session.current + 1}/{session.total}
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" /> {session.correct}
              </span>
              <span className="flex items-center gap-1 text-sm text-red-600">
                <X className="h-4 w-4" /> {session.incorrect}
              </span>
              <span className="flex items-center gap-1 text-sm text-blue-600">
                <SkipForward className="h-4 w-4" /> {session.skipped}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Flashcard */}
        <div
          className={`w-full max-w-2xl h-80 md:h-96 relative perspective-1000 ${session.isPaused ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={handleFlip}
        >
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Card Front */}
            <div className="absolute w-full h-full rounded-xl shadow-lg bg-white flex flex-col items-center justify-center p-6 backface-hidden">
              <Badge
                className={`mb-6 ${
                  currentCard.stage <= 2 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    currentCard.stage <= 4 ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                      'bg-purple-100 text-purple-800 border-purple-200'
                }`}
              >
                {t('stage')} {currentCard.stage}/6
              </Badge>

              <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
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
                <Volume2 className="h-5 w-5" />
              </Button>

              <p className="text-gray-500 mt-auto text-center text-sm">
                {t('tapToReveal')}
              </p>
            </div>

            {/* Card Back */}
            <div className="absolute w-full h-full rounded-xl shadow-lg bg-white flex flex-col items-center p-6 rotate-y-180 backface-hidden">
              <h3 className="text-xl font-medium text-gray-700 mb-4">
                {t('definition')}:
              </h3>

              <p className="text-center text-gray-800 text-lg mb-4">
                {currentCard.definition}
              </p>

              {(showHint || currentCard.context) && (
                <div className="mt-2 mb-4 w-full">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    {t('exampleContext')}:
                  </h4>
                  <p className="text-sm italic text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                    {currentCard.context}
                  </p>
                </div>
              )}

              {!showHint && !currentCard.context && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 mb-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(true);
                  }}
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  {t('showContext')}
                </Button>
              )}

              <div className="mt-auto flex items-center gap-3 w-full justify-center">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncorrect();
                  }}
                >
                  <X className="h-5 w-5 mr-1" />
                  {t('incorrect')}
                </Button>

                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkip();
                  }}
                >
                  <SkipForward className="h-5 w-5 mr-1" />
                  {t('skip')}
                </Button>

                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCorrect();
                  }}
                >
                  <Check className="h-5 w-5 mr-1" />
                  {t('correct')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pause overlay */}
        {session.isPaused && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <Card className="w-full max-w-md bg-white shadow-lg">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-bold mb-4">{t('sessionPaused')}</h2>
                <p className="text-gray-600 mb-6">{t('sessionPausedDescription')}</p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                  >
                    {t('quitSession')}
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
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

      {/* Navigation arrows (only visible on larger screens) */}
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

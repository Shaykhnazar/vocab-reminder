'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { Button } from '@/components/shadcn-ui/button';
import { Progress } from '@/components/shadcn-ui/progress';
import { Badge } from '@/components/shadcn-ui/badge';
import { Input } from '@/components/shadcn-ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/shadcn-ui/alert';
import {
  Calendar,
  Clock,
  Award,
  BookOpen,
  Plus,
  TrendingUp,
  List,
  Search,
  Star,
  Bell,
  Brain,
  BarChart3,
  Zap,
  CheckCircle2,
  ArrowRight,
  Crown,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  currentSubscription: {
    id: string;
    status: string;
    planName: string;
    expiresAt: string;
    startsAt: string;
    daysRemaining: number;
    features: string[];
    wordLimit: number;
    wordsUsed: number;
    wordsRemaining: number;
    gumroadUrl?: string;
  } | null;
}

const VocabularyDashboard = () => {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Mock data for visualization
  const stats = {
    totalWords: 154,
    newWords: 24,
    learningWords: 47,
    masteredWords: 83,
    reviewsDue: 12,
    streak: 7,
    successRate: 87,
    retentionRate: 92
  };

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscriptions');
        if (!response.ok) throw new Error('Failed to fetch subscription');
        const data = await response.json();
        setSubscription({
          currentSubscription: data.currentSubscription ? {
            ...data.currentSubscription,
            gumroadUrl: data.currentSubscription?.gumroadUrl || '/subscriptions'
          } : null
        });
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast({
          title: t('toast.error'),
          description: t('errors.subscriptionFetchFailed'),
          variant: 'destructive',
        });
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscription();
  }, [toast, t]);

  // Calculate percentages for progress bars
  const newPercentage = (stats.newWords / stats.totalWords) * 100;
  const learningPercentage = (stats.learningWords / stats.totalWords) * 100;
  const masteredPercentage = (stats.masteredWords / stats.totalWords) * 100;

  // Calculate word usage percentage
  const wordUsagePercentage = subscription?.currentSubscription
    ? (subscription.currentSubscription.wordsUsed / subscription.currentSubscription.wordLimit) * 100
    : 0;

  // Check subscription status
  const isExpiring = subscription?.currentSubscription?.daysRemaining
    ? subscription.currentSubscription.daysRemaining < 7 && subscription.currentSubscription.daysRemaining > 0
    : false;
  const isExpired = subscription?.currentSubscription?.status === 'expired';
  const isActive = subscription?.currentSubscription?.status === 'active';
  const canAddWords = subscription?.currentSubscription
    ? subscription.currentSubscription.wordsRemaining > 0
    : true;

  // Mock upcoming reviews
  const upcomingReviews = [
    { day: t('cards.upcoming.today'), count: 12, isActive: true },
    { day: t('cards.upcoming.tomorrow'), count: 8, isActive: false },
    { day: t('cards.upcoming.inDays', { days: 3 }), count: 14, isActive: false }
  ];

  // Mock sample words for the list
  const sampleWords = [
    { word: "ephemeral", definition: t('exampleWords.ephemeral'), stage: 3, dueToday: true },
    { word: "ubiquitous", definition: t('exampleWords.ubiquitous'), stage: 5, dueToday: false, mastered: true },
    { word: "serendipity", definition: t('exampleWords.serendipity'), stage: 2, dueToday: true },
    { word: "eloquent", definition: t('exampleWords.eloquent'), stage: 4, dueToday: false },
    { word: "pragmatic", definition: t('exampleWords.pragmatic'), stage: 1, dueToday: true, new: true }
  ];

  // Filter sample words based on search term
  const filteredWords = sampleWords.filter(item =>
    item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStageColor = (stage: number, mastered: boolean | undefined, isNew: boolean | undefined) => {
    if (mastered) return "bg-green-500";
    if (isNew) return "bg-gray-500";

    const colors = [
      "bg-blue-500",
      "bg-cyan-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-yellow-500"
    ];

    return colors[stage - 1] || "bg-blue-500";
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Subscription Alert - Mobile Responsive */}
      {!subscriptionLoading && subscription?.currentSubscription && (
        <Alert className={`
          ${isActive && !isExpiring ? 'bg-green-50 border-green-200' : ''}
          ${isExpiring ? 'bg-amber-50 border-amber-200' : ''}
          ${isExpired ? 'bg-red-50 border-red-200' : ''}
        `}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              {isActive && !isExpiring && <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 sm:mt-0 flex-shrink-0" />}
              {isExpiring && <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5 sm:mt-0 flex-shrink-0" />}
              {isExpired && <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 sm:mt-0 flex-shrink-0" />}
              <div>
                <AlertTitle className={`text-sm sm:text-base font-medium mb-1
                  ${isActive && !isExpiring ? 'text-green-800' : ''}
                  ${isExpiring ? 'text-amber-800' : ''}
                  ${isExpired ? 'text-red-800' : ''}
                `}>
                  {isActive && !isExpiring && t('subscription.active')}
                  {isExpiring && t('subscription.expiring')}
                  {isExpired && t('subscription.expired')}
                </AlertTitle>
                <AlertDescription className={`text-xs sm:text-sm
                  ${isActive && !isExpiring ? 'text-green-700' : ''}
                  ${isExpiring ? 'text-amber-700' : ''}
                  ${isExpired ? 'text-red-700' : ''}
                `}>
                  {isActive && !isExpiring && t('subscription.activeDesc', { plan: subscription.currentSubscription.planName, wordsRemaining: subscription.currentSubscription.wordsRemaining})}
                  {isExpiring && t('subscription.expiringDesc', { days: subscription.currentSubscription.daysRemaining})}
                  {isExpired && t('subscription.expiredDesc')}
                </AlertDescription>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {(isExpiring || isExpired) && (
                <Button size="sm" asChild className="flex-1 sm:flex-initial text-xs sm:text-sm">
                  <Link href="/subscriptions">
                    <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {t('subscription.renew')}
                  </Link>
                </Button>
              )}
              <Button size="sm" variant="outline" asChild className="flex-1 sm:flex-initial text-xs sm:text-sm">
                <Link href="/billing">
                  {t('subscription.manage')}
                </Link>
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Dashboard Header with Cards - Mobile Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  {t('welcomeUser', { name: 'Alex' })}
                </h1>
                <p className="mt-1 text-sm sm:text-base text-purple-100">
                  {stats.reviewsDue > 0
                    ? t('reviewsWaiting', { count: stats.reviewsDue })
                    : t('allCaughtUp')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="bg-white text-purple-700 hover:bg-purple-50 flex-1 sm:flex-initial"
                  onClick={() => router.push('/words')}
                  size="sm"
                  disabled={!canAddWords}
                >
                  <Plus size={14} className="mr-1" />
                  {t('addWord')}
                </Button>
                {stats.reviewsDue > 0 && (
                  <Button
                    className="bg-purple-800 text-white hover:bg-purple-900 flex-1 sm:flex-initial"
                    onClick={() => router.push('/review')}
                    size="sm"
                  >
                    <Clock size={14} className="mr-1" />
                    {t('startReview')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-100 p-2.5 sm:p-3 rounded-full">
                <Brain size={20} className="text-blue-600 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">{t('learningProgress')}</div>
                <div className="text-xl sm:text-2xl font-bold">{stats.totalWords} {t('words')}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-green-600 text-xs font-medium">+5 {t('thisWeek')}</span>
                  <TrendingUp size={12} className="text-green-600 sm:w-[14px] sm:h-[14px]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-amber-100 p-2.5 sm:p-3 rounded-full">
                <Award size={20} className="text-amber-600 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">{t('currentStreak')}</div>
                <div className="text-xl sm:text-2xl font-bold">{stats.streak} {t('days')}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
                    {t('personalBest')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Main Content - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Statistics and Progress */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Word Usage Card */}
          {subscription?.currentSubscription && (
            <Card className="bg-white shadow-sm border-none">
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Crown size={16} className="text-amber-500 sm:w-[18px] sm:h-[18px]" />
                  {t('subscription.usage')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span>{t('subscription.used')}</span>
                      <span className="font-medium">
                        {subscription.currentSubscription.wordsUsed} / {subscription.currentSubscription.wordLimit}
                      </span>
                    </div>
                    <Progress
                      value={wordUsagePercentage}
                      className={`h-2 ${
                        wordUsagePercentage >= 90 ? 'bg-red-200' : 
                        wordUsagePercentage >= 75 ? 'bg-amber-200' : 
                        'bg-green-200'
                      }`}
                    />
                    {wordUsagePercentage >= 90 && (
                      <p className="text-xs text-red-600 mt-1">
                        {t('subscription.almostFull')}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      {t('subscription.plan', { plan: subscription.currentSubscription.planName})}
                    </p>
                    <Button size="sm" variant="outline" asChild className="w-full text-xs sm:text-sm">
                      <Link href="/subscriptions">
                        {t('subscription.upgrade')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Progress */}
          <Card className="bg-white shadow-sm border-none">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-500 sm:w-[18px] sm:h-[18px]" />
                {t('cards.progress.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      {t('cards.progress.new')}
                    </span>
                    <span className="font-medium">
                      {t('cards.progress.wordCount', { count: stats.newWords })}
                    </span>
                  </div>
                  <Progress
                    value={newPercentage}
                    className="h-2"
                    indicator-class-name="bg-gray-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {t('cards.progress.learning')}
                    </span>
                    <span className="font-medium">
                      {t('cards.progress.wordCount', { count: stats.learningWords })}
                    </span>
                  </div>
                  <Progress
                    value={learningPercentage}
                    className="h-2"
                    indicator-class-name="bg-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {t('cards.progress.mastered')}
                    </span>
                    <span className="font-medium">
                      {t('cards.progress.wordCount', { count: stats.masteredWords })}
                    </span>
                  </div>
                  <Progress
                    value={masteredPercentage}
                    className="h-2"
                    indicator-class-name="bg-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="bg-white shadow-sm border-none">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Zap size={16} className="text-indigo-500 sm:w-[18px] sm:h-[18px]" />
                {t('cards.stats.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700">{t('cards.stats.successRate')}</p>
                  <p className="text-lg sm:text-xl font-bold text-green-700">{stats.successRate}%</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-700">{t('cards.stats.retention')}</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-700">{stats.retentionRate}%</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">{t('cards.stats.streak')}</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-700">
                    {t('cards.stats.days', { count: stats.streak })}
                  </p>
                </div>
                <div className="p-2.5 sm:p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-700">{t('cards.stats.totalWords')}</p>
                  <p className="text-lg sm:text-xl font-bold text-amber-700">{stats.totalWords}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle and Right Column: Upcoming Reviews and Word List */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          {/* Upcoming Reviews */}
          <Card className="bg-white shadow-sm border-none overflow-hidden">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500 sm:w-[18px] sm:h-[18px]" />
                {t('cards.upcoming.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {upcomingReviews.map((review, i) => (
                  <div
                    key={i}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 rounded-lg ${
                      review.isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {review.isActive && <Bell size={14} className="text-blue-500 sm:w-4 sm:h-4" />}
                      <span className="font-medium text-sm">{review.day}</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      <span className={`px-2 py-1 rounded-md text-xs sm:text-sm font-medium ${
                        review.isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {t('cards.upcoming.wordCount', { count: review.count })}
                      </span>
                      {review.isActive && (
                        <Button
                          size="sm"
                          className="text-xs bg-blue-600 hover:bg-blue-700"
                          onClick={() => router.push('/review')}
                        >
                          {t('review')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Words List */}
          <Card className="bg-white shadow-sm border-none">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <BookOpen size={16} className="text-purple-500 sm:w-[18px] sm:h-[18px]" />
                  {t('wordList.title')}
                </CardTitle>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-[200px] h-8 text-sm"
                  />
                </div>
              </div>
              <CardDescription className="text-xs sm:text-sm">{t('wordList.description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  {/* Tabs with horizontal scroll on mobile */}
                  <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <TabsList className="inline-flex md:grid md:grid-cols-4 h-9 gap-1">
                      <TabsTrigger value="all" className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-white">
                        <List size={12} className="mr-1"/>
                        <span className="hidden sm:inline">{t('tabs.all')}</span>
                        <span className="sm:hidden">{t('tabs.all')}</span>
                      </TabsTrigger>
                      <TabsTrigger value="new" className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-white">
                        <Plus size={12} className="mr-1"/>
                        <span className="hidden sm:inline">{t('tabs.new')}</span>
                        <span className="sm:hidden">{t('tabs.new')}</span>
                      </TabsTrigger>
                      <TabsTrigger value="learning" className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-white">
                        <TrendingUp size={12} className="mr-1"/>
                        <span className="hidden sm:inline">{t('tabs.learning')}</span>
                        <span className="sm:hidden">{t('tabs.learning')}</span>
                      </TabsTrigger>
                      <TabsTrigger value="mastered" className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-white">
                        <CheckCircle2 size={12} className="mr-1"/>
                        <span className="hidden sm:inline">{t('tabs.mastered')}</span>
                        <span className="sm:hidden">{t('tabs.mastered')}</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                    <TabsContent value="all" className="mt-0">
                      <div className="space-y-2">
                        {filteredWords.length > 0 ? (
                          filteredWords.map((item, i) => (
                            <div
                              key={i}
                              className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 rounded-lg border ${
                                item.dueToday
                                  ? 'border-blue-200 bg-blue-50'
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              <div className="flex gap-3 items-start sm:items-center">
                                <div
                                  className={`w-2 h-full min-h-[40px] rounded-full flex-shrink-0 ${
                                    getStageColor(item.stage, item.mastered, item.new)
                                  }`}
                                ></div>
                                <div>
                                  <p className="font-medium text-sm flex items-center">
                                    {item.word}
                                    {item.mastered &&
                                      <Star size={12} className="ml-1.5 text-yellow-500 fill-yellow-500"/>}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                    {item.definition}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.mastered
                                ? 'bg-green-100 text-green-700'
                                : item.new
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}>
                              {item.mastered
                                ? t('wordList.mastered')
                                : item.new
                                  ? t('wordList.new')
                                  : t('wordList.stage', {stage: item.stage})}
                            </span>
                                {item.dueToday && (
                                  <Button variant="outline" size="sm" className="text-xs h-7">
                                    {t('wordList.review')}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            {t('noMatchingWords')}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="new">
                      <div className="text-center py-6 text-gray-500 text-sm">
                        {t('tabContent.new')}
                      </div>
                    </TabsContent>
                    <TabsContent value="learning">
                      <div className="text-center py-6 text-gray-500 text-sm">
                        {t('tabContent.learning')}
                      </div>
                    </TabsContent>
                    <TabsContent value="mastered">
                      <div className="text-center py-6 text-gray-500 text-sm">
                        {t('tabContent.mastered')}
                      </div>
                    </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0">
              <Button variant="outline" className="text-xs sm:text-sm h-8">
                {t('pagination.previous')}
              </Button>
              <Link href="/words" className="flex items-center text-purple-600 font-medium text-xs sm:text-sm">
                {t('viewAllWords')}
                <ArrowRight size={12} className="ml-1" />
              </Link>
              <Button variant="outline" className="text-sm">
                {t('pagination.next')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VocabularyDashboard;

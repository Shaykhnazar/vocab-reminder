'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { Button } from '@/components/shadcn-ui/button';
import { Progress } from '@/components/shadcn-ui/progress';
import { Badge } from '@/components/shadcn-ui/badge';
import { Input } from '@/components/shadcn-ui/input';
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
  ArrowRight
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';

const VocabularyDashboard = () => {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

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

  // Calculate percentages for progress bars
  const newPercentage = (stats.newWords / stats.totalWords) * 100;
  const learningPercentage = (stats.learningWords / stats.totalWords) * 100;
  const masteredPercentage = (stats.masteredWords / stats.totalWords) * 100;

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

  const getStageColor = (stage, mastered, isNew) => {
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
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Dashboard Header with Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {t('welcomeUser', { name: 'Alex' })}
                </h1>
                <p className="mt-1 text-purple-100">
                  {stats.reviewsDue > 0
                    ? t('reviewsWaiting', { count: stats.reviewsDue })
                    : t('allCaughtUp')}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  className="bg-white text-purple-700 hover:bg-purple-50"
                  onClick={() => router.push('/words')}
                  size="sm"
                >
                  <Plus size={16} className="mr-1" />
                  {t('addWord')}
                </Button>
                {stats.reviewsDue > 0 && (
                  <Button
                    className="bg-purple-800 text-white hover:bg-purple-900"
                    onClick={() => router.push('/review')}
                    size="sm"
                  >
                    <Clock size={16} className="mr-1" />
                    {t('startReview')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Brain size={24} className="text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('learningProgress')}</div>
                <div className="text-2xl font-bold">{stats.totalWords} {t('words')}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-green-600 text-xs font-medium">+5 {t('thisWeek')}</span>
                  <TrendingUp size={14} className="text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Award size={24} className="text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('currentStreak')}</div>
                <div className="text-2xl font-bold">{stats.streak} {t('days')}</div>
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

      {/* Dashboard Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Statistics and Progress */}
        <div className="flex flex-col gap-6">
          {/* Learning Progress */}
          <Card className="bg-white shadow-sm border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-500" />
                {t('cards.progress.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
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
                    indicatorClassName="bg-gray-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
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
                    indicatorClassName="bg-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
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
                    indicatorClassName="bg-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="bg-white shadow-sm border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap size={18} className="text-indigo-500" />
                {t('cards.stats.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700">{t('cards.stats.successRate')}</p>
                  <p className="text-xl font-bold text-green-700">{stats.successRate}%</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-700">{t('cards.stats.retention')}</p>
                  <p className="text-xl font-bold text-purple-700">{stats.retentionRate}%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">{t('cards.stats.streak')}</p>
                  <p className="text-xl font-bold text-blue-700">
                    {t('cards.stats.days', { count: stats.streak })}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-700">{t('cards.stats.totalWords')}</p>
                  <p className="text-xl font-bold text-amber-700">{stats.totalWords}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle and Right Column: Upcoming Reviews and Word List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Upcoming Reviews */}
          <Card className="bg-white shadow-sm border-none overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar size={18} className="text-indigo-500" />
                {t('cards.upcoming.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingReviews.map((review, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      review.isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {review.isActive && <Bell size={16} className="text-blue-500" />}
                      <span className="font-medium">{review.day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-sm font-medium ${
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
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen size={18} className="text-purple-500" />
                  {t('wordList.title')}
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>
              </div>
              <CardDescription>{t('wordList.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="all" className="flex-1">
                    <List size={14} className="mr-1.5" />
                    {t('tabs.all')}
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex-1">
                    <Plus size={14} className="mr-1.5" />
                    {t('tabs.new')}
                  </TabsTrigger>
                  <TabsTrigger value="learning" className="flex-1">
                    <TrendingUp size={14} className="mr-1.5" />
                    {t('tabs.learning')}
                  </TabsTrigger>
                  <TabsTrigger value="mastered" className="flex-1">
                    <CheckCircle2 size={14} className="mr-1.5" />
                    {t('tabs.mastered')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <div className="space-y-2">
                    {filteredWords.length > 0 ? (
                      filteredWords.map((item, i) => (
                        <div
                          key={i}
                          className={`flex justify-between items-center p-3 rounded-lg border ${
                            item.dueToday 
                              ? 'border-blue-200 bg-blue-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex gap-3 items-center">
                            <div
                              className={`w-2 h-full min-h-[40px] rounded-full ${
                                getStageColor(item.stage, item.mastered, item.new)
                              }`}
                            ></div>
                            <div>
                              <p className="font-medium flex items-center">
                                {item.word}
                                {item.mastered && <Star size={14} className="ml-1.5 text-yellow-500 fill-yellow-500" />}
                              </p>
                              <p className="text-sm text-gray-600">{item.definition}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
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
                                  : t('wordList.stage', { stage: item.stage })}
                            </span>
                            {item.dueToday && (
                              <Button variant="outline" size="sm" className="text-xs">
                                {t('wordList.review')}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        {t('noMatchingWords')}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Other tab contents would be similar */}
                <TabsContent value="new">
                  <div className="text-center py-6 text-gray-500">
                    {t('tabContent.new')}
                  </div>
                </TabsContent>
                <TabsContent value="learning">
                  <div className="text-center py-6 text-gray-500">
                    {t('tabContent.learning')}
                  </div>
                </TabsContent>
                <TabsContent value="mastered">
                  <div className="text-center py-6 text-gray-500">
                    {t('tabContent.mastered')}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="text-sm">
                {t('pagination.previous')}
              </Button>
              <Link href="/words" className="flex items-center text-purple-600 font-medium text-sm">
                {t('viewAllWords')}
                <ArrowRight size={14} className="ml-1" />
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

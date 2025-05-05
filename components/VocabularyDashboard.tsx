'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { Button } from '@/components/shadcn-ui/button';
import { Progress } from '@/components/shadcn-ui/progress';
import { Calendar, Clock, Award, BookOpen, Plus, TrendingUp, List } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const VocabularyDashboard = () => {
    const t = useTranslations('Dashboard');
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 bg-slate-50 min-h-screen">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Vocabry</h1>
                    <p className="text-slate-500">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button className="flex items-center gap-2" variant="outline">
                        <Clock size={18} />
                        <span>{t('reviews', { count: 12 })}</span>
                    </Button>
                    <Button className="flex items-center gap-2" onClick={() => router.push('/words')}>
                        <Plus size={18} />
                        <span>{t('addWord')}</span>
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen size={18} className="text-blue-500" />
                            {t('cards.progress.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{t('cards.progress.new')}</span>
                                    <span className="font-medium">{t('cards.progress.wordCount', { count: 24 })}</span>
                                </div>
                                <Progress value={24} className="h-2 bg-slate-200" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{t('cards.progress.learning')}</span>
                                    <span className="font-medium">{t('cards.progress.wordCount', { count: 47 })}</span>
                                </div>
                                <Progress value={47} className="h-2 bg-slate-200" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{t('cards.progress.mastered')}</span>
                                    <span className="font-medium">{t('cards.progress.wordCount', { count: 83 })}</span>
                                </div>
                                <Progress value={83} className="h-2 bg-slate-200" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar size={18} className="text-indigo-500" />
                            {t('cards.upcoming.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                                <span className="font-medium">{t('cards.upcoming.today')}</span>
                                <span className="px-2 py-1 bg-blue-100 rounded-md font-medium text-blue-700">
                  {t('cards.upcoming.wordCount', { count: 12 })}
                </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg">
                                <span className="font-medium">{t('cards.upcoming.tomorrow')}</span>
                                <span className="px-2 py-1 bg-slate-100 rounded-md font-medium text-slate-700">
                  {t('cards.upcoming.wordCount', { count: 8 })}
                </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg">
                                <span className="font-medium">{t('cards.upcoming.inDays', { days: 3 })}</span>
                                <span className="px-2 py-1 bg-slate-100 rounded-md font-medium text-slate-700">
                  {t('cards.upcoming.wordCount', { count: 14 })}
                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Award size={18} className="text-amber-500" />
                            {t('cards.stats.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-xs text-green-700">{t('cards.stats.successRate')}</p>
                                <p className="text-xl font-bold text-green-700">87%</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-purple-700">{t('cards.stats.retention')}</p>
                                <p className="text-xl font-bold text-purple-700">92%</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-700">{t('cards.stats.streak')}</p>
                                <p className="text-xl font-bold text-blue-700">{t('cards.stats.days', { count: 7 })}</p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <p className="text-xs text-amber-700">{t('cards.stats.totalWords')}</p>
                                <p className="text-xl font-bold text-amber-700">154</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                        <List size={16} />
                        {t('tabs.all')}
                    </TabsTrigger>
                    <TabsTrigger value="new" className="flex items-center gap-2">
                        <Plus size={16} />
                        {t('tabs.new')}
                    </TabsTrigger>
                    <TabsTrigger value="learning" className="flex items-center gap-2">
                        <TrendingUp size={16} />
                        {t('tabs.learning')}
                    </TabsTrigger>
                    <TabsTrigger value="mastered" className="flex items-center gap-2">
                        <Award size={16} />
                        {t('tabs.mastered')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>{t('wordList.title')}</CardTitle>
                            <CardDescription>{t('wordList.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {[
                                    { word: "ephemeral", definition: t('exampleWords.ephemeral'), stage: 3 },
                                    { word: "ubiquitous", definition: t('exampleWords.ubiquitous'), stage: 5 },
                                    { word: "serendipity", definition: t('exampleWords.serendipity'), stage: 2 },
                                    { word: "eloquent", definition: t('exampleWords.eloquent'), stage: 4 },
                                    { word: "pragmatic", definition: t('exampleWords.pragmatic'), stage: 1 }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                                        <div>
                                            <p className="font-medium">{item.word}</p>
                                            <p className="text-sm text-slate-500">{item.definition}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        {t('wordList.stage', { stage: item.stage })}
                      </span>
                                            <Button variant="ghost" size="sm">{t('wordList.review')}</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline">{t('pagination.previous')}</Button>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" className="w-8 h-8 p-0">1</Button>
                                <Button variant="outline" size="sm" className="w-8 h-8 p-0">2</Button>
                                <Button variant="outline" size="sm" className="w-8 h-8 p-0">3</Button>
                            </div>
                            <Button variant="outline">{t('pagination.next')}</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default VocabularyDashboard;
// app/(app)/words/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getTranslations } from 'next-intl/server';
import WordsList from "@/components/WordsList";
import WordForm from "@/components/WordForm";
import ImageWordExtractor from "@/components/ImageWordExtractor";
import BulkWordAdder from "@/components/BulkWordAdder";
import DictionarySubscription from "@/components/DictionarySubscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Book, Plus, Upload, Camera, BookOpen, Brain } from "lucide-react";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Words' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function Words() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const t = await getTranslations('Words');

  return (
    <main className="container mx-auto px-4 py-4 md:py-6 max-w-6xl">
      {/* Header Section - Stack vertically on mobile */}
      <div className="flex flex-col gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-purple-700">{t('title')}</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">{t('description') || 'Manage your vocabulary collection'}</p>
        </div>

        {/* Learning Progress Card - Full width on mobile */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg px-3 py-2 md:px-4 md:py-2 border border-purple-100">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 md:h-5 md:w-5 text-purple-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">Learning Progress</div>
              <div className="text-xs text-gray-500 truncate">5 words due for review today</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="my-words" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          {/* Tabs with horizontal scroll on mobile */}
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <TabsList className="inline-flex h-10 min-w-full md:w-full bg-gray-100 md:bg-gray-100/50 rounded-lg p-1">
              <TabsTrigger value="my-words" className="flex-1 min-w-[120px] text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap">
                <Book className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{t('tabs.myWords')}</span>
                <span className="sm:hidden">{t('tabs.myWords')}</span>
              </TabsTrigger>
              <TabsTrigger value="add-word" className="flex-1 min-w-[120px] text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap">
                <Plus className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{t('tabs.addSingle')}</span>
                <span className="sm:hidden">{t('tabs.addSingle')}</span>
              </TabsTrigger>
              <TabsTrigger value="import" className="flex-1 min-w-[120px] text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap">
                <Upload className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{t('tabs.addMultiple')}</span>
                <span className="sm:hidden">{t('tabs.addMultiple')}</span>
              </TabsTrigger>
              <TabsTrigger value="dictionaries" className="flex-1 min-w-[120px] text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap">
                <BookOpen className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{t('tabs.dictionaries')}</span>
                <span className="sm:hidden">{t('tabs.dictionaries')}</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* My Words Tab */}
        <TabsContent value="my-words" className="mt-0">
          <Card className="border-0 md:border shadow-none md:shadow-sm">
            <CardContent className="p-0 md:p-6">
              <WordsList />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Word Tab - Stack cards on mobile */}
        <TabsContent value="add-word" className="mt-0">
          <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
            {/* Single Word Card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 md:p-4">
                <h2 className="text-white text-base md:text-lg font-medium flex items-center">
                  <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  {t('addSingle.title')}
                </h2>
                <p className="text-white/80 text-xs md:text-sm">
                  {t('addSingleDescription')}
                </p>
              </div>
              <CardContent className="p-4 md:p-6">
                <WordForm />
              </CardContent>
            </Card>

            {/* Image Extraction Card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 md:p-4">
                <h2 className="text-white text-base md:text-lg font-medium flex items-center">
                  <Camera className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  {t('extractImage.title')}
                </h2>
                <p className="text-white/80 text-xs md:text-sm">
                  {t('extractImageDescription')}
                </p>
              </div>
              <CardContent className="p-4 md:p-6">
                <ImageWordExtractor />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="mt-0">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 md:p-4">
              <h2 className="text-white text-base md:text-lg font-medium flex items-center">
                <Upload className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                {t('addMultiple.title')}
              </h2>
              <p className="text-white/80 text-xs md:text-sm">
                {t('addMultipleDescription')}
              </p>
            </div>
            <CardContent className="p-4 md:p-6">
              <BulkWordAdder />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dictionaries Tab */}
        <TabsContent value="dictionaries" className="mt-0">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 md:p-4">
              <h2 className="text-white text-base md:text-lg font-medium flex items-center">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                {t('dictionaries.title')}
              </h2>
              <p className="text-white/80 text-xs md:text-sm">
                {t('dictionaryDescription')}
              </p>
            </div>
            <CardContent className="p-4 md:p-6">
              <DictionarySubscription />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

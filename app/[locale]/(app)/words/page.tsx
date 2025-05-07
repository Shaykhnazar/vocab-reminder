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

  // If no session, redirect to sign in
  if (!session) {
    redirect("/login");
  }

  const t = await getTranslations('Words');

  return (
    <main className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">{t('title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('description') || 'Manage your vocabulary collection'}</p>
        </div>

        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg px-4 py-2 border border-purple-100">
          <Brain className="h-5 w-5 text-purple-600" />
          <div>
            <div className="text-sm font-medium">Learning Progress</div>
            <div className="text-xs text-gray-500">5 words due for review today</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="my-words" className="w-full">
        <TabsList className="grid grid-cols-4 gap-2 mb-6">
          <TabsTrigger value="my-words" className="flex items-center justify-center gap-1.5">
            <Book className="h-4 w-4" />
            <span>{t('tabs.myWords')}</span>
          </TabsTrigger>
          <TabsTrigger value="add-word" className="flex items-center justify-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>{t('tabs.addSingle')}</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center justify-center gap-1.5">
            <Upload className="h-4 w-4" />
            <span>{t('tabs.addMultiple')}</span>
          </TabsTrigger>
          <TabsTrigger value="dictionaries" className="flex items-center justify-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>{t('tabs.dictionaries')}</span>
          </TabsTrigger>
        </TabsList>

        {/* My Words Tab */}
        <TabsContent value="my-words">
          <Card>
            <CardContent className="p-6">
              <WordsList />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Word Tab */}
        <TabsContent value="add-word">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Single Word Card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                <h2 className="text-white text-lg font-medium flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  {t('addSingle.title')}
                </h2>
                <p className="text-white/80 text-sm">
                  {t('addSingleDescription')}
                </p>
              </div>
              <CardContent className="p-6">
                <WordForm />
              </CardContent>
            </Card>

            {/* Image Extraction Card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
                <h2 className="text-white text-lg font-medium flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  {t('extractImage.title')}
                </h2>
                <p className="text-white/80 text-sm">
                  {t('extractImageDescription')}
                </p>
              </div>
              <CardContent className="p-6">
                <ImageWordExtractor />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
              <h2 className="text-white text-lg font-medium flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                {t('addMultiple.title')}
              </h2>
              <p className="text-white/80 text-sm">
                {t('addMultipleDescription')}
              </p>
            </div>
            <CardContent className="p-6">
              <BulkWordAdder />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dictionaries Tab */}
        <TabsContent value="dictionaries">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <h2 className="text-white text-lg font-medium flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                {t('dictionaries.title')}
              </h2>
              <p className="text-white/80 text-sm">
                {t('dictionaryDescription')}
              </p>
            </div>
            <CardContent className="p-6">
              <DictionarySubscription />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

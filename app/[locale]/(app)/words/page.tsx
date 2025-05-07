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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Book, Plus, Upload, Camera, BookOpen, CheckCircle, List } from "lucide-react";

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-700">{t('title')}</h1>
        <div className="bg-purple-50 text-purple-700 rounded-full px-4 py-1 text-sm font-medium flex items-center">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span>Words to review: 5</span>
        </div>
      </div>

      <Tabs defaultValue="my-words" className="w-full">
        <TabsList className="mb-6 grid grid-cols-3 gap-2">
          <TabsTrigger value="my-words" className="flex items-center justify-center">
            <List className="h-4 w-4 mr-2" />
            {t('tabs.myWords')}
          </TabsTrigger>
          <TabsTrigger value="add-word" className="flex items-center justify-center">
            <Plus className="h-4 w-4 mr-2" />
            {t('tabs.addWords')}
          </TabsTrigger>
          <TabsTrigger value="dictionaries" className="flex items-center justify-center">
            <BookOpen className="h-4 w-4 mr-2" />
            {t('tabs.dictionaries')}
          </TabsTrigger>
        </TabsList>

        {/* My Words Tab */}
        <TabsContent value="my-words">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">{t('yourWords.title')}</CardTitle>
              <CardDescription>
                Track your learning progress and review your vocabulary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WordsList />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Word Tab */}
        <TabsContent value="add-word">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Single Word Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-purple-600" />
                  <CardTitle className="text-lg">{t('addSingle.title')}</CardTitle>
                </div>
                <CardDescription>
                  Add individual words to your vocabulary list
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WordForm />
              </CardContent>
            </Card>

            {/* Image Extraction Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-blue-600" />
                  <CardTitle className="text-lg">{t('extractImage.title')}</CardTitle>
                </div>
                <CardDescription>
                  Extract words from images or screenshots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageWordExtractor />
              </CardContent>
            </Card>

            {/* Bulk Add Card */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-4">
                <div className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-green-600" />
                  <CardTitle className="text-lg">{t('addMultiple.title')}</CardTitle>
                </div>
                <CardDescription>
                  Import multiple words at once from text or CSV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkWordAdder />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dictionaries Tab */}
        <TabsContent value="dictionaries">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                <CardTitle className="text-xl">{t('dictionaries.title')}</CardTitle>
              </div>
              <CardDescription>
                Browse and subscribe to pre-made vocabulary sets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DictionarySubscription />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

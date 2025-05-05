// app/(app)/words/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import WordForm from "@/components/WordForm";
import WordsList from "@/components/WordsList";
import ImageWordExtractor from "@/components/ImageWordExtractor";
import BulkWordAdder from "@/components/BulkWordAdder";
import DictionarySubscription from "@/components/DictionarySubscription";
import { authOptions } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
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
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <Tabs defaultValue="add-words" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="add-words">{t('tabs.addWords')}</TabsTrigger>
          <TabsTrigger value="my-words">{t('tabs.myWords')}</TabsTrigger>
          <TabsTrigger value="dictionaries">{t('tabs.dictionaries')}</TabsTrigger>
        </TabsList>

        <TabsContent value="add-words">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('addSingle.title')}</h2>
                <WordForm />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">{t('extractImage.title')}</h2>
                <ImageWordExtractor />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">{t('addMultiple.title')}</h2>
              <BulkWordAdder />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-words">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('yourWords.title')}</h2>
            <WordsList />
          </div>
        </TabsContent>

        <TabsContent value="dictionaries">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('dictionaries.title')}</h2>
            <DictionarySubscription />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

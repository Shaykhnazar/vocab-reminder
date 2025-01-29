// app/page.tsx
import WordForm from '@/components/WordForm';
import WordsList from '@/components/WordsList';
import { addWord } from './actions';
import {supabase, Word} from '@/lib/supabase';

export default async function Home() {

  const { data: words } = await supabase
    .from('words')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Vocabulary Reminder</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Word</h2>
          <WordForm
            onSubmit={async (wordData: Partial<Word>) => {
              'use server';
              if (wordData.word && wordData.definition) {
                const context = wordData.context || undefined;
                await addWord(wordData.word, wordData.definition, context);
              }
            }}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Words</h2>
          <WordsList initialWords={words || []} />
        </div>
      </div>
    </main>
  );
}

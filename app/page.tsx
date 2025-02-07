// app/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import {supabase, Word} from "@/lib/supabase";
import WordForm from "@/components/WordForm";
import WordsList from "@/components/WordsList";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If no session, redirect to sign in
  if (!session) {
    redirect("/login");
  }

  const { data: words } = await supabase
    .from("words")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // Define the addNewWord function
  const addNewWord = async (wordData: Partial<Word>) => {
    "use server"; // Mark this function as a Server Action

    if (!wordData.word || !wordData.definition) {
      throw new Error('Word and definition are required');
    }

    // Construct the full URL for the API endpoint
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/words`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: wordData.word,
        definition: wordData.definition,
        context: wordData.context || null,
        userId: session.user.id, // Use session.user.id directly
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add word');
    }

    // Refresh the page to show the new word
    redirect("/");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Vocabulary Reminder</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Word</h2>
          <WordForm onSubmitAction={addNewWord} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Words</h2>
          <WordsList initialWords={words || []} />
        </div>
      </div>
    </main>
  );
}

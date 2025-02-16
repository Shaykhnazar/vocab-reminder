// app/(app)/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import WordForm from "@/components/WordForm";
import WordsList from "@/components/WordsList";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If no session, redirect to sign in
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Vocabulary Reminder</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Word</h2>
          <WordForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Words</h2>
          <WordsList />
        </div>
      </div>
    </main>
  );
}

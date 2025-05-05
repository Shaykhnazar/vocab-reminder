// app/[locale]/signup/page.tsx
import SignUpForm from '@/components/auth/SignUpForm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'Auth.Metadata' });
  return {
    title: t('signup.title'),
    description: t('signup.description'),
  };
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  // If already authenticated, redirect to home
  if (session) {
    redirect("/");
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SignUpForm />
    </div>
  );
}

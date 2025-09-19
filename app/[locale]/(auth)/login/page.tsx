// app/[locale]/login/page.tsx
import SignInForm from '@/components/auth/SignInForm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import { TelegramWebAppAutoAuth } from '@/components/auth/TelegramWebAppAuthSimple';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Auth.Metadata' });
  return {
    title: t('login.title'),
    description: t('login.description'),
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
      {/* Auto-authentication for Telegram Mini Apps */}
      <TelegramWebAppAutoAuth />

      {/* Regular login form */}
      <SignInForm />
    </div>
  );
}

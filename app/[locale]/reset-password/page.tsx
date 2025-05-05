// app/[locale]/reset-password/page.tsx
import ResetPasswordForm from '@/components/auth/reset-password-form';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'Auth.Metadata' });
  return {
    title: t('resetPassword.title'),
    description: t('resetPassword.description'),
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
      <ResetPasswordForm />
    </div>
  );
}

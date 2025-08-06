import VocabularyDashboard from '@/components/VocabularyDashboard';
import { getTranslations } from 'next-intl/server';
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Dashboard.Metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }
  return <VocabularyDashboard />;
}

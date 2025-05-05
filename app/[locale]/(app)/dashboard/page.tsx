import VocabularyDashboard from '@/components/VocabularyDashboard';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'Dashboard.Metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function DashboardPage() {
  return <VocabularyDashboard />;
}
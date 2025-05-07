// app/[locale]/page.tsx
import LandingPage from '@/components/LandingPage';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Home.Metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HomePage() {
  return <LandingPage />;
}

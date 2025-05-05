// app/[locale]/about/page.tsx
import AboutPage from '@/components/AboutPage';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'About.Metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function About() {
  return <AboutPage />;
}
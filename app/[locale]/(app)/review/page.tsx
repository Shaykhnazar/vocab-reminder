import FlashcardReview from '@/components/FlashcardReview';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Review.Metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ReviewPage() {
  return <FlashcardReview />;
}

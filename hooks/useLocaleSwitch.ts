// hooks/useLocaleSwitch.ts
"use client";

import { useRouter } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { type Locale } from '@/config/i18n';

export const useLocaleSwitch = () => {
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const router = useRouter();

  // Get the path without the locale prefix
  const getPathWithoutLocale = () => {
    // Split the pathname by '/'
    const segments = pathname.split('/');
    // Remove the first empty segment and the locale segment
    segments.splice(0, 2);
    // Return the path without locale
    return '/' + segments.join('/');
  };

  // Handle locale change
  const handleLocaleChange = (newLocale: string) => {
    // Get the current path without locale
    const pathWithoutLocale = getPathWithoutLocale();
    // Navigate to the same path with new locale
    router.push(pathWithoutLocale, { locale: newLocale });
  };

  return {
    currentLocale,
    handleLocaleChange
  };
};

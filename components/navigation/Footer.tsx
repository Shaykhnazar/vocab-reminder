// components/navigation/Footer.tsx
"use client";

import React from 'react';
import {Link} from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Image from "next/image";
import LogoSvg from "../../public/logo.svg";
import { locales, localeNames, type Locale } from '@/config/i18n';

const Logo = () => (
  <Link href="/" className="flex items-center">
    <div className="h-14 w-auto">
      <Image
        src={LogoSvg}
        alt="VocabRY"
        className="h-full w-auto"
      />
    </div>
  </Link>
);

// Language flags mapping
const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  ru: "🇷🇺",
  uz: "🇺🇿"
};

// LanguageSelector component for Footer
const FooterLanguageSelector = () => {
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const t = useTranslations('Common');

  // Function to get the new path with the selected locale
  const getLocalizedPath = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale; // Replace the locale segment
    return segments.join('/');
  };

  return (
    <div className="flex flex-wrap gap-2">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={getLocalizedPath(locale)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
            currentLocale === locale 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>{localeFlags[locale]}</span>
          <span>{localeNames[locale]}</span>
        </Link>
      ))}
    </div>
  );
};

export const Footer = () => {
  const t = useTranslations('Footer');

  return (
    <footer className="border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-gray-600">
              {t('tagline')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('quickLinks')}</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                {t('home')}
              </Link>
              <Link href="/about" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                {t('about')}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('plansAndPolicies')}</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/pricing" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                {t('pricing')}
              </Link>
              <Link href="/refund-policy" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                {t('refundPolicy')}
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                {t('privacyPolicy')}
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                {t('termsOfService')}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('language')}</h3>
            <FooterLanguageSelector />

            <h3 className="font-semibold mt-6 mb-4">{t('contact')}</h3>
            <div className="flex flex-col space-y-2">
              <a href="mailto:support@vocabry.com" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                support@vocabry.com
              </a>
              <div className="flex space-x-4 mt-4">
                {/* Add your social media links here */}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

// components/navigation/Footer.tsx
"use client";

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Image from "next/image";
import LogoSvg from "../../public/logo.svg";
import { LanguageSelector } from '@/components/common/LanguageSelector';

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
            <LanguageSelector variant="buttons" />

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

// components/common/LanguageSelector.tsx
"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useLocaleSwitch } from '@/hooks/useLocaleSwitch';
import { Button } from "@/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { CheckIcon } from 'lucide-react';
import { locales, localeNames, type Locale } from '@/config/i18n';

// Language flags mapping
const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  ru: "🇷🇺",
  uz: "🇺🇿",
  de: "🇩🇪",
};

type LanguageSelectorProps = {
  variant?: 'dropdown' | 'buttons';
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'dropdown' }) => {
  const { currentLocale, handleLocaleChange } = useLocaleSwitch();
  const t = useTranslations('Common');
  const [isOpen, setIsOpen] = React.useState(false);

  // For mobile detection
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Buttons variant - used in mobile menu
  if (variant === 'buttons') {
    return (
      <div className="flex flex-wrap gap-2">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
              currentLocale === locale
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{localeFlags[locale]}</span>
            <span>{localeNames[locale]}</span>
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant - default for navbar
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={isMobile ? "default" : "sm"}
          className="flex items-center gap-1"
        >
          <span className="text-lg mr-1">{localeFlags[currentLocale]}</span>
          <span className={isMobile ? "" : "text-sm"}>{localeNames[currentLocale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((locale) => {
          const isActive = currentLocale === locale;

          return (
            <DropdownMenuItem
              key={locale}
              className={`${isActive ? 'bg-purple-50' : ''}`}
              onClick={() => {
                if (!isActive) {
                  handleLocaleChange(locale);
                }
                setIsOpen(false);
              }}
            >
              <div className="flex items-center justify-between w-full py-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{localeFlags[locale]}</span>
                  <span>{localeNames[locale]}</span>
                </div>
                {isActive && <CheckIcon className="h-4 w-4 text-purple-600" />}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

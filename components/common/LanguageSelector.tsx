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
import { Globe } from 'lucide-react';
import { locales, localeNames, type Locale } from '@/config/i18n';

// Language flags mapping
const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  ru: "🇷🇺",
  uz: "🇺🇿"
};

type LanguageSelectorProps = {
  variant?: 'dropdown' | 'buttons';
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'dropdown' }) => {
  const { currentLocale, handleLocaleChange } = useLocaleSwitch();
  const t = useTranslations('Common');

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-auto px-2 flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span className="ml-1">{localeFlags[currentLocale]}</span>
          <span className="sr-only md:not-sr-only md:ml-1 text-xs font-normal">{localeNames[currentLocale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleLocaleChange(l)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span>{localeFlags[l]}</span>
            <span>{localeNames[l]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

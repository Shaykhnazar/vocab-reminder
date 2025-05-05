// components/navigation/Navbar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Image from "next/image";
import { Button } from "@/components/shadcn-ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/shadcn-ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { Menu, Globe } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import LogoSvg from "../../public/logo.svg";
import { locales, localeNames, type Locale } from '@/config/i18n';

// Logo component
export const Logo = () => (
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

// LanguageSelector component
const LanguageSelector = () => {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const t = useTranslations('Common');

  // Function to get the new path with the selected locale
  const getLocalizedPath = (newLocale: string) => {
    // The pathname already contains the current locale as the first segment
    // We need to replace it with the new locale
    const segments = pathname.split('/');
    segments[1] = newLocale; // Replace the locale segment
    return segments.join('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-auto px-2 flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span className="ml-1">{localeFlags[locale]}</span>
          <span className="sr-only md:not-sr-only md:ml-1 text-xs font-normal">{localeNames[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem key={l} asChild>
            <Link
              href={getLocalizedPath(l)}
              className="flex items-center gap-2"
            >
              <span>{localeFlags[l]}</span>
              <span>{localeNames[l]}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const t = useTranslations('Navigation');

  const handleAuth = () => {
    if (session) {
      signOut();
    } else {
      router.push('/login');
    }
  };

  const guestLinks = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
  ];

  const authLinks = [
    { href: '/words', label: t('myWords') },
    { href: '/profile', label: t('profile') },
  ];

  const navLinks = session ? authLinks : guestLinks;

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <div className="animate-pulse flex space-x-4">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  onClick={handleAuth}
                  variant={session ? "destructive" : "default"}
                  className="w-full"
                >
                  {session ? t('signOut') : t('signIn')}
                </Button>
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-medium mb-2">{t('selectLanguage')}</div>
                  <LanguageSelector />
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-purple-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <LanguageSelector />
            <Button
              onClick={handleAuth}
              variant={session ? "destructive" : "default"}
            >
              {session ? t('signOut') : t('signIn')}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

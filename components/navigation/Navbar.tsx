// components/navigation/Navbar.tsx
"use client";

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from "next/image";
import { Button } from "@/components/shadcn-ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/shadcn-ui/sheet";
import { Menu } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import LogoSvg from "../../public/logo.svg";
import { LanguageSelector } from '@/components/common/LanguageSelector';

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
                  <LanguageSelector variant="buttons" />
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
            <LanguageSelector variant="dropdown" />
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

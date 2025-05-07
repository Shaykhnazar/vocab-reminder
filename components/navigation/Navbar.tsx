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
  SheetClose,
} from "@/components/shadcn-ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { Menu, Book, User, LogOut, ChevronDown, Plus, Home, Languages } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import LogoSvg from "../../public/logo.svg";
import { LanguageSelector } from '@/components/common/LanguageSelector';

// Logo component
export const Logo = () => (
  <Link href="/" className="flex items-center">
    <div className="h-10 w-auto">
      <Image
        src={LogoSvg}
        alt="VocabRY"
        className="h-full w-auto"
      />
    </div>
  </Link>
);

export const Navbar = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const t = useTranslations('Navigation');

  const handleSignOut = () => {
    signOut();
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  // Simplified navigation with icons for all items to maintain consistency
  const guestLinks = [
    { href: '/', label: t('home') || 'Home', icon: Home },
  ];

  const authLinks = [
    { href: '/dashboard', label: t('dashboard') || 'Dashboard', icon: Home },
    { href: '/words', label: t('myWords') || 'My Words', icon: Book },
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
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center text-lg font-medium py-2 hover:text-purple-600 transition-colors"
                    >
                      {link.icon && <link.icon className="mr-2 h-5 w-5" />}
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}

                {session ? (
                  <>

                    <SheetClose asChild>
                      <Link
                        href="/profile"
                        className="flex items-center text-lg font-medium py-2 hover:text-purple-600 transition-colors mt-4"
                      >
                        <User className="mr-2 h-5 w-5" />
                        {t('profile') || 'Profile'}
                      </Link>
                    </SheetClose>

                    <Button
                      onClick={handleSignOut}
                      variant="destructive"
                      className="mt-2 w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> {t('signOut') || 'Sign Out'}
                    </Button>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Button
                      onClick={handleSignIn}
                      className="mt-2 w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {t('signIn') || 'Sign In'}
                    </Button>
                  </SheetClose>
                )}

                <div className="mt-6 pt-4 border-t">
                  <div className="text-sm font-medium mb-2 flex items-center">
                    <Languages className="h-4 w-4 mr-2" />
                    {t('selectLanguage') || 'Select Language'}
                  </div>
                  <LanguageSelector/>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-purple-600 transition-colors flex items-center"
              >
                {link.icon && <link.icon className="mr-1 h-4 w-4" />}
                {link.label}
              </Link>
            ))}

            {session ? (
              <>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-1">
                      <User className="mr-1 h-4 w-4" />
                      <span className="hidden sm:inline">{t('account') || 'Account'}</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {t('profile') || 'Profile'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('signOut') || 'Sign Out'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={handleSignIn}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {t('signIn') || 'Sign In'}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Languages className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('selectLanguage') || 'Select Language'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <LanguageSelector />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
};

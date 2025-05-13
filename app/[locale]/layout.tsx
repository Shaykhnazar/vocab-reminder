// app/[locale]/layout.tsx
import React from "react";
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import { notFound } from 'next/navigation';
import {routing} from '@/i18n/routing';
import { NextAuthProvider } from "@/components/NextAuthProvider";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { MobileNav } from "@/components/navigation/MobileNav";
import { Toaster } from "@/components/shadcn-ui/toaster";

// Metadata generation with translations
export async function generateMetadata({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}) {
  return {
    title: "VocabRY - Master New Words Efficiently",
    description: "Smart spaced repetition system that helps you remember vocabulary forever through perfectly timed notifications",
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Load messages for the locale
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col">
        <NextAuthProvider>
          <Navbar />
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <MobileNav />
          <Footer className="hidden md:block" />
          <Toaster />
        </NextAuthProvider>
      </div>
    </NextIntlClientProvider>
  );
}

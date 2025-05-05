// app/[locale]/layout.tsx
import React from "react";
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { NextAuthProvider } from "@/components/NextAuthProvider";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { locales } from '@/config/i18n';

// Generate routes for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Metadata generation with translations
export async function generateMetadata({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}) {
  // You could load translations here to localize metadata
  return {
    title: "Vocabulary Reminder - Master New Words Efficiently",
    description: "Smart spaced repetition system that helps you remember vocabulary forever through perfectly timed notifications",
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the locale is supported
  if (!locales.includes(locale as any)) {
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
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </NextAuthProvider>
      </div>
    </NextIntlClientProvider>
  );
}
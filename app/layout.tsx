// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/shadcn-ui/toaster";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vocabulary Reminder - Master New Words Efficiently",
  description: "Smart spaced repetition system that helps you remember vocabulary forever through perfectly timed notifications",
};

// Root layout that only provides global styles and fonts
export default function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Ensure that the incoming `locale` is valid
  const {locale} = params;

  return (
    <html lang={locale}>
      <head>
        {/* Telegram Web Apps Script - Required for Mini Apps */}
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

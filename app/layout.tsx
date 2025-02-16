// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/shadcn-ui/toaster";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vocabulary Reminder - Master New Words Efficiently",
  description: "Smart spaced repetition system that helps you remember vocabulary forever through perfectly timed notifications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="relative">
          <Toaster />
            <NextAuthProvider>{children}</NextAuthProvider>
          <Analytics />
        </div>
      </body>
    </html>
  );
}

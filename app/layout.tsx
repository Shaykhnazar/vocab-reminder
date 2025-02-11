import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import {Toaster} from "@/components/shadcn-ui/toaster";
import {NextAuthProvider} from "@/components/NextAuthProvider";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Vocabulary Reminder",
  description: "Vocabulary Reminder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <div className="relative">
          <Toaster/>
          <NextAuthProvider>{children}</NextAuthProvider>
          <Analytics/>
        </div>
      </body>
    </html>
);
}

// components/navigation.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/shadcn-ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/shadcn-ui/sheet";
import { Menu} from 'lucide-react';
import { signOut} from 'next-auth/react';
import { useRouter} from "next/navigation";
import Image from "next/image";
import LogoSvg from "../public/logo.svg";

// Logo component
export const Logo = () => (
  <Link href="/" className="flex items-center">
    <div className="h-14 w-auto"> {/* Adjust height as needed */}
      <Image
        src={LogoSvg}
        alt="VocabRY"
        className="h-full w-auto"
      />
    </div>
  </Link>
);

// Guest Navigation
export const GuestNavbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('login');
  };
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
                <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                  Home
                </Link>
                <Link href="/about" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                  About
                </Link>
                <Button onClick={handleGetStarted} className="w-full" variant="cta" >
                  Sign In
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-purple-600 transition-colors">
              About
            </Link>
            <Button onClick={handleGetStarted} variant="cta">Sign In</Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

// Authenticated Navigation
export const AuthNavbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

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
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                  Dashboard
                </Link>
                <Link href="/profile" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                  Profile
                </Link>
                <Button onClick={() => signOut()} variant="destructive" className="w-full">
                  Sign Out
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Profile
            </Link>
            <Button onClick={() => signOut()} variant="destructive">
              Sign Out
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

// Footer Component
export const Footer = () => (
  <footer className="border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-gray-600">
            Master new words efficiently with our science-backed spaced repetition system.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <div className="flex flex-col space-y-2">
            <Link href="/" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              About
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Contact</h3>
          <div className="flex flex-col space-y-2">
            <a href="mailto:support@vocabry.com" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              support@vocabry.com
            </a>
            <div className="flex space-x-4 mt-4">
              {/* Add your social media links here */}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} VocabRY. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

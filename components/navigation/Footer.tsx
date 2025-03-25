// components/navigation/Footer.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from "next/image";
import LogoSvg from "../../public/logo.svg";

const Logo = () => (
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
            {/*<Link href="/dashboard" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">*/}
            {/*  Dashboard*/}
            {/*</Link>*/}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Plans & Policies</h3>
          <div className="flex flex-col space-y-2">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Pricing
            </Link>
            <Link href="/refund-policy" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Refund Policy
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
        <p>© {new Date().getFullYear()} Vocabry. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

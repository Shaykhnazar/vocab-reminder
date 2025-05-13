// components/navigation/MobileNav.tsx
"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { Home, Book, Trophy, List, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNav = () => {
  const t = useTranslations('Navigation');
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      label: t('home'),
      icon: Home,
    },
    // {
    //   href: '#Games',
    //   label: 'Games',
    //   icon: Trophy,
    // },
    {
      href: '/words',
      label: t('myWords'),
      icon: Book,
    },
    // {
    //   href: '#Tests',
    //   label: 'Tests',
    //   icon: List,
    // },
    {
      href: '/profile',
      label: t('profile'),
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden w-full border-t bg-white z-50 shadow-top">
      <nav className="flex items-center justify-between px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 flex-1 text-xs",
                isActive
                  ? "text-purple-600"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <item.icon className={cn(
                "h-6 w-6 mb-1",
                isActive ? "text-purple-600" : "text-gray-500"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNav;

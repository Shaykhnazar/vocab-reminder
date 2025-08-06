// components/providers/TelegramAuthProvider.tsx
"use client"

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useTelegramAuthInit } from '@/hooks/use-telegram-auth-init';

interface TelegramAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Global Telegram authentication provider
 * Automatically handles authentication across the entire app
 */
export default function TelegramAuthProvider({ children }: TelegramAuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { authState } = useTelegramAuthInit();

  useEffect(() => {
    // Skip if NextAuth is still loading
    if (status === 'loading') return;

    // Skip if we're already authenticated via NextAuth
    if (session?.user) {
      console.log('✅ User already authenticated via NextAuth, no auto-auth needed');
      return;
    }

    // Skip if Telegram auth is still loading
    if (authState.isLoading) {
      console.log('⏳ Telegram authentication in progress...');
      return;
    }

    // If Telegram authentication was successful
    if (authState.isAuthenticated && authState.user) {
      console.log('✅ Telegram authentication successful:', authState.user.first_name);
      
      // Don't redirect if we're already on a protected page
      const protectedPaths = ['/words', '/profile', '/subscriptions', '/dashboard'];
      const isOnProtectedPage = protectedPaths.some(path => pathname.includes(path));
      
      if (!isOnProtectedPage) {
        console.log('🔄 Redirecting authenticated user to /words');
        router.push('/words');
      }
      return;
    }

    // If Telegram authentication failed and we're on a protected page, redirect to login
    if (authState.isInitialized && !authState.isAuthenticated && authState.error) {
      const protectedPaths = ['/words', '/profile', '/subscriptions', '/dashboard'];
      const isOnProtectedPage = protectedPaths.some(path => pathname.includes(path));
      
      if (isOnProtectedPage) {
        console.log('🔒 Redirecting unauthenticated user to login');
        router.push('/login');
      }
    }

  }, [session, status, authState, pathname, router]);

  // Show loading state while authentication is in progress
  if (authState.isLoading && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-lg font-medium">Authenticating...</p>
          <p className="text-sm text-muted-foreground">Connecting with Telegram</p>
        </div>
      </div>
    );
  }

  // Render children normally
  return <>{children}</>;
}
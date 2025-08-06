// components/providers/AppLoadingScreen.tsx
"use client"

import { useSession } from 'next-auth/react';
import { useTelegramWebApp } from '@/lib/telegram-webapp';

interface AppLoadingScreenProps {
  children: React.ReactNode;
}

/**
 * Shows a loading screen while authentication is being determined
 */
export default function AppLoadingScreen({ children }: AppLoadingScreenProps) {
  const { status } = useSession();
  const { isTelegramWebApp } = useTelegramWebApp();

  // Show loading screen if:
  // 1. NextAuth is still loading AND
  // 2. We're in a Telegram Web App environment (where auto-auth should happen)
  const shouldShowLoading = status === 'loading' && isTelegramWebApp;

  if (shouldShowLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-lg font-medium">Loading...</p>
          <p className="text-sm text-muted-foreground">Initializing Telegram Web App</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
// components/auth/TelegramWebAppAuth.tsx
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { useTelegramAuthInit } from '@/hooks/use-telegram-auth-init';

interface TelegramWebAppAuthProps {
  onAuthAttempt?: () => void;
  onAuthSuccess?: () => void;
  onAuthFailure?: (error: string) => void;
}

export default function TelegramWebAppAuth({ 
  onAuthAttempt, 
  onAuthSuccess, 
  onAuthFailure 
}: TelegramWebAppAuthProps) {
  const t = useTranslations('Auth');
  const router = useRouter();
  const { toast } = useToast();
  const { authState } = useTelegramAuthInit();

  // Handle authentication state changes
  useEffect(() => {
    if (authState.isLoading) {
      onAuthAttempt?.();
    } else if (authState.isAuthenticated && authState.user) {
      console.log('✅ Telegram authentication successful:', authState.user);
      onAuthSuccess?.();
      
      toast({
        title: t('toast.success'),
        description: t('toast.telegramAutoAuth'),
      });

      // Redirect to the app
      router.push('/words');
    } else if (authState.error) {
      console.error('❌ Telegram authentication failed:', authState.error);
      onAuthFailure?.(authState.error);
      
      // Don't show toast for authentication failures in auto mode
      // User can still use manual login
    }
  }, [authState, onAuthAttempt, onAuthSuccess, onAuthFailure, t, toast, router]);

  // Show loading state only if we're attempting authentication
  if (authState.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">
          {t('telegramWebApp.authenticating')}
        </p>
      </div>
    );
  }

  // Don't render anything if we're not attempting auth or already authenticated
  return null;
}

export function useTelegramWebAppAutoAuth() {
  const { authState } = useTelegramAuthInit();
  
  return {
    shouldAttemptAutoAuth: !authState.isAuthenticated && !authState.isInitialized,
    isTelegramWebApp: authState.isAuthenticated || authState.isLoading,
    telegramUser: authState.user,
    authState,
  };
}
// components/auth/TelegramWebAppAuth.tsx
"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTelegramWebApp } from '@/lib/telegram-webapp';
import { initializeTelegramEnvironment } from '@/lib/telegram-script-loader';
import { attemptTelegramWebAppAuth } from '@/lib/telegram-webapp-auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

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
  const [isAttempting, setIsAttempting] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const { isTelegramWebApp, initData, isValid, user } = useTelegramWebApp();

  useEffect(() => {
    // Initialize Telegram environment
    const initTelegram = async () => {
      try {
        await initializeTelegramEnvironment();
      } catch (error) {
        console.error('Failed to initialize Telegram environment:', error);
      }
    };
    
    initTelegram();
  }, []);

  useEffect(() => {
    // Debug logging for all conditions
    console.log('TelegramWebAppAuth - Checking conditions:', {
      isTelegramWebApp,
      isValid,
      hasInitData: !!initData,
      hasUser: !!user,
      sessionStatus: status,
      hasSession: !!session,
      hasAttempted,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'
    });

    // Only attempt auto-authentication if:
    // 1. We're in Telegram Web App
    // 2. We have valid init data
    // 3. User is not already authenticated
    // 4. We haven't attempted before
    // 5. Session loading is complete
    if (
      isTelegramWebApp && 
      isValid && 
      initData && 
      user && 
      status !== 'loading' && 
      !session && 
      !hasAttempted
    ) {
      console.log('All conditions met - attempting auto-authentication');
      handleAutoAuth();
    } else {
      console.log('Auto-authentication skipped - conditions not met');
    }
  }, [isTelegramWebApp, isValid, initData, user, session, status, hasAttempted]);

  const handleAutoAuth = async () => {
    if (isAttempting) return;
    
    setIsAttempting(true);
    setHasAttempted(true);
    onAuthAttempt?.();

    try {
      console.log('Attempting Telegram Web App auto-authentication...');
      
      const result = await attemptTelegramWebAppAuth();
      
      if (result.success) {
        console.log('Telegram Web App authentication successful');
        onAuthSuccess?.();
        
        toast({
          title: t('toast.success'),
          description: t('toast.telegramAutoAuth'),
        });

        // Redirect to the app
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        } else {
          router.push('/words');
        }
      } else {
        console.error('Telegram Web App authentication failed:', result.error);
        onAuthFailure?.(result.error || 'Unknown error');
        
        // Don't show toast for authentication failures in auto mode
        // User can still use manual login
      }
    } catch (error) {
      console.error('Telegram Web App authentication error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onAuthFailure?.(errorMessage);
    } finally {
      setIsAttempting(false);
    }
  };

  // Show loading state only if we're attempting auto-authentication
  if (isTelegramWebApp && isAttempting) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">
          {t('telegramWebApp.authenticating')}
        </p>
      </div>
    );
  }

  // Don't render anything if we're not in Telegram Web App or already authenticated
  return null;
}

export function useTelegramWebAppAutoAuth() {
  const { isTelegramWebApp, initData, isValid, user } = useTelegramWebApp();
  const { data: session, status } = useSession();
  
  const shouldAttemptAutoAuth = 
    isTelegramWebApp && 
    isValid && 
    initData && 
    user && 
    status !== 'loading' && 
    !session;

  return {
    shouldAttemptAutoAuth,
    isTelegramWebApp,
    telegramUser: user,
    sessionStatus: status,
  };
}
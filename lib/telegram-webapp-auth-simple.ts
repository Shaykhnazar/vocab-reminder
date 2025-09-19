// lib/telegram-webapp-auth-simple.ts
"use client"

import { signIn } from 'next-auth/react';

interface TelegramUser {
  id: string;
  telegram_id: string;
  name: string;
  first_name: string;
  last_name?: string;
  username?: string;
  image?: string;
  provider: string;
}

interface TelegramAuthResult {
  success: boolean;
  user?: TelegramUser;
  error?: string;
}

/**
 * Simple Telegram Web App authentication using direct API calls
 */
export async function authenticateWithTelegramWebApp(): Promise<TelegramAuthResult> {
  try {
    // Check if we're in Telegram environment
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      return {
        success: false,
        error: 'Not running in Telegram Web App environment'
      };
    }

    const initData = window.Telegram.WebApp.initData;
    if (!initData || initData.length === 0) {
      return {
        success: false,
        error: 'No initialization data found'
      };
    }

    console.log('🔐 Authenticating with Telegram Web App...');
    console.log('📊 InitData length:', initData.length);

    // Call our API route for validation
    const response = await fetch('/api/auth/telegram-webapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Authentication failed'
      };
    }

    const data = await response.json();

    if (!data.success || !data.user) {
      return {
        success: false,
        error: 'Invalid response from server'
      };
    }

    console.log('✅ Telegram authentication successful:', data.user.first_name);

    // Create a custom NextAuth session using credentials provider
    const signInResult = await signIn('credentials', {
      redirect: false,
      email: `telegram_${data.user.telegram_id}@telegram.local`,
      password: 'telegram_auth', // This will be handled specially in credentials provider
      telegram_user_data: JSON.stringify(data.user),
    });

    if (signInResult?.error) {
      return {
        success: false,
        error: signInResult.error
      };
    }

    return {
      success: true,
      user: data.user
    };

  } catch (error) {
    console.error('Telegram authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if the current environment is a Telegram Web App
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;

  // Check multiple indicators
  const hasTelegramObject = !!(window as any).Telegram?.WebApp;
  const hasInitData = !!(window as any).Telegram?.WebApp?.initData;
  const hasUserAgent = navigator.userAgent.includes('Telegram');

  return hasTelegramObject && (hasInitData || hasUserAgent);
}

/**
 * Get Telegram Web App user info
 */
export function getTelegramWebAppUser() {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return null;
  }

  const tg = window.Telegram.WebApp;
  if (!tg.initDataUnsafe?.user) {
    return null;
  }

  return tg.initDataUnsafe.user;
}

/**
 * Hook for Telegram Web App authentication
 */
export function useTelegramWebAppAuth() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const authenticate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authenticateWithTelegramWebApp();

      if (!result.success) {
        setError(result.error || 'Authentication failed');
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    authenticate,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}

// Add React import for the hook
import React from 'react';
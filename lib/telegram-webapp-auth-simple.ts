// lib/telegram-webapp-auth-simple.ts
"use client"

import { signIn } from 'next-auth/react';
import { getTelegramWebAppInitData } from './telegram-webapp';

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
    if (!isTelegramWebApp()) {
      return {
        success: false,
        error: 'Not running in Telegram Web App environment'
      };
    }

    // Try to get initialization data
    let initData: string | null = null;

    // Method 1: Try the main webapp function
    try {
      const initDataResult = getTelegramWebAppInitData();
      if (initDataResult?.rawInitData) {
        initData = initDataResult.rawInitData;
        console.log('✅ Got initData from main function');
      }
    } catch (e) {
      console.log('⚠️ Main function failed, trying fallback');
    }

    // Method 2: Try direct Telegram object
    if (!initData && window.Telegram?.WebApp?.initData) {
      initData = window.Telegram.WebApp.initData;
      console.log('✅ Got initData from Telegram object');
    }

    // Method 3: Try stored data
    if (!initData) {
      const storedData = localStorage.getItem('telegram_init_data');
      if (storedData) {
        initData = storedData;
        console.log('✅ Got initData from localStorage');
      }
    }

    if (!initData) {
      return {
        success: false,
        error: 'No initialization data found'
      };
    }

    console.log('🔐 Authenticating with Telegram Web App...');
    console.log('📊 InitData length:', initData.length);
    console.log('📊 InitData preview:', initData.substring(0, 200));

    // Call our API route for validation
    console.log('📡 Calling /api/auth/telegram-webapp...');
    const response = await fetch('/api/auth/telegram-webapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData }),
    });

    console.log('📡 API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      return {
        success: false,
        error: errorData.error || 'Authentication failed'
      };
    }

    const data = await response.json();
    console.log('📡 API Response data:', data);

    if (!data.success || !data.user) {
      console.error('❌ Invalid API response:', data);
      return {
        success: false,
        error: 'Invalid response from server'
      };
    }

    console.log('✅ Telegram API validation successful:', data.user.first_name);

    // Create a custom NextAuth session using credentials provider
    console.log('🔑 Creating NextAuth session...');
    const signInResult = await signIn('credentials', {
      redirect: false,
      email: `telegram_${data.user.telegram_id}@telegram.local`,
      password: 'telegram_auth', // This will be handled specially in credentials provider
      telegram_user_data: JSON.stringify(data.user),
    });

    console.log('🔑 NextAuth result:', signInResult);

    if (signInResult?.error) {
      console.error('❌ NextAuth error:', signInResult.error);
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
 * Simplified version that doesn't conflict with bundling
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') {
    console.log('isTelegramWebApp: window is undefined (server-side)');
    return false;
  }

  try {
    // Check Telegram object and initData
    const hasTelegramObject = !!(window as any).Telegram?.WebApp;
    const hasInitData = !!(window as any).Telegram?.WebApp?.initData;
    const hasUserAgent = navigator.userAgent.includes('Telegram');

    // Also check for stored Telegram data as fallback
    const hasStoredData = !!localStorage.getItem('telegram_init_data');

    const detected = hasTelegramObject && (hasInitData || hasUserAgent || hasStoredData);

    console.log('isTelegramWebApp: Detection result:', {
      hasTelegramObject,
      hasInitData,
      hasUserAgent,
      hasStoredData,
      detected
    });

    return detected;
  } catch (error) {
    console.error('❌ isTelegramWebApp: Detection error:', error);
    return false;
  }
}

/**
 * Get Telegram Web App user info
 */
export function getTelegramWebAppUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Check Telegram object
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      if (tg.initDataUnsafe?.user) {
        console.log('✅ getTelegramWebAppUser: Found user via Telegram object');
        return tg.initDataUnsafe.user;
      }
    }

    // Check stored user data as fallback
    try {
      const storedUser = localStorage.getItem('telegram_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('✅ getTelegramWebAppUser: Found user via localStorage');
        return user;
      }
    } catch (e) {
      console.log('⚠️ getTelegramWebAppUser: Failed to parse stored user');
    }

    console.log('⚠️ getTelegramWebAppUser: No user data found');
    return null;
  } catch (error) {
    console.error('❌ getTelegramWebAppUser: Error:', error);
    return null;
  }
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
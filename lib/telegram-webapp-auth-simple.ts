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

    // Try to get initialization data using multiple methods
    let initData: string | null = null;

    // Method 1: Try hash extraction (most reliable for mini apps)
    initData = extractInitDataFromHash();
    if (initData) {
      console.log('✅ Got initData from hash extraction');
    }

    // Method 2: Try the main webapp function
    if (!initData) {
      try {
        const initDataResult = getTelegramWebAppInitData();
        if (initDataResult?.rawInitData) {
          initData = initDataResult.rawInitData;
          console.log('✅ Got initData from main function');
        }
      } catch (e) {
        console.log('⚠️ Main function failed, trying fallback');
      }
    }

    // Method 3: Try direct Telegram object
    if (!initData && window.Telegram?.WebApp?.initData) {
      initData = window.Telegram.WebApp.initData;
      console.log('✅ Got initData from Telegram object');
      // Store for future use
      localStorage.setItem('telegram_init_data', initData);
    }

    // Method 4: Try stored data
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

    // Store authenticated user data in localStorage for persistence
    localStorage.setItem('telegram_authenticated_user', JSON.stringify(data.user));
    console.log('💾 Stored authenticated user data in localStorage');

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
 * Extract initData from URL hash when mini app first opens
 */
export function extractInitDataFromHash(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Check URL hash for tgWebAppData
    const hash = window.location.hash;
    if (hash && hash.includes('tgWebAppData=')) {
      const params = new URLSearchParams(hash.substring(1));
      const tgWebAppData = params.get('tgWebAppData');
      if (tgWebAppData) {
        const initData = decodeURIComponent(tgWebAppData);
        console.log('✅ extractInitDataFromHash: Found initData in URL hash');
        // Store for future use
        localStorage.setItem('telegram_init_data', initData);
        return initData;
      }
    }

    // Check if we already have stored initData
    const storedData = localStorage.getItem('telegram_init_data');
    if (storedData) {
      console.log('✅ extractInitDataFromHash: Using stored initData');
      return storedData;
    }

    return null;
  } catch (error) {
    console.error('❌ extractInitDataFromHash: Error:', error);
    return null;
  }
}

/**
 * Initialize Telegram data extraction on app startup
 */
export function initializeTelegramData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Try to extract from hash first
    const hashData = extractInitDataFromHash();

    // Also try to get from Telegram object if available
    if (!hashData && window.Telegram?.WebApp?.initData) {
      const initData = window.Telegram.WebApp.initData;
      console.log('✅ initializeTelegramData: Found initData from Telegram object');
      localStorage.setItem('telegram_init_data', initData);
    }

    // Store user data if available
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      console.log('✅ initializeTelegramData: Storing user data');
      localStorage.setItem('telegram_user', JSON.stringify(user));
    }

    console.log('🔧 initializeTelegramData: Initialization complete');
  } catch (error) {
    console.error('❌ initializeTelegramData: Error:', error);
  }
}

/**
 * Check if the current environment is a Telegram Web App
 * Now relies primarily on stored data for reliability
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') {
    console.log('isTelegramWebApp: window is undefined (server-side)');
    return false;
  }

  try {
    // Primary check: Do we have stored Telegram data?
    const hasStoredInitData = !!localStorage.getItem('telegram_init_data');
    const hasStoredUser = !!localStorage.getItem('telegram_user');

    // Secondary checks
    const hasTelegramObject = !!(window as any).Telegram?.WebApp;
    const hasInitData = !!(window as any).Telegram?.WebApp?.initData;
    const hasUserAgent = navigator.userAgent.includes('Telegram');

    // Consider it a Telegram Web App if we have stored data OR Telegram object with data
    const detected = hasStoredInitData || hasStoredUser || (hasTelegramObject && (hasInitData || hasUserAgent));

    console.log('isTelegramWebApp: Detection result:', {
      hasStoredInitData,
      hasStoredUser,
      hasTelegramObject,
      hasInitData,
      hasUserAgent,
      detected
    });

    return detected;
  } catch (error) {
    console.error('❌ isTelegramWebApp: Detection error:', error);
    return false;
  }
}

/**
 * Get previously authenticated user from localStorage
 */
export function getAuthenticatedTelegramUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const authenticatedUser = localStorage.getItem('telegram_authenticated_user');
    if (authenticatedUser) {
      const user = JSON.parse(authenticatedUser);
      console.log('✅ getAuthenticatedTelegramUser: Found authenticated user in localStorage');
      return user;
    }
    return null;
  } catch (error) {
    console.error('❌ getAuthenticatedTelegramUser: Error:', error);
    return null;
  }
}

/**
 * Clear all stored Telegram authentication data
 */
export function clearTelegramAuthData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('telegram_init_data');
    localStorage.removeItem('telegram_user');
    localStorage.removeItem('telegram_authenticated_user');
    console.log('🧹 Cleared all Telegram authentication data from localStorage');
  } catch (error) {
    console.error('❌ clearTelegramAuthData: Error:', error);
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
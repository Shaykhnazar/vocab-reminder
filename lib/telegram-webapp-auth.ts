// lib/telegram-webapp-auth.ts
"use client"

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { getTelegramWebAppInitData, validateTelegramWebAppData, prepareTelegramAuthData, isTelegramWebApp } from './telegram-webapp';

export interface TelegramWebAppAuthResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

/**
 * Attempts automatic authentication for Telegram Web Apps
 */
export async function attemptTelegramWebAppAuth(): Promise<TelegramWebAppAuthResult> {
  try {
    // Check if we're in a Telegram Web App environment
    if (!isTelegramWebApp()) {
      return {
        success: false,
        error: 'Not running in Telegram Web App environment'
      };
    }

    // Get initialization data
    const initDataResult = getTelegramWebAppInitData();
    if (!initDataResult || !initDataResult.data) {
      return {
        success: false,
        error: 'No Telegram Web App initialization data found'
      };
    }

    const initData = initDataResult.data;
    const rawInitData = initDataResult.rawInitData;

    // Validate the data (client-side check)
    if (!validateTelegramWebAppData(initData)) {
      return {
        success: false,
        error: 'Invalid or expired Telegram Web App data'
      };
    }

    // Check if user data is available
    if (!initData.user) {
      return {
        success: false,
        error: 'No user data available in Telegram Web App'
      };
    }

    // Prepare auth data for server
    const authData = prepareTelegramAuthData(initData, rawInitData);

    // Attempt to sign in using the telegram-webapp provider
    const result = await signIn('telegram-webapp', {
      redirect: false,
      callbackUrl: '/words'
    }, {
      // Pass the auth data using the new format with initData string
      initData: authData.initData,
      id: authData.id,
      first_name: authData.first_name,
      last_name: authData.last_name,
      username: authData.username,
      photo_url: authData.photo_url,
    } as any);

    if (result?.error) {
      return {
        success: false,
        error: result.error
      };
    }

    return {
      success: true,
      redirectUrl: result?.url || '/words'
    };

  } catch (error) {
    console.error('Telegram Web App authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown authentication error'
    };
  }
}

/**
 * Custom hook for automatic Telegram Web App authentication
 */
export function useTelegramWebAppAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authResult, setAuthResult] = useState<TelegramWebAppAuthResult | null>(null);

  const authenticate = async () => {
    setIsAuthenticating(true);
    try {
      const result = await attemptTelegramWebAppAuth();
      setAuthResult(result);
      return result;
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    authenticate,
    isAuthenticating,
    authResult,
    reset: () => setAuthResult(null)
  };
}


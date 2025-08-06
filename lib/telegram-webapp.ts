// lib/telegram-webapp.ts
"use client"

import { retrieveLaunchParams } from '@telegram-apps/sdk';

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebAppInitData {
  user?: TelegramWebAppUser;
  chat_type?: string;
  chat_instance?: string;
  auth_date: number;
  hash: string;
}

/**
 * Detects if the app is running inside Telegram Web Apps environment
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Method 1: Check for Telegram WebApp object
    if (window.Telegram?.WebApp) {
      return true;
    }

    // Method 2: Check for launch parameters using @telegram-apps/sdk
    try {
      const launchParams = retrieveLaunchParams();
      if (launchParams && 'initData' in launchParams && launchParams.initData) {
        return true;
      }
    } catch (sdkError) {
      console.log('SDK check failed in detection:', sdkError);
    }

    // Method 3: Check URL parameters for Telegram Web App specific params
    const urlParams = new URLSearchParams(window.location.search);
    const telegramParams = ['tgWebAppData', 'tgWebAppVersion', 'tgWebAppPlatform'];
    const hasTelegramParams = telegramParams.some(param => urlParams.has(param));
    
    if (hasTelegramParams) {
      return true;
    }

    // Method 4: Check for common Telegram Web App URL patterns
    const hash = window.location.hash;
    if (hash.includes('tgWebAppData') || hash.includes('tgWebAppVersion')) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error detecting Telegram Web App:', error);
    return false;
  }
}

/**
 * Gets Telegram Web App initialization data
 */
export function getTelegramWebAppInitData(): TelegramWebAppInitData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try to get data from @telegram-apps/sdk
    try {
      const launchParams = retrieveLaunchParams();
      if (launchParams && 'initData' in launchParams) {
        const initData = launchParams.initData;
        if (typeof initData === 'string' && initData.length > 0) {
          return parseTelegramInitData(initData);
        }
      }
    } catch (sdkError) {
      console.log('SDK retrieveLaunchParams failed:', sdkError);
    }

    // Fallback: Try to get data from Telegram WebApp object
    if (window.Telegram?.WebApp?.initData) {
      return parseTelegramInitData(window.Telegram.WebApp.initData);
    }

    // Fallback: Try to get from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tgWebAppData = urlParams.get('tgWebAppData');
    if (tgWebAppData) {
      return parseTelegramInitData(decodeURIComponent(tgWebAppData));
    }

    // Fallback: Try to get from hash
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const hashTgData = hashParams.get('tgWebAppData');
    if (hashTgData) {
      return parseTelegramInitData(decodeURIComponent(hashTgData));
    }

    return null;
  } catch (error) {
    console.error('Error getting Telegram Web App init data:', error);
    return null;
  }
}

/**
 * Parses Telegram initialization data string
 */
function parseTelegramInitData(initDataString: string): TelegramWebAppInitData | null {
  try {
    const params = new URLSearchParams(initDataString);
    const userString = params.get('user');
    const authDate = params.get('auth_date');
    const hash = params.get('hash');

    if (!authDate || !hash) {
      return null;
    }

    let user: TelegramWebAppUser | undefined;
    if (userString) {
      user = JSON.parse(decodeURIComponent(userString));
    }

    return {
      user,
      chat_type: params.get('chat_type') || undefined,
      chat_instance: params.get('chat_instance') || undefined,
      auth_date: parseInt(authDate),
      hash,
    };
  } catch (error) {
    console.error('Error parsing Telegram init data:', error);
    return null;
  }
}

/**
 * Validates Telegram Web App data integrity (client-side check only)
 * Note: This should be validated on the server side for security
 */
export function validateTelegramWebAppData(initData: TelegramWebAppInitData): boolean {
  try {
    // Basic validation checks
    if (!initData.hash || !initData.auth_date) {
      return false;
    }

    // Check if auth_date is not too old (24 hours)
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours in seconds
    if (now - initData.auth_date > maxAge) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating Telegram Web App data:', error);
    return false;
  }
}

/**
 * Prepares Telegram Web App data for server-side authentication
 */
export function prepareTelegramAuthData(initData: TelegramWebAppInitData) {
  if (!initData.user) {
    throw new Error('No user data available');
  }

  return {
    id: initData.user.id.toString(),
    first_name: initData.user.first_name,
    last_name: initData.user.last_name || '',
    username: initData.user.username || '',
    photo_url: initData.user.photo_url || '',
    auth_date: initData.auth_date,
    hash: initData.hash,
  };
}

/**
 * Initializes Telegram Web App if available
 */
export function initializeTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    if (window.Telegram?.WebApp) {
      // Initialize the web app
      window.Telegram.WebApp.ready();
      
      // Expand the web app to full height
      window.Telegram.WebApp.expand();
      
      // Set main button if needed
      window.Telegram.WebApp.MainButton.hide();
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error initializing Telegram Web App:', error);
    return false;
  }
}

/**
 * Hook to use Telegram Web App functionality
 */
export function useTelegramWebApp() {
  const isTWA = isTelegramWebApp();
  const initData = getTelegramWebAppInitData();
  
  return {
    isTelegramWebApp: isTWA,
    initData,
    isValid: initData ? validateTelegramWebAppData(initData) : false,
    user: initData?.user || null,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void;
        expand(): void;
        initData: string;
        initDataUnsafe: any;
        MainButton: {
          show(): void;
          hide(): void;
          setText(text: string): void;
          onClick(callback: () => void): void;
        };
        user?: TelegramWebAppUser;
      };
    };
  }
}
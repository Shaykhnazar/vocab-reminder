// lib/telegram-webapp.ts
"use client"

import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { isTelegramEnvironment } from './telegram-script-loader';

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
  if (typeof window === 'undefined') {
    console.log('isTelegramWebApp: window is undefined (server-side)');
    return false;
  }
  
  // Use the improved detection from script loader
  const detected = isTelegramEnvironment();
  console.log('isTelegramWebApp: Detection result:', detected);
  return detected;
}

/**
 * Gets Telegram Web App initialization data
 */
export function getTelegramWebAppInitData(): TelegramWebAppInitData | null {
  if (typeof window === 'undefined') {
    console.log('getTelegramWebAppInitData: window is undefined (server-side)');
    return null;
  }
  
  console.log('getTelegramWebAppInitData: Starting data retrieval');
  
  try {
    // Try to get data from @telegram-apps/sdk
    try {
      const launchParams = retrieveLaunchParams();
      console.log('getTelegramWebAppInitData: SDK launchParams:', launchParams);
      
      // Check if SDK has tgWebAppData directly
      if (launchParams?.tgWebAppData) {
        console.log('getTelegramWebAppInitData: Found tgWebAppData in SDK:', launchParams.tgWebAppData);
        
        // Convert the SDK data to our expected format
        const telegramData: TelegramWebAppInitData = {
          user: launchParams.tgWebAppData.user ? {
            id: launchParams.tgWebAppData.user.id,
            first_name: launchParams.tgWebAppData.user.first_name,
            last_name: launchParams.tgWebAppData.user.last_name || '',
            username: launchParams.tgWebAppData.user.username,
            language_code: launchParams.tgWebAppData.user.language_code,
            is_premium: launchParams.tgWebAppData.user.is_premium,
            photo_url: launchParams.tgWebAppData.user.photo_url,
          } : undefined,
          chat_type: launchParams.tgWebAppData.chat_type,
          chat_instance: launchParams.tgWebAppData.chat_instance,
          auth_date: typeof launchParams.tgWebAppData.auth_date === 'string' 
            ? parseInt(launchParams.tgWebAppData.auth_date) 
            : Math.floor(launchParams.tgWebAppData.auth_date.getTime() / 1000),
          hash: launchParams.tgWebAppData.hash,
        };
        
        console.log('getTelegramWebAppInitData: Converted SDK data:', telegramData);
        return telegramData;
      }
      
      // Fallback: try to get initData string from SDK
      if (launchParams && 'initData' in launchParams) {
        const initData = launchParams.initData;
        console.log('getTelegramWebAppInitData: initData from SDK:', initData);
        
        if (typeof initData === 'string' && initData.length > 0) {
          console.log('getTelegramWebAppInitData: Valid initData found via SDK');
          return parseTelegramInitData(initData);
        }
      }
    } catch (sdkError) {
      console.log('getTelegramWebAppInitData: SDK retrieveLaunchParams failed:', sdkError);
    }

    // Fallback: Try to get data from Telegram WebApp object
    if (window.Telegram?.WebApp?.initData) {
      console.log('getTelegramWebAppInitData: Found initData via window.Telegram.WebApp');
      console.log('getTelegramWebAppInitData: Telegram WebApp initData:', window.Telegram.WebApp.initData);
      return parseTelegramInitData(window.Telegram.WebApp.initData);
    } else {
      console.log('getTelegramWebAppInitData: No initData in window.Telegram.WebApp');
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

  console.log('prepareTelegramAuthData: Preparing auth data for:', initData.user);

  return {
    id: initData.user.id.toString(),
    first_name: initData.user.first_name,
    last_name: initData.user.last_name || '',
    username: initData.user.username || '',
    photo_url: initData.user.photo_url || '',
    auth_date: initData.auth_date,
    hash: initData.hash,
    chat_type: initData.chat_type,
    chat_instance: initData.chat_instance,
  };
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
        close(): void;
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        MainButton: {
          show(): void;
          hide(): void;
          setText(text: string): void;
          onClick(callback: () => void): void;
          isVisible: boolean;
          isActive: boolean;
          text: string;
        };
        BackButton: {
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
          isVisible: boolean;
        };
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
        onEvent(eventType: string, eventHandler: Function): void;
        offEvent(eventType: string, eventHandler: Function): void;
        sendData(data: string): void;
        enableClosingConfirmation(): void;
        disableClosingConfirmation(): void;
        disableVerticalSwipes(): void;
        user?: TelegramWebAppUser;
      };
    };
  }
}
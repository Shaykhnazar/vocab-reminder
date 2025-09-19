// lib/telegram-webapp.ts
"use client"

import React from 'react';
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
  
  // Enhanced detection that prioritizes SDK data
  try {
    // Method 1: Check SDK first since it's most reliable
    try {
      const launchParams = retrieveLaunchParams();
      if (launchParams?.tgWebAppData || launchParams?.tgWebAppVersion) {
        console.log('✅ isTelegramWebApp: Detected via @telegram-apps/sdk');
        return true;
      }
    } catch (sdkError) {
      console.log('⚠️ isTelegramWebApp: SDK check failed:', sdkError);
    }

    // Method 2: Use the script loader detection for other methods
    const detected = isTelegramEnvironment();
    console.log('isTelegramWebApp: Script loader detection result:', detected);
    
    return detected;
  } catch (error) {
    console.error('❌ isTelegramWebApp: Detection error:', error);
    return false;
  }
}

/**
 * Gets Telegram Web App initialization data
 */
export function getTelegramWebAppInitData(): { data: TelegramWebAppInitData; rawInitData: string } | null {
  if (typeof window === 'undefined') {
    console.log('getTelegramWebAppInitData: window is undefined (server-side)');
    return null;
  }
  
  console.log('getTelegramWebAppInitData: Starting comprehensive data retrieval');
  
  try {
    // Method 1: Try to get data from Telegram WebApp object (most reliable)
    const tg = window.Telegram?.WebApp;
    if (tg?.initData && tg.initData.length > 0) {
      console.log('✅ Found initData via Telegram WebApp object (length:', tg.initData.length, ')');
      console.log('🔍 Original Telegram WebApp initData:', tg.initData);
      const parsed = parseTelegramInitData(tg.initData);
      if (parsed) {
        console.log('✅ Method 1 SUCCESS: Using original raw initData from Telegram WebApp');
        return { data: parsed, rawInitData: tg.initData };
      }
    }

    // Method 2: Try to get data from @telegram-apps/sdk
    try {
      const launchParams = retrieveLaunchParams();
      console.log('getTelegramWebAppInitData: SDK launchParams:', launchParams);
      
      // Check if SDK has tgWebAppData directly
      if (launchParams?.tgWebAppData) {
        console.log('✅ Found tgWebAppData in SDK:', launchParams.tgWebAppData);
        
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
            : (typeof launchParams.tgWebAppData.auth_date === 'object' && launchParams.tgWebAppData.auth_date.getTime
              ? Math.floor(launchParams.tgWebAppData.auth_date.getTime() / 1000)
              : launchParams.tgWebAppData.auth_date as unknown as number),
          hash: launchParams.tgWebAppData.hash,
        };
        
        console.log('✅ Converted SDK data successfully:', telegramData);
        // For SDK data, we don't have a raw initData string, so we need to reconstruct it
        const rawInitData = new URLSearchParams({
          user: JSON.stringify(launchParams.tgWebAppData.user),
          chat_type: launchParams.tgWebAppData.chat_type || '',
          chat_instance: launchParams.tgWebAppData.chat_instance || '',
          auth_date: (typeof launchParams.tgWebAppData.auth_date === 'object' && launchParams.tgWebAppData.auth_date.getTime
            ? Math.floor(launchParams.tgWebAppData.auth_date.getTime() / 1000)
            : launchParams.tgWebAppData.auth_date).toString(),
          hash: launchParams.tgWebAppData.hash,
        }).toString();
        
        return { data: telegramData, rawInitData };
      }
      
      // Fallback: try to get initData string from SDK
      if (launchParams && 'initData' in launchParams) {
        const initData = launchParams.initData;
        console.log('getTelegramWebAppInitData: initData from SDK:', initData);
        
        if (typeof initData === 'string' && initData.length > 0) {
          console.log('✅ Valid initData found via SDK');
          const parsed = parseTelegramInitData(initData);
          if (parsed) {
            return { data: parsed, rawInitData: initData };
          }
        }
      }
    } catch (sdkError) {
      console.log('⚠️ SDK retrieveLaunchParams failed:', sdkError);
    }

    // Method 3: Extract from URL hash (like your Nuxt.js implementation)
    const hash = window.location.hash.slice(1); // Remove the #
    if (hash && hash.includes('tgWebAppData=')) {
      console.log('🔍 Processing hash for initData extraction');
      const params = new URLSearchParams(hash);
      const tgWebAppData = params.get('tgWebAppData');

      if (tgWebAppData) {
        try {
          // Decode and reconstruct the init data
          const decodedData = decodeURIComponent(tgWebAppData);
          const initDataParams = new URLSearchParams(decodedData);

          // Validate required fields
          const user = initDataParams.get('user');
          const authDate = initDataParams.get('auth_date');

          if (user && authDate) {
            // Try to parse user to validate JSON
            const userObj = JSON.parse(user);
            if (userObj.id) {
              console.log('✅ Successfully extracted initData from URL hash');
              const parsed = parseTelegramInitData(decodedData);
              if (parsed) {
                return { data: parsed, rawInitData: decodedData };
              }
            }
          }
        } catch (e) {
          console.warn('⚠️ Invalid initData in URL hash:', e);
        }
      }
    }

    // Method 4: Try to get from URL search parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tgWebAppData = urlParams.get('tgWebAppData');
    if (tgWebAppData) {
      console.log('✅ Found tgWebAppData in URL search parameters');
      const decodedData = decodeURIComponent(tgWebAppData);
      const parsed = parseTelegramInitData(decodedData);
      if (parsed) {
        return { data: parsed, rawInitData: decodedData };
      }
    }

    // Method 5: Try to get from stored data (localStorage)
    const storedInitData = getStoredTelegramInitData();
    if (storedInitData) {
      console.log('✅ Found stored initData in localStorage');
      const parsed = parseTelegramInitData(storedInitData);
      if (parsed) {
        return { data: parsed, rawInitData: storedInitData };
      }
    }

    console.warn('❌ No Telegram Web App initialization data found in any source');
    return null;
  } catch (error) {
    console.error('❌ Error getting Telegram Web App init data:', error);
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
 * We need to send the raw initData string, not individual parsed fields
 */
export function prepareTelegramAuthData(initData: TelegramWebAppInitData, rawInitDataString?: string) {
  if (!initData.user) {
    throw new Error('No user data available');
  }

  console.log('prepareTelegramAuthData: Preparing auth data for:', initData.user);
  console.log('prepareTelegramAuthData: rawInitDataString provided:', !!rawInitDataString);
  console.log('prepareTelegramAuthData: rawInitDataString length:', rawInitDataString?.length);
  console.log('prepareTelegramAuthData: rawInitDataString content:', rawInitDataString);

  // If we have the raw initData string, use it for validation
  if (rawInitDataString) {
    console.log('✅ Using original raw initData string for authentication');
    return {
      initData: rawInitDataString,
      // Include user info for easy access
      id: initData.user.id.toString(),
      first_name: initData.user.first_name,
      last_name: initData.user.last_name || '',
      username: initData.user.username || '',
      photo_url: initData.user.photo_url || '',
    };
  }

  // Fallback: reconstruct the initData string from parsed data
  const reconstructedInitData = new URLSearchParams({
    user: JSON.stringify(initData.user),
    chat_type: initData.chat_type || '',
    chat_instance: initData.chat_instance || '',
    auth_date: initData.auth_date.toString(),
    hash: initData.hash,
  }).toString();

  return {
    initData: reconstructedInitData,
    // Include user info for easy access
    id: initData.user.id.toString(),
    first_name: initData.user.first_name,
    last_name: initData.user.last_name || '',
    username: initData.user.username || '',
    photo_url: initData.user.photo_url || '',
  };
}


/**
 * Storage keys for Telegram data
 */
const TELEGRAM_INIT_DATA_KEY = 'telegram_init_data';
const TELEGRAM_USER_KEY = 'telegram_user';

/**
 * iOS Safari-safe localStorage operations
 */
const safeLocalStorageSet = (key: string, value: string): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(key, value);
    // Verify it was actually set (iOS Safari sometimes fails silently)
    const verification = localStorage.getItem(key);
    return verification === value;
  } catch (error) {
    console.error('❌ localStorage error:', error);

    // Fall back to sessionStorage for iOS Safari
    try {
      sessionStorage.setItem(key, value);
      console.log('✅ Fallback to sessionStorage');
      return true;
    } catch (sessionError) {
      console.error('❌ sessionStorage also failed:', sessionError);
      return false;
    }
  }
};

const safeLocalStorageGet = (key: string): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    // Try localStorage first
    const value = localStorage.getItem(key);
    if (value) return value;

    // Fall back to sessionStorage
    return sessionStorage.getItem(key);
  } catch (error) {
    console.error('❌ Storage retrieval error:', error);
    return null;
  }
};

/**
 * Store Telegram data persistently
 */
export function storeTelegramData(initData: string, user: TelegramWebAppUser): void {
  if (typeof window === 'undefined') return;

  try {
    safeLocalStorageSet(TELEGRAM_INIT_DATA_KEY, initData);
    safeLocalStorageSet(TELEGRAM_USER_KEY, JSON.stringify(user));
    console.log('✅ Telegram data stored successfully');
  } catch (error) {
    console.error('❌ Error storing Telegram data:', error);
  }
}

/**
 * Get stored Telegram init data
 */
export function getStoredTelegramInitData(): string | null {
  if (typeof window === 'undefined') return null;
  return safeLocalStorageGet(TELEGRAM_INIT_DATA_KEY);
}

/**
 * Get stored user data
 */
export function getStoredTelegramUser(): TelegramWebAppUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = safeLocalStorageGet(TELEGRAM_USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('⚠️ Error getting stored user:', error);
  }

  return null;
}

/**
 * Clear stored Telegram data
 */
export function clearStoredTelegramData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(TELEGRAM_INIT_DATA_KEY);
    localStorage.removeItem(TELEGRAM_USER_KEY);
    sessionStorage.removeItem(TELEGRAM_INIT_DATA_KEY);
    sessionStorage.removeItem(TELEGRAM_USER_KEY);
    console.log('✅ Telegram data cleared');
  } catch (error) {
    console.error('❌ Error clearing Telegram data:', error);
  }
}

/**
 * Hook to use Telegram Web App functionality
 */
export function useTelegramWebApp() {
  const [telegramState, setTelegramState] = React.useState<{
    isTelegramWebApp: boolean;
    initData: TelegramWebAppInitData | null;
    isValid: boolean;
    user: TelegramWebAppUser | null;
    rawInitData: string | null;
  } | null>(null);

  React.useEffect(() => {
    // Only run once on mount to prevent infinite loops
    let mounted = true;

    const initializeTelegramData = () => {
      try {
        console.log('🔄 useTelegramWebApp: Initializing telegram data (one time)');
        
        const isTWA = isTelegramWebApp();
        const initDataResult = getTelegramWebAppInitData();
        const initData = initDataResult?.data || null;
        const rawInitData = initDataResult?.rawInitData || null;
        
        // Store data if we found it and haven't stored it before
        if (initData && initData.user && rawInitData) {
          const existingData = getStoredTelegramInitData();
          const existingUser = getStoredTelegramUser();
          
          // Only store if we don't have existing data or if the data is different
          if (!existingData || !existingUser || existingUser.id !== initData.user.id) {
            console.log('📝 Storing new Telegram data for user:', initData.user.first_name);
            storeTelegramData(rawInitData, initData.user);
          } else {
            console.log('📋 Using existing stored Telegram data');
          }
        }
        
        if (mounted) {
          setTelegramState({
            isTelegramWebApp: isTWA,
            initData,
            isValid: initData ? validateTelegramWebAppData(initData) : false,
            user: initData?.user || null,
            rawInitData,
          });
        }
      } catch (error) {
        console.error('❌ Error in useTelegramWebApp:', error);
        if (mounted) {
          setTelegramState({
            isTelegramWebApp: false,
            initData: null,
            isValid: false,
            user: null,
            rawInitData: null,
          });
        }
      }
    };

    initializeTelegramData();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once

  return telegramState || {
    isTelegramWebApp: false,
    initData: null,
    isValid: false,
    user: null,
    rawInitData: null,
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
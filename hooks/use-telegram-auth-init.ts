// hooks/use-telegram-auth-init.ts
"use client"

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  getTelegramWebAppInitData, 
  isTelegramWebApp, 
  validateTelegramWebAppData,
  prepareTelegramAuthData,
  storeTelegramData,
  getStoredTelegramInitData,
  getStoredTelegramUser,
  clearStoredTelegramData,
  useTelegramWebApp
} from '@/lib/telegram-webapp';
import { initializeTelegramEnvironment } from '@/lib/telegram-script-loader';

interface TelegramAuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: any;
  error: string | null;
  isLoading: boolean;
}

interface TelegramAuthDiagnostics {
  timestamp: string;
  url: string;
  hash: string;
  hasHashData: boolean;
  hasSearchData: boolean;
  telegramObject: boolean;
  telegramUser: boolean;
  userAgent: boolean;
  localStorage: {
    hasInitData: boolean;
    hasUser: boolean;
  };
}

/**
 * Comprehensive Telegram authentication hook
 * Similar to your Nuxt.js auth-init.client.ts plugin
 */
export function useTelegramAuthInit() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const telegramWebAppData = useTelegramWebApp();
  
  const [authState, setAuthState] = useState<TelegramAuthState>({
    isInitialized: false,
    isAuthenticated: false,
    user: null,
    error: null,
    isLoading: true,
  });

  const [diagnostics, setDiagnostics] = useState<TelegramAuthDiagnostics | null>(null);

  /**
   * Generate diagnostics information
   */
  const generateDiagnostics = (): TelegramAuthDiagnostics => {
    if (typeof window === 'undefined') {
      return {} as TelegramAuthDiagnostics;
    }

    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      hash: window.location.hash,
      hasHashData: window.location.hash.includes('tgWebAppData'),
      hasSearchData: window.location.search.includes('tgWebAppData'),
      telegramObject: !!(window as any).Telegram?.WebApp,
      telegramUser: !!(window as any).Telegram?.WebApp?.initDataUnsafe?.user,
      userAgent: navigator.userAgent.includes('Telegram'),
      localStorage: {
        hasInitData: !!getStoredTelegramInitData(),
        hasUser: !!getStoredTelegramUser(),
      },
    };
  };

  /**
   * Attempt automatic Telegram authentication
   */
  const attemptTelegramAuth = async (): Promise<boolean> => {
    try {
      console.log('🚀 Attempting Telegram authentication...');

      // Check if we're in Telegram environment
      const isTelegramEnv = telegramWebAppData.isTelegramWebApp;
      console.log('🔍 Telegram environment detected:', isTelegramEnv);

      if (!isTelegramEnv) {
        console.log('⚠️ Not in Telegram environment, skipping auto-auth');
        return false;
      }

      // Get initialization data from the hook
      const initData = telegramWebAppData.initData;
      console.log('🔍 InitData retrieval result:', {
        hasInitData: !!initData,
        hasUser: !!initData?.user,
        userId: initData?.user?.id,
        userName: initData?.user?.first_name,
      });

      if (!initData || !initData.user) {
        console.error('❌ No valid Telegram data found');
        return false;
      }

      // Validate the data
      const isValid = telegramWebAppData.isValid;
      if (!isValid) {
        console.error('❌ Telegram data validation failed');
        return false;
      }

      // Get the raw initData for proper validation
      const rawInitData = telegramWebAppData.rawInitData;
      
      // Prepare auth data for server
      const authData = prepareTelegramAuthData(initData, rawInitData || undefined);
      console.log('🔐 Prepared auth data for:', authData.first_name, authData.id);

      // Attempt NextAuth sign in using the same pattern as existing telegram-webapp-auth.ts
      const result = await signIn('telegram-webapp', {
        redirect: false,
        callbackUrl: '/words'
      }, {
        // Pass the auth data as credentials with the new format
        initData: authData.initData,
        id: authData.id,
        first_name: authData.first_name,
        last_name: authData.last_name,
        username: authData.username,
        photo_url: authData.photo_url,
      } as any); // Type assertion to bypass strict TypeScript checking

      if (result?.error) {
        console.error('❌ Authentication failed:', result.error);
        setAuthState(prev => ({
          ...prev,
          error: `Authentication failed: ${result.error}`,
          isLoading: false,
          isInitialized: true,
        }));
        return false;
      }

      // Store the successful auth data using the raw initData if available
      const initDataString = rawInitData || new URLSearchParams({
        user: JSON.stringify(initData.user),
        chat_type: initData.chat_type || '',
        chat_instance: initData.chat_instance || '',
        auth_date: initData.auth_date.toString(),
        hash: initData.hash,
      }).toString();

      storeTelegramData(initDataString, initData.user);

      console.log('✅ Telegram authentication successful');

      // Update auth state
      setAuthState({
        isInitialized: true,
        isAuthenticated: true,
        user: initData.user,
        error: null,
        isLoading: false,
      });

      return true;

    } catch (error: any) {
      console.error('❌ Telegram authentication error:', error);
      setAuthState(prev => ({
        ...prev,
        error: `Authentication error: ${error.message}`,
        isLoading: false,
        isInitialized: true,
      }));
      return false;
    }
  };

  /**
   * Initialize Telegram authentication system
   */
  const initializeTelegramAuth = async () => {
    try {
      console.log('🚀 Initializing Telegram authentication system...');
      
      // Generate diagnostics first
      const diag = generateDiagnostics();
      setDiagnostics(diag);
      console.log('🔍 Initial diagnostics:', diag);

      // Initialize Telegram environment (script loading, etc.)
      await initializeTelegramEnvironment();

      // If user is already authenticated via NextAuth, no need to re-authenticate
      if (session?.user) {
        console.log('✅ User already authenticated via NextAuth:', session.user);
        setAuthState({
          isInitialized: true,
          isAuthenticated: true,
          user: session.user,
          error: null,
          isLoading: false,
        });
        return;
      }

      // Attempt automatic Telegram authentication
      const authSuccess = await attemptTelegramAuth();
      
      if (!authSuccess) {
        // Failed - set error state but keep initialized = true
        const finalDiag = generateDiagnostics();
        const errorMessage = `Unable to retrieve Telegram user data.

Diagnostics:
- URL contains data: ${finalDiag.hasHashData || finalDiag.hasSearchData}
- Telegram object available: ${finalDiag.telegramObject}
- Telegram user in object: ${finalDiag.telegramUser}
- Telegram User Agent: ${finalDiag.userAgent}
- Stored data available: ${finalDiag.localStorage.hasInitData}

Please ensure the app is launched through a Telegram bot.`;

        setAuthState({
          isInitialized: true,
          isAuthenticated: false,
          user: null,
          error: errorMessage,
          isLoading: false,
        });
      }

    } catch (error: any) {
      console.error('❌ Authentication initialization failed:', error);
      setAuthState({
        isInitialized: true,
        isAuthenticated: false,
        user: null,
        error: `Initialization error: ${error.message}`,
        isLoading: false,
      });
    }
  };

  /**
   * Force refresh authentication
   */
  const refreshAuth = async () => {
    console.log('🔄 Refreshing authentication...');
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Clear existing data
    clearStoredTelegramData();
    
    // Re-initialize
    await initializeTelegramAuth();
  };

  /**
   * Clear authentication data
   */
  const clearAuth = () => {
    console.log('🧹 Clearing authentication data...');
    clearStoredTelegramData();
    setAuthState({
      isInitialized: true,
      isAuthenticated: false,
      user: null,
      error: null,
      isLoading: false,
    });
  };

  // Initialize on mount
  useEffect(() => {
    if (status === 'loading') return; // Wait for NextAuth to finish loading
    
    initializeTelegramAuth();
  }, [status]);

  // Handle NextAuth session changes
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !authState.isAuthenticated) {
      console.log('🔄 NextAuth session detected, updating auth state');
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: session.user,
        error: null,
        isLoading: false,
      }));
    }
  }, [session, status, authState.isAuthenticated]);

  return {
    // State
    authState,
    diagnostics,
    
    // Actions
    refreshAuth,
    clearAuth,
    
    // Helper methods
    generateDiagnostics,
  };
}
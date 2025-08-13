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
import { useAuthStore, useAuthActions } from '@/lib/stores/use-auth-store';
import { handleTelegramWebAppAuth } from '@/lib/telegram-auth-handler';

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
   * Now integrates with auth store and direct database operations
   */
  const attemptTelegramAuth = async (): Promise<boolean> => {
    try {
      console.log('🚀 Attempting Telegram authentication...');
      
      // Use store methods directly without hooks inside functions
      const store = useAuthStore.getState();
      store.setLoading(true);

      // Check if we're in Telegram environment
      const isTelegramEnv = telegramWebAppData.isTelegramWebApp;
      console.log('🔍 Telegram environment detected:', isTelegramEnv);

      if (!isTelegramEnv) {
        console.log('⚠️ Not in Telegram environment, skipping auto-auth');
        store.setLoading(false);
        return false;
      }

      // Get initialization data from the hook
      const initData = telegramWebAppData.initData;
      const rawInitData = telegramWebAppData.rawInitData;
      
      console.log('🔍 InitData retrieval result:', {
        hasInitData: !!initData,
        hasRawInitData: !!rawInitData,
        hasUser: !!initData?.user,
        userId: initData?.user?.id,
        userName: initData?.user?.first_name,
      });

      if (!initData || !initData.user || !rawInitData) {
        console.error('❌ No valid Telegram data found');
        store.setError('No valid Telegram data found');
        store.setLoading(false);
        return false;
      }

      // Validate the data
      const isValid = telegramWebAppData.isValid;
      if (!isValid) {
        console.error('❌ Telegram data validation failed');
        store.setError('Telegram data validation failed');
        store.setLoading(false);
        return false;
      }

      // Use our new auth handler to process the authentication
      const isDev = process.env.NODE_ENV === 'development';
      const authResult = await handleTelegramWebAppAuth(rawInitData, initData, isDev);

      if (!authResult.success) {
        console.error('❌ Authentication failed:', authResult.error);
        store.setError(authResult.error || 'Authentication failed');
        store.setLoading(false);
        setAuthState(prev => ({
          ...prev,
          error: authResult.error || 'Authentication failed',
          isLoading: false,
          isInitialized: true,
        }));
        return false;
      }

      // Store the successful auth data
      storeTelegramData(rawInitData, initData.user);

      // Update auth store with the authenticated user
      if (authResult.user && authResult.telegramUser) {
        store.setTelegramUser(authResult.telegramUser, authResult.user);
      }

      console.log('✅ Telegram authentication successful:', {
        userId: authResult.user?.id,
        telegramId: authResult.telegramUser?.id,
        isNewUser: authResult.isNewUser
      });

      // Update local auth state
      setAuthState({
        isInitialized: true,
        isAuthenticated: true,
        user: authResult.telegramUser,
        error: null,
        isLoading: false,
      });

      return true;

    } catch (error: any) {
      console.error('❌ Telegram authentication error:', error);
      const store = useAuthStore.getState();
      store.setError(error.message || 'Authentication error');
      store.setLoading(false);
      
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
   * Now syncs with auth store
   */
  const initializeTelegramAuth = async () => {
    try {
      console.log('🚀 Initializing Telegram authentication system...');
      const authStore = useAuthStore.getState();
      
      authStore.setLoading(true);
      
      // Generate diagnostics first
      const diag = generateDiagnostics();
      setDiagnostics(diag);
      console.log('🔍 Initial diagnostics:', diag);

      // Initialize Telegram environment (script loading, etc.)
      await initializeTelegramEnvironment();

      // Check if user is already authenticated in auth store
      if (authStore.isAuthenticated && authStore.authUser) {
        console.log('✅ User already authenticated in auth store:', authStore.authUser.first_name || authStore.authUser.name);
        setAuthState({
          isInitialized: true,
          isAuthenticated: true,
          user: authStore.authUser,
          error: null,
          isLoading: false,
        });
        authStore.setLoading(false);
        return;
      }

      // Check NextAuth session as fallback
      if (session?.user) {
        console.log('✅ User already authenticated via NextAuth:', session.user);
        setAuthState({
          isInitialized: true,
          isAuthenticated: true,
          user: session.user,
          error: null,
          isLoading: false,
        });
        authStore.setLoading(false);
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

        authStore.setError(errorMessage);
        authStore.setLoading(false);
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
      const authStore = useAuthStore.getState();
      
      authStore.setError(`Initialization error: ${error.message}`);
      authStore.setLoading(false);
      
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
    const authStore = useAuthStore.getState();
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    authStore.setLoading(true);
    
    // Clear existing data from both stores
    clearStoredTelegramData();
    authStore.clearAuth();
    
    // Re-initialize
    await initializeTelegramAuth();
  };

  /**
   * Clear authentication data
   */
  const clearAuth = () => {
    console.log('🧹 Clearing authentication data...');
    const authStore = useAuthStore.getState();
    
    // Clear from both local state and global store
    clearStoredTelegramData();
    authStore.clearAuth();
    
    setAuthState({
      isInitialized: true,
      isAuthenticated: false,
      user: null,
      error: null,
      isLoading: false,
    });
  };

  // TEMPORARILY DISABLED: Automatic Telegram Auth Initialization
  // TODO: Re-enable after fixing validation issues
  /*
  // Initialize on mount
  useEffect(() => {
    if (status === 'loading') return; // Wait for NextAuth to finish loading
    
    initializeTelegramAuth();
  }, [status]);
  */

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
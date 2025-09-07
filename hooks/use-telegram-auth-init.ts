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
   * TEMPORARILY DISABLED: Attempt automatic Telegram authentication
   * TODO: Re-enable after fixing validation issues
   */
  const attemptTelegramAuth = async (): Promise<boolean> => {
    console.log('⚠️ Automatic Telegram authentication is temporarily disabled');
    
    const store = useAuthStore.getState();
    store.setLoading(false);
    
    setAuthState(prev => ({
      ...prev,
      isInitialized: true,
      isAuthenticated: false,
      user: null,
      error: 'Automatic Telegram authentication temporarily disabled',
      isLoading: false,
    }));
    
    return false;
  };

  /**
   * TEMPORARILY DISABLED: Initialize Telegram authentication system
   * TODO: Re-enable after fixing validation issues
   */
  const initializeTelegramAuth = async () => {
    console.log('⚠️ Telegram authentication initialization is temporarily disabled');
    const authStore = useAuthStore.getState();
    
    // Generate diagnostics for debugging purposes only
    const diag = generateDiagnostics();
    setDiagnostics(diag);
    
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

    // Set as initialized but not authenticated (no automatic authentication)
    authStore.setLoading(false);
    setAuthState({
      isInitialized: true,
      isAuthenticated: false,
      user: null,
      error: 'Automatic Telegram authentication temporarily disabled',
      isLoading: false,
    });
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
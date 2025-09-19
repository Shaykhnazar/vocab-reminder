// hooks/use-telegram-auth-simple.ts
"use client"

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  authenticateWithTelegramWebApp,
  isTelegramWebApp,
  getTelegramWebAppUser
} from '@/lib/telegram-webapp-auth-simple';
import { isTelegramWebApp as isTelegramWebAppMain } from '@/lib/telegram-webapp';

interface TelegramAuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: any;
  isTelegramWebApp: boolean;
}

/**
 * Simplified Telegram authentication hook
 * Replaces the complex useTelegramAuthInit with a cleaner approach
 */
export function useTelegramAuthSimple() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [authState, setAuthState] = useState<TelegramAuthState>({
    isInitialized: false,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    user: null,
    isTelegramWebApp: false,
  });

  /**
   * Attempt automatic Telegram authentication
   */
  const attemptTelegramAuth = async (): Promise<boolean> => {
    try {
      console.log('🔐 attemptTelegramAuth: Starting authentication process...');

      const result = await authenticateWithTelegramWebApp();
      console.log('🔐 attemptTelegramAuth: Authentication result:', result);

      if (result.success) {
        console.log('✅ Telegram authentication successful');
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: result.user,
          error: null,
          isLoading: false,
        }));
        return true;
      } else {
        console.log('❌ Telegram authentication failed:', result.error);
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          error: result.error || 'Authentication failed',
          isLoading: false,
        }));
        return false;
      }
    } catch (error) {
      console.error('❌ Telegram authentication error:', error);
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      }));
      return false;
    }
  };

  /**
   * Initialize authentication
   */
  const initializeAuth = async () => {
    // Skip if NextAuth is still loading
    if (status === 'loading') {
      return;
    }

    const isTWA = isTelegramWebAppMain(); // Use the main detection logic

    setAuthState(prev => ({
      ...prev,
      isTelegramWebApp: isTWA,
      isLoading: true,
    }));

    // If user is already authenticated via NextAuth, use that
    if (session?.user) {
      console.log('✅ User already authenticated via NextAuth');
      setAuthState(prev => ({
        ...prev,
        isInitialized: true,
        isAuthenticated: true,
        user: session.user,
        error: null,
        isLoading: false,
      }));
      return;
    }

    // If we're in Telegram Web App environment, try automatic auth
    if (isTWA) {
      console.log('📱 Detected Telegram Web App environment');

      // Check if we have user data available
      const telegramUser = getTelegramWebAppUser();
      if (telegramUser) {
        console.log('👤 Found Telegram user data:', telegramUser.first_name);
        console.log('🚀 Attempting automatic Telegram authentication...');
        await attemptTelegramAuth();
      } else {
        console.log('⚠️ No Telegram user data available');
        setAuthState(prev => ({
          ...prev,
          isInitialized: true,
          isAuthenticated: false,
          error: 'No Telegram user data available',
          isLoading: false,
        }));
      }
    } else {
      // Not in Telegram environment
      console.log('🌐 Not in Telegram Web App environment');
      setAuthState(prev => ({
        ...prev,
        isInitialized: true,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      }));
    }
  };

  /**
   * Manual authentication trigger
   */
  const authenticate = async () => {
    if (!isTelegramWebAppMain()) {
      throw new Error('Not in Telegram Web App environment');
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    return await attemptTelegramAuth();
  };

  /**
   * Clear authentication state
   */
  const clearAuth = () => {
    setAuthState({
      isInitialized: true,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
      isTelegramWebApp: isTelegramWebAppMain(),
    });
  };

  /**
   * Refresh authentication state
   */
  const refresh = async () => {
    await initializeAuth();
  };

  // Initialize on mount and when NextAuth status changes
  useEffect(() => {
    initializeAuth();
  }, [status, session]);

  // Auto-redirect to dashboard if authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && !authState.isLoading) {
      // Small delay to ensure session is properly set
      setTimeout(() => {
        router.push('/words');
      }, 100);
    }
  }, [authState.isAuthenticated, authState.user, authState.isLoading, router]);

  return {
    ...authState,
    authenticate,
    clearAuth,
    refresh,
    // Additional helpers
    canAttemptAuth: authState.isTelegramWebApp && !authState.isAuthenticated,
    shouldShowLoginButton: authState.isTelegramWebApp && !authState.isAuthenticated && !authState.isLoading,
  };
}

/**
 * Simple component hook for automatic Telegram authentication
 */
export function useTelegramAutoAuth() {
  const auth = useTelegramAuthSimple();

  // Auto-attempt authentication if possible
  useEffect(() => {
    if (auth.canAttemptAuth && auth.isInitialized && !auth.isLoading) {
      console.log('🔄 Auto-attempting Telegram authentication...');
      auth.authenticate().catch(console.error);
    }
  }, [auth.canAttemptAuth, auth.isInitialized, auth.isLoading]);

  return auth;
}
// components/providers/TelegramAuthProvider.tsx
"use client"

import { useEffect, createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useTelegramAuthInit } from '@/hooks/use-telegram-auth-init';
import { useAuthStore } from '@/lib/stores/use-auth-store';

interface TelegramAuthProviderProps {
  children: React.ReactNode;
  /**
   * Whether to show debug information in console
   */
  debug?: boolean;
  /**
   * Custom redirect path after authentication
   */
  redirectOnAuth?: string;
  /**
   * Protected routes that require authentication
   */
  protectedRoutes?: string[];
}

interface TelegramAuthContextType {
  authState: ReturnType<typeof useTelegramAuthInit>['authState'];
  diagnostics: ReturnType<typeof useTelegramAuthInit>['diagnostics'];
  refreshAuth: ReturnType<typeof useTelegramAuthInit>['refreshAuth'];
  clearAuth: ReturnType<typeof useTelegramAuthInit>['clearAuth'];
  generateDiagnostics: ReturnType<typeof useTelegramAuthInit>['generateDiagnostics'];
}

const TelegramAuthContext = createContext<TelegramAuthContextType | null>(null);

export function useTelegramAuthContext() {
  const context = useContext(TelegramAuthContext);
  if (!context) {
    throw new Error('useTelegramAuthContext must be used within TelegramAuthProvider');
  }
  return context;
}

/**
 * Global Telegram authentication provider
 * Automatically handles authentication across the entire app
 */
export default function TelegramAuthProvider({ 
  children, 
  debug = false,
  redirectOnAuth = '/words',
  protectedRoutes = ['/words', '/profile', '/subscriptions', '/dashboard']
}: TelegramAuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { authState, diagnostics, refreshAuth, clearAuth, generateDiagnostics } = useTelegramAuthInit();
  const authStoreState = useAuthStore();

  // Debug logging (disabled by default)
  useEffect(() => {
    if (debug && typeof window !== 'undefined') {
      console.log('🔍 TelegramAuthProvider Debug Info:', {
        authState,
        authStoreState: {
          isAuthenticated: authStoreState.isAuthenticated,
          user: authStoreState.authUser ? {
            id: authStoreState.authUser.id,
            name: authStoreState.authUser.first_name || authStoreState.authUser.name,
            provider: authStoreState.authUser.provider
          } : null
        },
        sessionStatus: status,
        currentPath: pathname,
        diagnostics
      });
    }
  }, [authState, authStoreState, status, diagnostics, debug, pathname]);

  // TEMPORARILY DISABLED: Automatic Telegram Mini App authentication
  // TODO: Re-enable after fixing validation issues
  /*
  useEffect(() => {
    // Skip if NextAuth is still loading
    if (status === 'loading') return;

    // Skip if we're already authenticated via NextAuth or auth store
    if (session?.user || authStoreState.isAuthenticated) {
      if (debug) {
        console.log('✅ User already authenticated:', {
          nextAuth: !!session?.user,
          authStore: authStoreState.isAuthenticated,
          user: session?.user || authStoreState.authUser
        });
      }
      return;
    }

    // Skip if Telegram auth is still loading
    if (authState.isLoading || authStoreState.isLoading) {
      if (debug) {
        console.log('⏳ Authentication in progress...', {
          telegramLoading: authState.isLoading,
          storeLoading: authStoreState.isLoading
        });
      }
      return;
    }

    // If Telegram authentication was successful (check both sources)
    const isAuthenticated = authState.isAuthenticated || authStoreState.isAuthenticated;
    const user = authStoreState.authUser || authState.user;
    
    if (isAuthenticated && user) {
      const displayName = authStoreState.authUser?.first_name || authStoreState.authUser?.name || authState.user?.first_name;
      console.log('✅ Telegram authentication successful:', displayName);
      
      // Check if we should redirect
      const isOnProtectedPage = protectedRoutes.some(path => pathname.includes(path));
      const shouldRedirect = !isOnProtectedPage && pathname !== redirectOnAuth;
      
      if (shouldRedirect) {
        console.log(`🔄 Redirecting authenticated user to ${redirectOnAuth}`);
        router.push(redirectOnAuth);
      }
      return;
    }

    // If authentication failed and we're on a protected page, redirect to login
    if (authState.isInitialized && !isAuthenticated) {
      const isOnProtectedPage = protectedRoutes.some(path => pathname.includes(path));
      
      if (isOnProtectedPage) {
        console.log('🔒 Redirecting unauthenticated user to login from protected route:', pathname);
        router.push('/auth/login');
      }
    }

  }, [session, status, authState, authStoreState, pathname, router, redirectOnAuth, protectedRoutes, debug]);
  */

  // Simplified effect for protected route handling only
  useEffect(() => {
    if (status === 'loading') return;
    
    const isAuthenticated = session?.user || authStoreState.isAuthenticated;
    const isOnProtectedPage = protectedRoutes.some(path => pathname.includes(path));
    
    // Only handle protected route redirects, no automatic Telegram auth
    if (!isAuthenticated && isOnProtectedPage) {
      console.log('🔒 Redirecting unauthenticated user to login from protected route:', pathname);
      router.push('/login');
    }
  }, [session, status, authStoreState.isAuthenticated, pathname, router, protectedRoutes]);

  // Show loading state only if:
  // 1. We're on a protected route AND
  // 2. We're actually loading AND
  // 3. We don't have any existing authentication
  const isLoading = authState.isLoading || authStoreState.isLoading;
  const hasAnyAuth = session?.user || authStoreState.isAuthenticated;
  const isOnProtectedRoute = protectedRoutes.some(route => pathname.includes(route));
  
  // Only show loading screen for protected routes that actually need authentication
  if (isLoading && !hasAnyAuth && isOnProtectedRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-lg font-medium">Authenticating...</p>
          <p className="text-sm text-muted-foreground">Connecting with Telegram</p>
          {debug && (
            <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded max-w-md">
              <p>Debug: {authState.isLoading ? 'Telegram loading...' : ''} {authStoreState.isLoading ? 'Store loading...' : ''}</p>
              {diagnostics && (
                <p>Diagnostics: {diagnostics.telegramObject ? '✓' : '✗'} TG Object</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const contextValue: TelegramAuthContextType = {
    authState,
    diagnostics,
    refreshAuth,
    clearAuth,
    generateDiagnostics,
  };

  return (
    <TelegramAuthContext.Provider value={contextValue}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

/**
 * Hook to access authentication state anywhere in the app
 * Combines Telegram auth, auth store, and NextAuth session
 */
export function useAuth() {
  const context = useContext(TelegramAuthContext);
  const authStore = useAuthStore();
  const { data: session } = useSession();
  
  return {
    // Combined authentication state
    isAuthenticated: context?.authState.isAuthenticated || authStore.isAuthenticated || !!session,
    user: authStore.authUser || context?.authState.user || session?.user,
    isLoading: context?.authState.isLoading || authStore.isLoading,
    error: context?.authState.error || authStore.error,
    
    // Telegram specific
    isTelegramAuth: authStore.isTelegramAuth(),
    telegramUser: authStore.isTelegramAuth() ? authStore.authUser : null,
    
    // Actions (only available if context exists)
    refreshAuth: context?.refreshAuth,
    clearAuth: context?.clearAuth,
    
    // Diagnostics (only available if context exists)
    diagnostics: context?.diagnostics,
    generateDiagnostics: context?.generateDiagnostics,
    
    // Auth store computed values
    displayName: authStore.getUserDisplayName(),
    avatar: authStore.getUserAvatar(),
    isGoogleAuth: authStore.isGoogleAuth(),
  };
}

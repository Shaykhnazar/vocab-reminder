// lib/stores/use-auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TelegramWebAppUser } from '@/lib/telegram-webapp';
import { User } from '@/lib/supabase';

interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  telegram_id?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  provider?: string;
  provider_id?: string;
  notification_preferences?: {
    email: boolean;
    telegram: boolean;
  };
}

interface AuthStore {
  // State
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAuthUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  
  // Telegram specific actions
  setTelegramUser: (telegramData: TelegramWebAppUser, dbUser?: Partial<User>) => void;
  
  // Helper getters
  isGoogleAuth: () => boolean;
  isTelegramAuth: () => boolean;
  getUserDisplayName: () => string;
  getUserAvatar: () => string | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      authUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setAuthUser: (user) => {
        set({
          authUser: user,
          isAuthenticated: !!user,
          error: null,
        });
        console.log('🔄 Auth user set:', user ? `${user.name || user.first_name || 'Unknown'} (${user.provider || 'unknown'})` : 'null');
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error, isLoading: false }),

      clearAuth: () => {
        console.log('🧹 Clearing auth store');
        set({
          authUser: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      // Telegram specific user setting
      setTelegramUser: (telegramData, dbUser = {}) => {
        const authUser: AuthUser = {
          id: dbUser.id || telegramData.id.toString(),
          name: `${telegramData.first_name} ${telegramData.last_name || ''}`.trim(),
          telegram_id: telegramData.id.toString(),
          first_name: telegramData.first_name,
          last_name: telegramData.last_name,
          username: telegramData.username,
          image: telegramData.photo_url,
          photo_url: telegramData.photo_url,
          provider: 'telegram',
          notification_preferences: {
            email: false,
            telegram: true,
          },
          // Merge any additional DB user data
          ...dbUser,
        };

        set({
          authUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        console.log('🎯 Telegram user set in auth store:', authUser.first_name, '(ID:', authUser.telegram_id, ')');
      },

      // Helper getters
      isGoogleAuth: () => {
        const { authUser } = get();
        return authUser?.provider === 'google';
      },

      isTelegramAuth: () => {
        const { authUser } = get();
        return authUser?.provider === 'telegram' || !!authUser?.telegram_id;
      },

      getUserDisplayName: () => {
        const { authUser } = get();
        if (!authUser) return 'Guest';
        
        // For Telegram users, prefer first_name + last_name
        if (authUser.telegram_id || authUser.provider === 'telegram') {
          return `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() || 
                 authUser.username || 
                 authUser.name || 
                 'Telegram User';
        }
        
        // For other providers
        return authUser.name || authUser.email || 'User';
      },

      getUserAvatar: () => {
        const { authUser } = get();
        return authUser?.photo_url || authUser?.image || null;
      },
    }),
    {
      name: 'vocab-reminder-auth', // Key for localStorage
      partialize: (state) => ({
        // Only persist auth user data, not loading states
        authUser: state.authUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hooks for common operations
export const useAuthUser = () => useAuthStore((state) => state.authUser);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Actions hooks
export const useAuthActions = () => useAuthStore((state) => ({
  setAuthUser: state.setAuthUser,
  setLoading: state.setLoading,
  setError: state.setError,
  clearAuth: state.clearAuth,
  setTelegramUser: state.setTelegramUser,
}));

// Computed hooks
export const useAuthComputed = () => useAuthStore((state) => ({
  isGoogleAuth: state.isGoogleAuth(),
  isTelegramAuth: state.isTelegramAuth(),
  displayName: state.getUserDisplayName(),
  avatar: state.getUserAvatar(),
}));
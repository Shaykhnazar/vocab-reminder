// lib/hooks/use-user.ts
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  username: string | null;
  photo_url: string | null;
  telegram_id: string | null;
  notification_preferences: {
    email: boolean;
    telegram: boolean;
  };
  is_premium: boolean;
  subscription_status: string;
}

interface UserData {
  user: any | null; // Use any for NextAuth session user
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
}

export function useUser(): UserData {
  // Use NextAuth session instead of Supabase auth
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data as UserProfile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user profile'));
    }
  }

  const refreshProfile = async () => {
    if (session?.user?.id) {
      setIsLoading(true);
      await fetchUserProfile(session.user.id);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function getProfile() {
      try {
        setIsLoading(true);

        // If session is loading or user is not authenticated, return
        if (status === 'loading') return;
        if (status !== 'authenticated' || !session?.user?.id) {
          setIsLoading(false);
          return;
        }

        await fetchUserProfile(session.user.id);
      } catch (err) {
        console.error('Error getting user profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to get user profile'));
      } finally {
        setIsLoading(false);
      }
    }

    getProfile();
  }, [session, status]);

  return {
    user: session?.user || null,
    profile,
    isLoading: isLoading || status === 'loading',
    error,
    refreshProfile
  };
}

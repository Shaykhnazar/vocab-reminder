// lib/hooks/use-subscription.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

export type SubscriptionStatus = 'free' | 'monthly' | 'yearly' | 'lifetime';

interface Subscription {
  id: string;
  product_id: string;
  subscription_type: SubscriptionStatus;
  purchase_date: string;
  expires_at: string | null;
  is_active: boolean;
}

interface SubscriptionData {
  isPremium: boolean;
  isLifetime: boolean;
  subscriptionStatus: SubscriptionStatus;
  expiresAt: Date | null;
  daysRemaining: number | null;
  isLoading: boolean;
  error: Error | null;
  subscription: Subscription | null;
}

export function useSubscription(): SubscriptionData {
  // Replace useUser with useSession from next-auth
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      // Check if still loading session or if user is not authenticated
      if (status === 'loading') return;
      if (status !== 'authenticated' || !session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userId = session.user.id;

        // Get user's subscription status
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_premium, subscription_status')
          .eq('id', userId)
          .single();

        if (userError) {
          throw userError;
        }

        // Get active subscription details
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('expires_at', { ascending: false })
          .limit(1)
          .single();

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error, which is fine - just means no active subscription
          throw subscriptionError;
        }

        setSubscription(subscriptionData || null);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [session, status, supabase]);

  // Calculate derived data
  const isPremium = !!subscription?.is_active || false;
  const subscriptionStatus = subscription?.subscription_type || 'free';
  const isLifetime = subscriptionStatus === 'lifetime';

  // Calculate days remaining for subscription
  let expiresAt: Date | null = null;
  let daysRemaining: number | null = null;

  if (subscription?.expires_at) {
    expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    isPremium,
    isLifetime,
    subscriptionStatus,
    expiresAt,
    daysRemaining,
    isLoading: isLoading || status === 'loading',
    error,
    subscription
  };
}

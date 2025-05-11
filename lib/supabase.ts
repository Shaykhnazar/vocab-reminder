// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import {getPlanByProductId, getSubscriptionPlans, GUMROAD_PRODUCTS} from './gumroad';
import {SubscriptionsPageProps, Plan } from "@/types/subscriptions";

// Client-side Supabase instance
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
export interface Word {
  id: string;
  user_id: string;
  word: string;
  definition: string;
  created_at: string;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  review_stage: number;
  mastered: boolean;
  context?: string | null;  // Make context optional and nullable
}

export interface User {
  id: string;
  email: string;
  password: string;
  created_at: Date;
  telegram_id?: string;
  notification_preferences: {
    email: boolean;
    telegram: boolean;
  };
}

export const REVIEW_INTERVALS = [
  60 * 60 * 1000,           // Stage 0->1: 1 hour
  3 * 60 * 60 * 1000,      // Stage 1->2: 3 hours
  8 * 60 * 60 * 1000,      // Stage 2->3: 8 hours
  24 * 60 * 60 * 1000,     // Stage 3->4: 1 day
  3 * 24 * 60 * 60 * 1000, // Stage 4->5: 3 days
  7 * 24 * 60 * 60 * 1000  // Stage 5->6: 7 days (final stage)
];


export async function addWord(word: any) {
  // Before adding a word, check if the user has reached their limit
  const canAdd = await canAddWord(word.user_id);

  if (!canAdd.allowed) {
    throw new Error(canAdd.message);
  }

  const { data, error } = await supabase
    .from('words')
    .insert(word)
    .select()
    .single();

  if (error) {
    console.error('Error adding word:', error);
    throw error;
  }

  return data;
}

// Subscription-related functions
export async function getSubscriptionData(userId: string) {
  try {
    // Get user's active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error getting subscription:', subscriptionError);
      throw subscriptionError;
    }

    // Get word count
    const { count: wordCount, error: wordCountError } = await supabase
      .from('words')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (wordCountError) {
      console.error('Error getting word count:', wordCountError);
      throw wordCountError;
    }

    // Determine plan details - use the subscription data if available, otherwise default to free plan
    const planDetails = subscription && subscription.product_id
      ? getPlanByProductId(subscription.product_id)
      : GUMROAD_PRODUCTS.FREE;

    // Calculate days remaining until expiration
    const daysRemaining = subscription?.expires_at
      ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    const wordLimit = subscription?.word_limit || planDetails.wordLimit;

    return {
      currentSubscription: subscription ? {
        id: subscription.id,
        productId: subscription.product_id,
        subscriptionType: subscription.subscription_type || planDetails.name,
        purchaseId: subscription.purchase_id,
        purchaseDate: subscription.purchase_date,
        expiresAt: subscription.expires_at,
        isActive: subscription.is_active,
        productPermalink: subscription.product_permalink,
        isTrial: subscription.is_trial,
        trialDays: subscription.trial_days,
        recurrence: subscription.recurrence || 'monthly',
        price: subscription.price || planDetails.price,
        features: JSON.parse(subscription.features || '[]') || planDetails.features,
        wordLimit: wordLimit,
        planName: subscription.subscription_type || planDetails.name,
        daysRemaining
      } : null,
      wordLimit: wordLimit,
      wordsUsed: wordCount || 0,
      wordsRemaining: Math.max(0, wordLimit - (wordCount || 0))
    };
  } catch (error) {
    console.error('Error getting subscription data:', error);
    throw error;
  }
}

export async function getFullSubscriptionData(userId: string): Promise<SubscriptionsPageProps> {
  // Get current subscription data
  const subscriptionData = await getSubscriptionData(userId);

  // Get all available plans
  const plans = await getSubscriptionPlans();

  // Format the plans for frontend display
  const formattedPlans: Plan[] = plans.map(plan => (<Plan>{
    id: plan.id,
    name: plan.name,
    description: plan.name === 'Free Plan'
      ? 'Basic vocabulary learning with limited features'
      : `${plan.name} with enhanced learning features`,
    price: parseFloat(plan.price.replace(/[^0-9.-]+/g, '')),
    billingPeriod: plan.recurrence === 'yearly' ? 'yearly' : 'monthly',
    wordLimit: plan.wordLimit,
    features: plan.features,
    popular: plan.name === 'Pro Plan', // Mark the Pro plan as the most popular
    gumroadProductId: plan.id,
    gumroadPermalink: plan.permalink
  }));

  return {
    data: {
      currentSubscription: subscriptionData.currentSubscription ? {
        id: subscriptionData.currentSubscription.id,
        planId: subscriptionData.currentSubscription.productId,
        status: subscriptionData.currentSubscription.isActive ? 'active' : 'expired',
        startsAt: subscriptionData.currentSubscription.purchaseDate,
        endsAt: subscriptionData.currentSubscription.expiresAt,
        gumroadSubscriptionId: subscriptionData.currentSubscription.purchaseId,
        features: subscriptionData.currentSubscription.features,
        daysRemaining: subscriptionData.currentSubscription.daysRemaining,
        planName: subscriptionData.currentSubscription.planName || subscriptionData.currentSubscription.subscriptionType,
        wordLimit: subscriptionData.wordLimit,
        wordsUsed: subscriptionData.wordsUsed,
        wordsRemaining: subscriptionData.wordsRemaining
      } : null,
      plans: formattedPlans
    },
  };
}

export async function getBillingHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('billing_history')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error getting billing history:', error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      date: item.transaction_date,
      amount: item.amount,
      type: item.transaction_type,
      status: item.status,
      receiptUrl: item.receipt_url
    }));
  } catch (error) {
    console.error('Error getting billing history:', error);
    throw error;
  }
}

// Check if user can add more words
export async function canAddWord(userId: string) {
  try {
    // Get subscription data
    const subscriptionData = await getSubscriptionData(userId);

    // Check if user has reached the limit
    if (subscriptionData.wordsUsed >= subscriptionData.wordLimit) {
      return {
        allowed: false,
        message: `You've reached your word limit (${subscriptionData.wordLimit}). Please upgrade your plan to add more words.`
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking if user can add word:', error);
    throw error;
  }
}

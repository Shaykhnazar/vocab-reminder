export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  wordLimit: number;
  features: string[];
  popular: boolean;
  gumroadProductId: string;
  gumroadPermalink: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  wordLimit: number;
  features: string[];
  permalink: string;
  price: string;
  recurrence: 'none' | 'monthly' | 'yearly';
  popular?: boolean;
}

export interface CurrentSubscription {
  id: string;
  planId: string;
  status: string;
  startsAt: string;
  endsAt: string;
  gumroadSubscriptionId: string;
  features: string[];
  planName: string;
  wordLimit: number;
  wordsUsed: number;
  wordsRemaining: number;
  daysRemaining: number;
}

export interface SubscriptionsPageProps {
  data: {
    currentSubscription: CurrentSubscription | null;
    plans: Plan[];
  };
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'subscription' | 'refund';
  status: string;
  receiptUrl?: string;
}

export interface Subscription {
  id: string;
  productId: string;
  subscriptionType: string;
  purchaseId: string;
  purchaseDate: string;
  expiresAt: string;
  isActive: boolean;
  productPermalink: string;
  isTrial: boolean;
  trialDays: number;
  recurrence: string;
  price: string;
}

export interface BillingPageProps {
  subscriptionData: {
    currentSubscription: Subscription | null;
    wordLimit: number;
    wordsUsed: number;
  };
  billingHistory: Transaction[];
}

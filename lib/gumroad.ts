// lib/gumroad.ts

// Product configuration - defines the available subscription plans

export const GUMROAD_PRODUCTS = {
  FREE: {
    id: 'free',
    name: 'Free Plan',
    wordLimit: 1000,
    features: ['Basic vocabulary management', 'Email notifications', 'Telegram notifications', 'Limited to 1000 words'],
    permalink: '',
    price: '$0',
    recurrence: 'none'
  },
  PREMIUM_MONTHLY: {
    id: process.env.NEXT_PUBLIC_GUMROAD_PREMIUM_MONTHLY_PRODUCT_ID || 'basic',
    name: 'Premium Plan',
    wordLimit: 10000,
    features: ['Up to 10000 words', 'Email notifications', 'Telegram notifications', 'Basic stats'],
    permalink: process.env.NEXT_PUBLIC_GUMROAD_PREMIUM_MONTHLY_PERMALINK || 'https://example.gumroad.com/basic',
    price: '$0.99',
    recurrence: 'monthly'
  },
  PREMIUM_YEARLY: {
    id: process.env.NEXT_PUBLIC_GUMROAD_PREMIUM_YEARLY_PRODUCT_ID || 'pro',
    name: 'Premium Plan',
    wordLimit: 10000,
    features: ['Up to 10000 words', 'All notification channels', 'Advanced statistics', 'Custom review schedules'],
    permalink: process.env.NEXT_PUBLIC_GUMROAD_PREMIUM_YEARLY_PERMALINK || 'https://example.gumroad.com/pro',
    price: '$8.32',
    recurrence: 'yearly'
  },
  LIFETIME: {
    id: process.env.NEXT_PUBLIC_GUMROAD_LIFETIME_PRODUCT_ID || 'unlimited',
    name: 'Lifetime Plan',
    wordLimit: 100000,
    features: ['Unlimited words', 'All premium features', 'Priority support', 'API access'],
    permalink: process.env.NEXT_PUBLIC_GUMROAD_LIFETIME_PERMALINK || 'https://example.gumroad.com/unlimited',
    price: '$39.99',
    recurrence: 'yearly'
  }
};

// Get all subscription plans
export async function getSubscriptionPlans() {
  return Object.values(GUMROAD_PRODUCTS);
}

// Get plan details by ID
export function getPlanById(planId: string) {
  return GUMROAD_PRODUCTS[planId as keyof typeof GUMROAD_PRODUCTS] || GUMROAD_PRODUCTS.FREE;
}

// Get plan by product ID from Gumroad
export function getPlanByProductId(productId: string) {
  const plans = Object.values(GUMROAD_PRODUCTS);
  return plans.find(plan => plan.id === productId) || GUMROAD_PRODUCTS.FREE;
}

// Interface for Gumroad webhook payload
export interface GumroadWebhookPayload {
  product_id: string;
  product_name: string;
  permalink: string;
  product_permalink: string;
  email: string;
  price: string;
  currency: string;
  quantity: number;
  order_number: string;
  sale_id: string;
  sale_timestamp: string;
  purchaser_id: string;
  subscription_id: string;
  recurrence: string;
  is_recurring_charge: boolean;
  is_gift: boolean;
  refunded: boolean;
  disputed: boolean;
  dispute_won: boolean;
  seller_id: string;
  card: {
    visual: string;
    type: string;
    last4: string;
  };
  is_test_mode: boolean;
  customer: {
    name: string;
    email: string;
    address: string;
    ip_country: string;
  };
  can_contact: boolean;
  is_subscription_active: boolean;
  subscription_cancelled_at?: string;
  subscription_failed_at?: string;
  subscription_restarted_at?: string;
  subscription_ended_at?: string;
  subscription_duration: string;
  custom_fields: any[];
  discover_fee_charged: boolean;
}

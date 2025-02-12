// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

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
  telegramId?: string;
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


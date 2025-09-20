// lib/validation.ts

import {supabase, canAddWord} from "@/lib/supabase";

export enum DuplicateCheckPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

interface ValidationOptions {
  userId: string;
  word: string;
  checkPeriod: DuplicateCheckPeriod;
}

export async function isWordDuplicate({ userId, word, checkPeriod }: ValidationOptions): Promise<boolean> {
  const now = new Date();
  let startDate: Date;

  // Calculate start date based on check period
  switch (checkPeriod) {
    case DuplicateCheckPeriod.DAY:
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case DuplicateCheckPeriod.WEEK:
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case DuplicateCheckPeriod.MONTH:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
  }

  try {
    const { data, error } = await supabase
      .from('words')
      .select('id')
      .eq('user_id', userId)
      .eq('word', word.toLowerCase().trim()) // Case-insensitive comparison
      .gte('created_at', startDate.toISOString())
      .limit(1);

    if (error) throw error;

    return data.length > 0;
  } catch (error) {
    console.error('Error checking word uniqueness:', error);
    throw error;
  }
}

/**
 * Validates a new word before adding it
 */
export async function validateNewWord(userId: string, word: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    // Basic validation
    if (!word || word.trim().length === 0) {
      return { valid: false, error: 'Word cannot be empty' };
    }

    if (word.length > 50) {
      return { valid: false, error: 'Word is too long (max 50 characters)' };
    }

    // Check subscription limits
    const subscriptionCheck = await canAddWord(userId);
    if (!subscriptionCheck.allowed) {
      return {
        valid: false,
        error: subscriptionCheck.message || 'Word limit reached for your subscription'
      };
    }

    // Check for duplicates in the last week
    const isDuplicate = await isWordDuplicate({
      userId,
      word,
      checkPeriod: DuplicateCheckPeriod.WEEK
    });

    if (isDuplicate) {
      return {
        valid: false,
        error: 'You have already added this word in the last week'
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('Word validation error:', error);
    throw error;
  }
}

/**
 * Validates multiple words for bulk adding
 */
export async function validateBulkWords(userId: string, words: string[]): Promise<{
  valid: boolean;
  error?: string;
  allowedCount?: number;
}> {
  try {
    if (!words || words.length === 0) {
      return { valid: false, error: 'No words provided' };
    }

    // Check subscription limits for bulk operation
    const subscriptionCheck = await canAddWord(userId);
    if (!subscriptionCheck.allowed) {
      return {
        valid: false,
        error: subscriptionCheck.message || 'Word limit reached for your subscription'
      };
    }

    // Get current word count and subscription details
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('word_limit')
      .eq('user_id', userId)
      .single();

    const { count: currentWordCount } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const wordLimit = subscriptionData?.word_limit || 50; // Default free plan limit
    const wordsUsed = currentWordCount || 0;
    const remainingSlots = wordLimit - wordsUsed;

    if (words.length > remainingSlots) {
      return {
        valid: false,
        error: `You can only add ${remainingSlots} more words with your current subscription. You're trying to add ${words.length} words.`,
        allowedCount: remainingSlots
      };
    }

    return { valid: true, allowedCount: words.length };
  } catch (error) {
    console.error('Bulk word validation error:', error);
    throw error;
  }
}

// app/api/words/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, REVIEW_INTERVALS } from '@/lib/supabase';
import { addToNotificationQueue } from '@/lib/notifications';

// Define a structure for words we'll be adding in bulk
interface BulkWordInput {
  word: string;
  definition: string;
  context?: string | null;
  userId: string;
}

export async function POST(req: NextRequest) {
  try {
    const { words } = await req.json();

    // Basic validation
    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json({
        error: 'Request must include an array of words'
      }, { status: 400 });
    }

    // Check if all words have the required fields
    const invalidWords = words.filter(word =>
      !word.word || !word.definition || !word.userId
    );

    if (invalidWords.length > 0) {
      return NextResponse.json({
        error: 'All words must contain word, definition, and userId fields'
      }, { status: 400 });
    }

    // Get user notification preferences (using the first word's userId)
    const userId = words[0].userId;
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('notification_preferences, telegram_id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      // Continue with default preferences if we can't fetch user data
    }

    // Determine notification type based on user preferences
    let notificationType = 'email';
    if (userData) {
      const hasEmail = userData.notification_preferences?.email;
      const hasTelegram = userData.notification_preferences?.telegram && userData.telegram_id;

      if (hasEmail && hasTelegram) {
        notificationType = 'both';
      } else if (!hasEmail && hasTelegram) {
        notificationType = 'telegram';
      }
    }

    // Process in batches of 100 if the array is large
    const BATCH_SIZE = 100;
    const results = [];
    const errors = [];

    for (let i = 0; i < words.length; i += BATCH_SIZE) {
      const batch = words.slice(i, i + BATCH_SIZE);

      // Prepare data for insertion
      const now = new Date();
      const firstReviewTime = new Date(now.getTime() + REVIEW_INTERVALS[0]);

      const wordsToInsert = batch.map((word: BulkWordInput) => ({
        user_id: word.userId,
        word: word.word.trim(),
        definition: word.definition.trim(),
        context: word.context || null,
        next_review_at: firstReviewTime.toISOString(),
        review_stage: 0
      }));

      // Insert the batch
      const { data: insertedWords, error: insertError } = await supabase
        .from('words')
        .insert(wordsToInsert)
        .select();

      if (insertError) {
        console.error('Error inserting words batch:', insertError);
        errors.push(insertError);
        continue;
      }

      if (insertedWords) {
        results.push(...insertedWords);

        // Schedule notifications for each word
        for (const word of insertedWords) {
          try {
            await addToNotificationQueue({
              userId,
              wordId: word.id,
              scheduledFor: firstReviewTime,
              type: notificationType as 'email' | 'telegram' | 'both'
            });
          } catch (notificationError) {
            console.error('Error creating notification for word:', word.id, notificationError);
            // Continue with the next word
          }
        }
      }
    }

    if (errors.length > 0 && results.length === 0) {
      // If all batches failed
      return NextResponse.json({
        error: 'Failed to add any words',
        details: errors
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: results,
      added: results.length,
      total: words.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error in bulk word addition:', error);

    return NextResponse.json({
      error: 'Failed to add words',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// app/actions.ts
'use server';

import { supabase, REVIEW_INTERVALS } from '@/lib/supabase';
import { addToNotificationQueue } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

export async function addWord(word: string, definition: string, context?: string) {
  try {
    // Get the current user (you'll need to implement auth)
    const userId = '...'; // Get this from your auth system

    // Insert the word
    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .insert({
        user_id: userId,
        word,
        definition,
        context,
        next_review_at: new Date(Date.now() + REVIEW_INTERVALS[0]).toISOString()
      })
      .select()
      .single();

    if (wordError) throw wordError;

    // Schedule first notification
    await addToNotificationQueue({
      userId,
      wordId: wordData.id,
      scheduledFor: new Date(Date.now() + REVIEW_INTERVALS[0]),
      type: 'email'
    });

    // Revalidate the page to show the new word
    revalidatePath('/');

    return { success: true, data: wordData };
  } catch (error) {
    console.error('Error adding word:', error);
    return { success: false, error: 'Failed to add word' };
  }
}

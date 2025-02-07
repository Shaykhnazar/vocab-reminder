// app/api/words/route.ts
import {NextRequest, NextResponse} from 'next/server';
import { supabase, REVIEW_INTERVALS } from '@/lib/supabase';
import { addToNotificationQueue } from '@/lib/notifications';
import { validateNewWord } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const { word, definition, context, userId } = await req.json();

    // Basic request validation
    if (!word || !definition || !userId) {
      return NextResponse.json({
        error: 'Word, definition, and userId are required'
      }, { status: 400 });
    }

    // Check for duplicate words and other validations
    const validation = await validateNewWord(userId, word);
    if (!validation.valid) {
      return NextResponse.json({
        error: validation.error
      }, { status: 400 });
    }

    const firstReviewTime = new Date(Date.now() + REVIEW_INTERVALS[0]);

    // Insert the word
    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .insert({
        user_id: userId,
        word: word.trim(), // Normalize the word
        definition,
        context,
        next_review_at: firstReviewTime.toISOString(),
        review_stage: 0  // Start with first review stage
      })
      .select()
      .single();

    if (wordError || !wordData) {
      throw new Error(wordError?.message || 'Failed to insert word');
    }

    // Now we're sure we have the word ID
    try {
      // Schedule notification for the current review stage
      await addToNotificationQueue({
        userId,
        wordId: wordData.id,
        scheduledFor: firstReviewTime,
        type: 'email'
      });
    } catch (notificationError) {
      // Log notification error but don't fail the word creation
      console.error('Error creating notifications:', notificationError);
    }

    return NextResponse.json({
      success: true,
      data: wordData
    });
  } catch (error) {
    console.error('Error adding word:', error);

    // Handle specific error types
    if (error instanceof Error) {
      return NextResponse.json({
        error: error.message
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add word' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { data: words, error } = await supabase
      .from('words')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: words
    });
  } catch (error) {
    console.error('Error fetching words:', error);
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}

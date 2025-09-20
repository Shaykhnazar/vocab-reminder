// app/api/review/words/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const userId = session.user.id;

    // Get words due for review (next_review_at is null or in the past, and not mastered)
    const today = new Date();

    const { data: reviewWords, error } = await supabase
      .from('words')
      .select('id, word, definition, context, review_stage, last_reviewed_at, created_at')
      .eq('user_id', userId)
      .eq('mastered', false)
      .or(`next_review_at.is.null,next_review_at.lte.${today.toISOString()}`)
      .order('next_review_at', { ascending: true, nullsFirst: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching review words:', error);
      return NextResponse.json(
        { error: 'Failed to fetch review words' },
        { status: 500 }
      );
    }

    // Transform words for review interface
    const transformedWords = reviewWords?.map((word, index) => ({
      id: word.id,
      word: word.word,
      definition: word.definition,
      context: word.context,
      stage: word.review_stage,
      reviewed: false,
      status: null as 'correct' | 'incorrect' | 'skipped' | null
    })) || [];

    console.log(`📚 Found ${transformedWords.length} words due for review for user ${userId}`);

    return NextResponse.json({
      words: transformedWords,
      total: transformedWords.length,
      sessionId: `session_${Date.now()}_${userId}`
    });

  } catch (error) {
    console.error('❌ Error in review words API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
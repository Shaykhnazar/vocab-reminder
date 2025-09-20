// app/api/words/recent/route.ts
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
    const limit = parseInt(searchParams.get('limit') || '5');

    const userId = session.user.id;

    // Get recent words for the user
    const { data: words, error } = await supabase
      .from('words')
      .select('id, word, definition, review_stage, mastered, created_at, next_review_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent words:', error);
      return NextResponse.json(
        { error: 'Failed to fetch words' },
        { status: 500 }
      );
    }

    // Transform words to match dashboard expectations
    const transformedWords = words?.map(word => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const isDueToday = word.next_review_at && new Date(word.next_review_at) <= today;
      const isNew = word.review_stage === 0;

      return {
        id: word.id,
        word: word.word,
        definition: word.definition,
        stage: word.review_stage,
        mastered: word.mastered,
        dueToday: isDueToday && !word.mastered,
        new: isNew && !word.mastered
      };
    }) || [];

    return NextResponse.json({
      words: transformedWords,
      total: words?.length || 0
    });

  } catch (error) {
    console.error('❌ Error in recent words API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// app/api/words/route.ts
import {NextRequest, NextResponse} from 'next/server';
import { supabase, REVIEW_INTERVALS } from '@/lib/supabase';
import { addToNotificationQueue } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const { word, definition, context, userId } = await req.json();

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

    return NextResponse.json(wordData);
  } catch (error) {
    console.error('Error adding word:', error);
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

    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching words:', error);
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}

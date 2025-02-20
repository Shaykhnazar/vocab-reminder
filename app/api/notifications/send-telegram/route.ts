// app/api/notifications/send-telegram/route.ts
import { NextResponse } from 'next/server';
import { sendVocabularyReview } from '@/lib/telegram';
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

async function handler(req: Request) {
  try {
    const body = await req.json();
    const { to, words } = body;

    if (!to || !words || !Array.isArray(words)) {
      return NextResponse.json(
        { error: 'Invalid request. Missing to, words, or words is not an array' },
        { status: 400 }
      );
    }

    console.log(`Sending Telegram notification to ${to} for ${words.length} words`);

    const success = await sendVocabularyReview(to, words);

    if (!success) {
      throw new Error('Failed to send Telegram notification');
    }

    return NextResponse.json({
      success: true,
      message: `Telegram notification sent successfully to ${to}`,
      words_count: words.length
    });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return NextResponse.json(
      {
        error: 'Failed to send Telegram notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Protected by QStash signature verification
export const POST = verifySignatureAppRouter(handler);

// Development-only endpoint for testing
export async function GET(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Method not allowed in production' }, { status: 405 });
  }

  // Get test data from query parameters
  const url = new URL(req.url);
  const to = url.searchParams.get('to');
  const word = url.searchParams.get('word') || 'test';
  const definition = url.searchParams.get('definition') || 'a test word';

  if (!to) {
    return NextResponse.json({ error: 'Missing to parameter' }, { status: 400 });
  }

  try {
    const testData = {
      to,
      words: [{ word, definition, context: 'This is a test notification' }]
    };

    const success = await sendVocabularyReview(to, testData.words);

    return NextResponse.json({
      success,
      message: success ? 'Test notification sent' : 'Failed to send test notification',
      test_data: testData
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json({ error: 'Test notification failed' }, { status: 500 });
  }
}

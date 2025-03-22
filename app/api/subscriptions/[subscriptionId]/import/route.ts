// app/api/subscriptions/[subscriptionId]/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!params.subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    // In a real application, you would:
    // 1. Fetch the dictionary words based on the subscription
    // 2. Add them to the user's words
    // 3. Update the subscription's lastSyncedAt and wordsAdded fields

    // For the MVP, we'll return a mock response
    const mockImportResult = {
      wordsAdded: 50,
      lastSyncedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockImportResult
    });
  } catch (error) {
    console.error('Error importing dictionary words:', error);
    return NextResponse.json({ error: 'Failed to import dictionary words' }, { status: 500 });
  }
}

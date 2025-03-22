// app/api/dictionaries/[dictionaryId]/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { dictionaryId: string } }
) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!params.dictionaryId) {
      return NextResponse.json({ error: 'Dictionary ID is required' }, { status: 400 });
    }

    // In a real application, you would:
    // 1. Check if the subscription already exists
    // 2. Create the subscription in your database
    // 3. Return the subscription details

    // For the MVP, we'll return a mock response
    const mockSubscription = {
      id: `sub_${Date.now()}`,
      userId,
      dictionaryId: params.dictionaryId,
      subscribedAt: new Date().toISOString(),
      lastSyncedAt: null,
      wordsAdded: 0,
    };

    return NextResponse.json({
      success: true,
      data: mockSubscription
    });
  } catch (error) {
    console.error('Error subscribing to dictionary:', error);
    return NextResponse.json({ error: 'Failed to subscribe to dictionary' }, { status: 500 });
  }
}

// app/api/subscriptions/check-limits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { canAddWord, getSubscriptionData } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user can add more words
    const canAddWordResult = await canAddWord(session.user.id);

    // Get subscription details
    const subscriptionDetails = await getSubscriptionData(session.user.id);

    return NextResponse.json({
      canAddWord: canAddWordResult.allowed,
      message: canAddWordResult.message,
      subscription: {
        plan: subscriptionDetails.currentSubscription?.planName || 'Free Plan',
        wordLimit: subscriptionDetails.wordLimit,
        wordsUsed: subscriptionDetails.wordsUsed,
        wordsRemaining: subscriptionDetails.wordsRemaining,
        daysRemaining: subscriptionDetails.currentSubscription?.daysRemaining || 0,
        expiresAt: subscriptionDetails.currentSubscription?.expiresAt || null,
        features: subscriptionDetails.currentSubscription?.features || []
      }
    });
  } catch (error) {
    console.error('Error checking subscription limits:', error);
    return NextResponse.json(
      { error: 'Error checking subscription limits' },
      { status: 500 }
    );
  }
}

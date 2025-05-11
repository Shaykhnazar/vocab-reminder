// app/api/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {getFullSubscriptionData} from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's current subscription
    const subscriptionData = await getFullSubscriptionData(session.user.id);

    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { error: 'Error fetching subscription data' },
      { status: 500 }
    );
  }
}

// app/api/cron/process-user/route.ts
import { NextResponse } from 'next/server';
import { processUserNotifications } from '@/lib/notifications';
import {verifySignatureAppRouter} from "@upstash/qstash/nextjs";

async function handler(body: { userId: string }) {
  try {
    console.log('Handler received body:', JSON.stringify(body));
    const userId = body.userId;

    if (!userId) {
      console.log('No userId found in body');
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log('Processing notifications for userId:', userId);
    await processUserNotifications(userId);
    console.log('Successfully processed notifications for userId:', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing user notifications:', error);
    return NextResponse.json({
      error: 'Failed to process user notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(async (req: Request) => {
  const body = await req.json();
  return handler(body);
});

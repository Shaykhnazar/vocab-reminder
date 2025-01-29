// app/api/cron/process-notifications/route.ts
import { NextResponse } from 'next/server';
import { processNotificationQueue } from '@/lib/notifications';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    // You should add proper authentication here

    await processNotificationQueue();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json({ error: 'Failed to process notifications' }, { status: 500 });
  }
}

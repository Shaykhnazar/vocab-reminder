// app/api/cron/process-notifications/route.ts
import { NextResponse } from 'next/server';
import { verifySignature } from '@upstash/qstash/dist/nextjs';
import { processNotificationQueue } from '@/lib/notifications';

async function handler() {
  try {
    await processNotificationQueue();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json({ error: 'Failed to process notifications' }, { status: 500 });
  }
}

// Wrap the handler with QStash verification
export const POST = verifySignature(handler);

// Keep GET for testing locally
export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    return handler();
  }
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

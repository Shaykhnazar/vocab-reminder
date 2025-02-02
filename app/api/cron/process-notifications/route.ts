// app/api/cron/process-notifications/route.ts
import { NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { processNotificationQueue } from '@/lib/notifications';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

async function handler() {
  try {
    await processNotificationQueue();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json({ error: 'Failed to process notifications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get('upstash-signature');
  const body = await req.text();

  // Verify the signature
  if (!signature || !(await receiver.verify({
    signature,
    body
  }))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  return handler();
}

// Keep GET for testing locally
export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    return handler();
  }
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

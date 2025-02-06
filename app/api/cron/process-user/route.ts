// app/api/cron/process-user/route.ts
import { NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { processUserNotifications } from '@/lib/notifications';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

async function handler(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await processUserNotifications(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing user notifications:', error);
    return NextResponse.json({ error: 'Failed to process user notifications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get('upstash-signature');
  const body = await req.text();

  if (!signature || !(await receiver.verify({ signature, body }))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  return handler(req);
}

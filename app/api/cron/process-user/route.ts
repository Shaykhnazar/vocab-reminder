// app/api/cron/process-user/route.ts
import { NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { processUserNotifications } from '@/lib/notifications';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

async function handler(body: { userId: string }) {
  try {
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await processUserNotifications(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing user notifications:', error);
    return NextResponse.json({
      error: 'Failed to process user notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('upstash-signature');
    const rawBody = await req.text();

    if (!signature || !(await receiver.verify({ signature, body: rawBody }))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the body after verification
    const body = JSON.parse(rawBody);
    return handler(body);
  } catch (error) {
    console.error('Error in process-user POST:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

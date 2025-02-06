// app/api/cron/process-notifications/route.ts
import { NextResponse } from 'next/server';
import {Client, Receiver} from '@upstash/qstash';
import { getUsersWithPendingNotifications } from '@/lib/notifications';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!
});

async function handler() {
  try {
    const userIds = await getUsersWithPendingNotifications();

    // Queue processing for each user using QStash
    await Promise.all(userIds.map(userId =>
      qstashClient.publishJSON({
        url: `${process.env.VERCEL_URL}/api/cron/process-user`,
        body: { userId },
        options: {
          retries: 3,
          delay: '0s',
          notBefore: new Date().toISOString(), // Process immediately
          deadlineSeconds: 60 // Set 1-minute timeout
        }
      })
    ));

    return NextResponse.json({
      success: true,
      usersQueued: userIds.length
    });
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json({ error: 'Failed to process notificationssssssss' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get('upstash-signature');
  const body = await req.text();

  // Verify the signature
  if (!signature || !(await receiver.verify({ signature, body }))) {
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

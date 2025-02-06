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

export async function POST(req: Request) {
  console.log('Received POST request');

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - skipping signature verification');
      const body = await req.json();
      return handler(body);
    }

    console.log('Production mode - verifying signature');
    const signature = req.headers.get('upstash-signature');
    console.log('Signature:', signature);

    const rawBody = await req.text();
    console.log('Raw body:', rawBody);

    if (!signature || !(await receiver.verify({ signature, body: rawBody }))) {
      console.log('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the body after verification
    const body = JSON.parse(rawBody);
    console.log('Parsed body:', JSON.stringify(body));

    return handler(body);
  } catch (error) {
    console.error('Error in process-user POST:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

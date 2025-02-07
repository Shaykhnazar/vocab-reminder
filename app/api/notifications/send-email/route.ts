// app/api/notifications/send-email/route.ts
import { NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { sendBatchedEmail } from '@/lib/notifications';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

interface WordToReview {
  word: string;
  definition: string;
  context?: string | null;
}

async function handler(body: { to: string; words: WordToReview[] }) {
  try {
    await sendBatchedEmail(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // const signature = req.headers.get('upstash-signature');
    // const clonedReq = req.clone();
    // const rawBody = await clonedReq.text();
    //
    // if (!signature || !(await receiver.verify({ signature, body: rawBody }))) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    //
    // const body = JSON.parse(rawBody);
    // return handler(body);
    return handler(await req.json());
  } catch (error) {
    console.error('Error in send-email POST:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

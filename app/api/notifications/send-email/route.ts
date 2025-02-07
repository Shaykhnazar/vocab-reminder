// app/api/notifications/send-email/route.ts
import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sendBatchedEmail } from '@/lib/notifications';


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

export const POST = verifySignatureAppRouter(async (req: Request) => {
  const body = await req.json();
  return handler(body);
});

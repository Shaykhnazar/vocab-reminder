// app/api/cron/process-notifications/route.ts
import { NextResponse } from 'next/server';
import {Client} from '@upstash/qstash';
import { getUsersWithPendingNotifications } from '@/lib/notifications';
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!
});

async function handler() {
  try {
    const userIds = await getUsersWithPendingNotifications();

    if (!userIds.length) {
      return NextResponse.json({
        success: true,
        usersQueued: 0,
        message: 'No pending notifications found'
      });
    }

    console.log(`Processing notifications for ${userIds.length} users`);

    // Queue processing for each user using QStash
    const queueResults = await Promise.all(userIds.map(async userId => {
      try {
        await qstashClient.publishJSON({
          url: `${process.env.VERCEL_URL}/api/cron/process-user`,
          body: { userId },
          retries: 3,
          delay: '0s',
        });
        return { userId, success: true };
      } catch (error) {
        console.error(`Failed to queue user ${userId}:`, error);
        return { userId, success: false, error };
      }
    }));

    const successful = queueResults.filter(r => r.success);
    const failed = queueResults.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      usersQueued: successful.length,
      failedToQueue: failed.length,
      details: {
        successful: successful.map(r => r.userId),
        failed: failed.map(r => r.userId)
      }
    });
  } catch (error) {
    console.error('Error in process-notifications handler:', error);
    return NextResponse.json({
      error: 'Failed to process notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(async () => {
  return handler();
});

// Keep GET for testing locally
export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    return handler();
  }
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

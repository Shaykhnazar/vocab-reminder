// app/api/telegram/setup-webhook/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Validates if the request has access to perform admin operations
 * Allows access in development mode, for admin users, or with valid API key
 */
async function validateAccess(req: Request): Promise<boolean> {
  // Allow in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // In production, require admin access
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return false;
  }

  // Check if user is admin
  // You can customize this logic based on your user roles
  const isAdmin = (session.user as any).role === 'admin' ||
                 (session.user as any).is_super_admin ||
                 (session.user as any).email === process.env.ADMIN_EMAIL;

  // Allow with admin API key as fallback
  const adminApiKey = process.env.ADMIN_API_KEY;
  if (adminApiKey) {
    const authHeader = req.headers.get('authorization');
    if (authHeader === `Bearer ${adminApiKey}`) {
      return true;
    }
  }

  return isAdmin === true;
}

export async function POST(req: Request) {
  try {
    // Verify access
    const hasAccess = await validateAccess(req);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

    if (!TELEGRAM_BOT_TOKEN || !WEBHOOK_SECRET || !APP_URL) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    const webhookUrl = `${APP_URL}/api/telegram/webhook/${WEBHOOK_SECRET}`;

    // Set webhook
    const setWebhookResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message'],
          drop_pending_updates: true,
        }),
      }
    );

    const setWebhookResult = await setWebhookResponse.json();

    if (!setWebhookResult.ok) {
      throw new Error(`Telegram API error: ${setWebhookResult.description}`);
    }

    // Get webhook info to verify it was set correctly
    const getWebhookInfoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );

    const webhookInfo = await getWebhookInfoResponse.json();

    // Set bot commands
    const setCommandsResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commands: [
            { command: 'start', description: 'Connect account & enable notifications' },
            { command: 'status', description: 'Check notification settings' },
            { command: 'stop', description: 'Pause notifications' },
            { command: 'help', description: 'Show available commands' },
          ],
        }),
      }
    );

    const setCommandsResult = await setCommandsResponse.json();

    return NextResponse.json({
      success: true,
      webhook: {
        url: webhookUrl,
        info: webhookInfo.result,
      },
      commands: setCommandsResult.ok ? 'Set successfully' : 'Failed to set commands',
    });
  } catch (error) {
    console.error('Error setting up Telegram webhook:', error);
    return NextResponse.json(
      {
        error: 'Failed to set up Telegram webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const hasAccess = await validateAccess(req);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'TELEGRAM_BOT_TOKEN is not set' },
        { status: 500 }
      );
    }

    // Get current webhook info
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );

    const webhookInfo = await response.json();

    return NextResponse.json({
      success: true,
      webhook: webhookInfo.result
    });
  } catch (error) {
    console.error('Error checking webhook status:', error);
    return NextResponse.json(
      {
        error: 'Failed to check webhook status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

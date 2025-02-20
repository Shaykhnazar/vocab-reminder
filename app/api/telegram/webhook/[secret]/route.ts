// app/api/telegram/webhook/[secret]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    date: number;
    text?: string;
    entities?: Array<{
      type: string;
      offset: number;
      length: number;
    }>;
  };
}

// Helper function to send Telegram messages
async function sendTelegramMessage(chatId: number, text: string, parseMode = 'HTML') {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: parseMode
        })
      }
    );

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

export async function POST(
  req: Request,
  { params }: { params: { secret: string } }
) {
  try {
    // Verify webhook secret
    const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET || params.secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update: TelegramUpdate = await req.json();

    // Ignore updates without messages
    if (!update.message) {
      return NextResponse.json({ success: true });
    }

    const { message } = update;
    const chatId = message.chat.id;
    const { first_name, last_name, username } = message.from;

    // Handle commands
    if (message.text && message.text.startsWith('/')) {
      if (message.text.startsWith('/start')) {
        // Extract user ID from start command if present
        const parts = message.text.split(' ');
        const userId = parts.length > 1 ? parts[1] : null;

        if (userId && userId.length > 10) {
          // Link Telegram account to user
          try {
            // First check if this Telegram ID is already linked to another account
            const { data: existingUser, error: checkError } = await supabase
              .from('users')
              .select('id')
              .eq('telegram_id', chatId.toString())
              .maybeSingle();

            if (checkError) {
              console.error('Error checking existing Telegram connection:', checkError);
            }

            // If already linked to different account, show error
            if (existingUser && existingUser.id !== userId) {
              await sendTelegramMessage(chatId, `
❌ <b>Connection Failed</b>

This Telegram account is already connected to a different Vocabry account.
Please disconnect it first before connecting to a new account.
              `);
              return NextResponse.json({ success: true });
            }

            // First get current user data
            const { data: currentUser, error: fetchError } = await supabase
              .from('users')
              .select('raw_user_meta_data, notification_preferences')
              .eq('id', userId)
              .single();

            if (fetchError) {
              console.error('Error fetching current user data:', fetchError);
              throw new Error('User not found');
            }

            // Prepare updated metadata and preferences
            const updatedMetadata = {
              ...(currentUser.raw_user_meta_data || {}),
              telegram_username: username,
              telegram_first_name: first_name,
              telegram_last_name: last_name
            };

            const updatedPreferences = {
              ...(currentUser.notification_preferences || { email: true, telegram: false }),
              telegram: true
            };

            // Update user with Telegram information
            const { error: updateError } = await supabase
              .from('users')
              .update({
                telegram_id: chatId.toString(),
                raw_user_meta_data: updatedMetadata,
                notification_preferences: updatedPreferences
              })
              .eq('id', userId);

            if (updateError) {
              console.error('Error linking Telegram account:', updateError);
              await sendTelegramMessage(chatId, `
❌ <b>Connection Failed</b>

There was a problem connecting your Telegram account. Please try again or contact support.
              `);
            } else {
              // Success
              await sendTelegramMessage(chatId, `
<b>🎉 Successfully Connected!</b>

Your Telegram account is now linked to your Vocabry account.
You'll receive vocabulary review reminders here.

<b>Commands:</b>
/status - Check your notification settings
/stop - Pause Telegram notifications
/start - Resume Telegram notifications
/help - Show available commands
              `);
            }
          } catch (error) {
            console.error('Error in Telegram account linking:', error);
            await sendTelegramMessage(chatId, `
❌ <b>Connection Error</b>

There was a technical problem connecting your account. Please try again later.
            `);
          }
        } else {
          // Welcome message for users who start the bot without linking
          await sendTelegramMessage(chatId, `
<b>👋 Welcome to Vocabry!</b>

This bot helps you remember new vocabulary words using spaced repetition.

To connect your account, please:
1. Go to your Vocabry profile settings
2. Open the Notifications tab
3. Click the "Connect" button

Need help? Visit our website for more information.
          `);
        }
      } else if (message.text === '/status') {
        // Check if user exists and get notification status
        const { data: user, error } = await supabase
          .from('users')
          .select('notification_preferences')
          .eq('telegram_id', chatId.toString())
          .single();

        if (error || !user) {
          await sendTelegramMessage(chatId, `
❌ <b>Account Not Connected</b>

Your Telegram account is not linked to any Vocabry account.
Please connect your account through the Vocabry app settings.
          `);
        } else {
          const prefs = user.notification_preferences || { email: true, telegram: false };
          await sendTelegramMessage(chatId, `
<b>📊 Notification Status</b>

Telegram notifications: ${prefs.telegram ? '✅ Enabled' : '❌ Disabled'}
Email notifications: ${prefs.email ? '✅ Enabled' : '❌ Disabled'}

You can use:
• /stop to pause Telegram notifications
• /start to resume notifications
          `);
        }
      } else if (message.text === '/stop') {
        // Disable Telegram notifications
        const { data: user, error } = await supabase
          .from('users')
          .select('id, notification_preferences')
          .eq('telegram_id', chatId.toString())
          .single();

        if (error || !user) {
          await sendTelegramMessage(chatId, `
❌ <b>Account Not Found</b>

Your Telegram account is not linked to any Vocabry account.
          `);
        } else {
          // Update preferences to disable Telegram
          const currentPrefs = user.notification_preferences || { email: true, telegram: true };
          const { error: updateError } = await supabase
            .from('users')
            .update({
              notification_preferences: {
                ...currentPrefs,
                telegram: false
              }
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating preferences:', updateError);
            await sendTelegramMessage(chatId, `
❌ <b>Error</b>

Could not update your notification settings. Please try again later.
            `);
          } else {
            await sendTelegramMessage(chatId, `
<b>🔕 Notifications Paused</b>

You will no longer receive vocabulary reminders via Telegram.
Use /start command to resume notifications anytime.
            `);
          }
        }
      } else if (message.text === '/help') {
        // Show help message
        await sendTelegramMessage(chatId, `
<b>📚 Vocabry Bot Commands</b>

/start - Connect account and enable notifications
/status - Check your notification settings
/stop - Pause Telegram notifications
/help - Show this help message

<b>About Vocabry</b>
Vocabry helps you remember new words through spaced repetition.
You'll receive reminders at scientifically optimized intervals:
• 1 hour after adding a word
• 3 hours later
• 8 hours later
• 1 day later
• 3 days later
• 7 days later
        `);
      }
    } else {
      // Reply to non-command messages
      await sendTelegramMessage(chatId, `
Welcome to Vocabry! I can help you review vocabulary words through scheduled notifications.

Use /help to see available commands.
      `);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for development and health checks
export async function GET(
  req: Request,
  { params }: { params: { secret: string } }
) {
  // Verify webhook secret even for GET requests
  const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET || params.secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  return NextResponse.json({ status: 'Telegram webhook is active' });
}

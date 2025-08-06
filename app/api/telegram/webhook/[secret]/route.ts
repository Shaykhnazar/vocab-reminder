// app/api/telegram/webhook/[secret]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getTranslations } from '@/lib/telegram-translations';

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
      language_code?: string;
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
    const { first_name, last_name, username, language_code } = message.from;

    // Get translations based on user's language (default to English if not available)
    const lang = language_code || 'en';
    const t = await getTranslations(lang);

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
                ❌ <b>${t.connectionFailed}</b>
                
                ${t.alreadyConnected}
              `);
              return NextResponse.json({ success: true });
            }

            // First get current user data
            const { data: currentUser, error: fetchError } = await supabase
              .from('users')
              .select('notification_preferences, username, first_name, last_name')
              .eq('id', userId)
              .single();

            if (fetchError) {
              console.error('Error fetching current user data:', fetchError);
              throw new Error('User not found');
            }

            // Prepare updated preferences
            const updatedPreferences = {
              ...(currentUser.notification_preferences || { email: true, telegram: false }),
              telegram: true
            };

            // Update user with Telegram information
            const { error: updateError } = await supabase
              .from('users')
              .update({
                telegram_id: chatId.toString(),
                username: username || currentUser.username,
                first_name: first_name || currentUser.first_name,
                last_name: last_name || currentUser.last_name,
                notification_preferences: updatedPreferences
              })
              .eq('id', userId);

            if (updateError) {
              console.error('Error linking Telegram account:', updateError);
              await sendTelegramMessage(chatId, `
                ❌ <b>${t.connectionFailed}</b>
                
                ${t.connectionProblem}
              `);
            } else {
              // Success
              await sendTelegramMessage(chatId, `
                <b>🎉 ${t.successfullyConnected}</b>
                
                ${t.accountLinked}
                
                <b>${t.commands}:</b>
                /status - ${t.checkNotifications}
                /stop - ${t.pauseNotifications}
                /start - ${t.resumeNotifications}
                /help - ${t.showCommands}
              `);
            }
          } catch (error) {
            console.error('Error in Telegram account linking:', error);
            await sendTelegramMessage(chatId, `
              ❌ <b>${t.connectionError}</b>
              
              ${t.technicalProblem}
            `);
          }
        } else {
          // Welcome message for users who start the bot without linking
          await sendTelegramMessage(chatId, `
            <b>👋 ${t.welcomeToVocabry}</b>
            
            ${t.botDescription}
            
            ${t.toConnectAccount}:
            1. ${t.goToProfile}
            2. ${t.openNotifications}
            3. ${t.clickConnect}
            
            ${t.needHelp}
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
            ❌ <b>${t.accountNotConnected}</b>
            
            ${t.telegramNotLinked}
          `);
        } else {
          const prefs = user.notification_preferences || { email: true, telegram: false };
          await sendTelegramMessage(chatId, `
            <b>📊 ${t.notificationStatus}</b>
            
            ${t.telegramNotifications}: ${prefs.telegram ? '✅ ' + t.enabled : '❌ ' + t.disabled}
            ${t.emailNotifications}: ${prefs.email ? '✅ ' + t.enabled : '❌ ' + t.disabled}
            
            ${t.youCanUse}:
            • /stop ${t.toPause}
            • /start ${t.toResume}
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
            ❌ <b>${t.accountNotFound}</b>
            
            ${t.telegramNotLinked}
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
              ❌ <b>${t.error}</b>
              
              ${t.couldNotUpdateSettings}
            `);
          } else {
            await sendTelegramMessage(chatId, `
              <b>🔕 ${t.notificationsPaused}</b>
              
              ${t.noLongerReceiveReminders}
              ${t.useStartToResume}
            `);
          }
        }
      } else if (message.text === '/help') {
        // Show help message
        await sendTelegramMessage(chatId, `
          <b>📚 ${t.vocabryBotCommands}</b>
          
          /start - ${t.connectAndEnable}
          /status - ${t.checkNotifications}
          /stop - ${t.pauseNotifications}
          /help - ${t.showHelp}
          
          <b>${t.aboutVocabry}</b>
          ${t.vocabryHelpsYou}
          ${t.youllReceiveReminders}:
          • ${t.oneHour}
          • ${t.threeHours}
          • ${t.eightHours}
          • ${t.oneDay}
          • ${t.threeDays}
          • ${t.sevenDays}
        `);
      }
    } else {
      // Reply to non-command messages
      await sendTelegramMessage(chatId, `
        ${t.welcomeMessage}
        
        ${t.useHelp}
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

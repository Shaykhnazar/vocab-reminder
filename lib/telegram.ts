// lib/telegram.ts
import { supabase } from './supabase';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

/**
 * Send a message to a user via Telegram
 */
export async function sendTelegramMessage(
  chatId: string,
  message: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data.description);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

/**
 * Format vocabulary review message for Telegram
 */
export function formatVocabularyReviewMessage(words: Array<{
  word: string;
  definition: string;
  context?: string | null;
}>): string {
  if (words.length === 0) {
    return 'No words to review.';
  }

  if (words.length === 1) {
    // Single word format
    const word = words[0];
    return `
<b>📚 Vocabulary Review</b>

<b>Word:</b> ${word.word}

<b>Definition:</b>
${word.definition}

${word.context ? `<b>Context:</b>\n${word.context}\n` : ''}

<a href="${APP_URL}/words">Review your vocabulary →</a>
`.trim();
  } else {
    // Multiple words format
    const wordsList = words.map(word =>
      `• <b>${word.word}</b> - ${word.definition}`
    ).join('\n\n');

    return `
<b>📚 Time to review your vocabulary!</b>

${wordsList}

<a href="${APP_URL}/words">View all words →</a>
`.trim();
  }
}

/**
 * Send a vocabulary review notification via Telegram
 */
export async function sendVocabularyReview(
  to: string,
  words: Array<{word: string; definition: string; context?: string | null}>
): Promise<boolean> {
  try {
    const message = formatVocabularyReviewMessage(words);
    return await sendTelegramMessage(to, message);
  } catch (error) {
    console.error('Error sending vocabulary review:', error);
    return false;
  }
}

/**
 * Check if a user has connected their Telegram account and enabled notifications
 */
export async function getUserTelegramStatus(userId: string): Promise<{
  connected: boolean;
  enabled: boolean;
  telegram_id?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('telegram_id, notification_preferences')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      connected: !!data?.telegram_id,
      enabled: data?.notification_preferences?.telegram || false,
      telegram_id: data?.telegram_id
    };
  } catch (error) {
    console.error('Error checking user Telegram status:', error);
    return { connected: false, enabled: false };
  }
}

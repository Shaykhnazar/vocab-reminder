// lib/notifications.ts
import nodemailer from 'nodemailer';
import {REVIEW_INTERVALS, supabase} from './supabase';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface NotificationQueueItem {
  userId: string;
  wordId: string;
  scheduledFor: Date;
  type: 'email' | 'telegram';
}

interface WordToReview {
  word: string;
  definition: string;
  context?: string | null;
}

/**
 * Add a notification to the queue.
 */
export async function addToNotificationQueue(notification: NotificationQueueItem) {
  try {
    const { error } = await supabase
      .from('notification_queue')
      .insert({
        user_id: notification.userId,
        word_id: notification.wordId,
        scheduled_for: notification.scheduledFor.toISOString(),
        type: notification.type
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error adding to notification queue:', error);
    throw error;
  }
}

/**
 * Fetch users with pending notifications in the last hour.
 */
export async function getUsersWithPendingNotifications() {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const { data: notifications, error } = await supabase
    .from('notification_queue')
    .select('user_id')
    .eq('status', 'pending')
    .lte('scheduled_for', now.toISOString())
    .gte('scheduled_for', hourAgo.toISOString());

  if (error) {
    console.error('Error fetching users with notifications:', error);
    throw error;
  }

  // Get unique user_ids
  return Array.from(
    new Set(notifications?.map(notification => notification.user_id))
  );
}

/**
 * Process notifications for a single user.
 */
export async function processUserNotifications(userId: string) {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Fetch pending notifications for this user
  const { data: notifications, error } = await supabase
    .from('notification_queue')
    .select(`
      *,
      words (*),
      users (*)
    `)
    .eq('status', 'pending')
    .eq('user_id', userId)
    .lte('scheduled_for', now.toISOString())
    .gte('scheduled_for', hourAgo.toISOString());

  if (error) {
    console.error('Error fetching notifications:', error);
    return;
  }

  if (!notifications?.length) return;

  const user = notifications[0].users;

  try {
    if (user.notification_preferences.email) {
      const wordsToReview = notifications.map(notification => ({
        word: notification.words.word,
        definition: notification.words.definition,
        context: notification.words.context
      }));

      await sendBatchedEmail({
        to: user.email,
        words: wordsToReview
      });
    }

    // Update all notifications and words in a transaction
    await supabase.rpc('update_notifications_and_words', {
      notification_ids: notifications.map((n) => n.id),
      word_ids: notifications.map((n) => n.words.id),
      next_review_dates: notifications.map((n) => {
        const nextStage = n.words.review_stage + 1;
        return new Date(Date.now() + REVIEW_INTERVALS[nextStage]).toISOString();
      }),
      now: now.toISOString(),
    });
  } catch (error) {
    console.error(`Error processing notifications for user ${user.email}:`, error);
    throw error;
  }
}

/**
 * Send a batched email with multiple words to review.
 */
async function sendBatchedEmail({ to, words }: { to: string; words: WordToReview[] }) {
  const subject = `Word Review Reminder - ${words.length} words to review`;
  const text = `
    Time to review your words:

    ${words
    .map(
      (item, index) =>
        `${index + 1}. ${item.word}\n   Definition: ${item.definition}${
          item.context ? `\n   Context: ${item.context}` : ''
        }`
    )
    .join('\n\n')}
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text
    });
  } catch (error) {
    console.error('Error sending batched email:', error);
    throw error;
  }
}

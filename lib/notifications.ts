// lib/notifications.ts
import { REVIEW_INTERVALS, supabase } from './supabase';
import { Client } from '@upstash/qstash';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

// Initialize QStash client
const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!
});

const emailQueue = qstashClient.queue({
  queueName: "email-sending"
});

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
  // const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const { data: notifications, error } = await supabase
    .from('notification_queue')
    .select('user_id')
    // .eq('status', 'pending')
    .lte('scheduled_for', now.toISOString())
    // .gte('scheduled_for', hourAgo.toISOString());

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

  console.log('Processing notifications for user:', userId);
  console.log('Time range:', { now: now.toISOString(), hourAgo: hourAgo.toISOString() });

  // Fetch pending notifications for this user
  const { data: notifications, error } = await supabase
    .from('notification_queue')
    .select(`
      *,
      words (*),
      users (*)
    `)
    // .eq('status', 'pending')
    .eq('user_id', userId)
    .lte('scheduled_for', now.toISOString())
    // .gte('scheduled_for', hourAgo.toISOString());

  console.log('Found notifications:', notifications?.length);

  if (error) {
    console.error('Error fetching notifications:', error);
    return;
  }

  if (!notifications?.length) {
    console.log('No notifications found for user');
    return;
  }

  const user = notifications[0].users;
  console.log('User preferences:', user.notification_preferences);

  try {
    if (user.notification_preferences.email) {
      const wordsToReview = notifications.map(notification => ({
        word: notification.words.word,
        definition: notification.words.definition,
        context: notification.words.context
      }));

      console.log('Preparing to send email for words:', wordsToReview);
      // Queue email sending instead of sending directly
      await emailQueue.enqueueJSON({
        url: `https://vocab-reminder.vercel.app/api/notifications/send-email`,
        body: {
          to: user.email,
          words: wordsToReview
        },
        retries: 3,
      });
    } else {
      console.log('User has email notifications disabled');
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
export async function sendBatchedEmail({ to, words }: { to: string; words: WordToReview[] }) {
  console.log('Attempting to send email to:', to);
  console.log('Words to review:', words);

  const subject = `Word Review Reminder - ${words.length} words to review`;
  const text = `
    Time to review your words:

    ${words.map((item, index) => `${index + 1}. ${item.word}
     Definition: ${item.definition}${item.context ? `\n   Context: ${item.context}` : ''}`).join('\n\n')}
  `;

  try {
    await  resend.emails.send({
      from: 'Vocab Reminder <onboarding@resend.dev>',
      to,
      subject,
      text
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending batched email:', error);
    throw error;
  }
}

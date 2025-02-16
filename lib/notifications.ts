// lib/notifications.ts
import { REVIEW_INTERVALS, supabase } from './supabase';
import { Client } from '@upstash/qstash';
import { Resend } from 'resend';
import { getWordReviewTemplate } from './email-templates/word-review';

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
 * Add notifications for all review stages when a word is added
 */
export async function addToNotificationQueue(notification: NotificationQueueItem) {
  try {
    // Create a single notification for the current review stage
    const notificationData = {
      user_id: notification.userId,
      word_id: notification.wordId,
      scheduled_for: notification.scheduledFor.toISOString(),
      type: notification.type,
      status: 'scheduled'
    };

    const { error } = await supabase
      .from('notification_queue')
      .insert(notificationData);

    if (error) throw error;

    return { success: true };
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
    .eq('status', 'scheduled')
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
    .eq('status', 'scheduled')
    .eq('user_id', userId)
    .lte('scheduled_for', now.toISOString())
    .gte('scheduled_for', hourAgo.toISOString());

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

      // First update status to 'processing' to prevent duplicate processing
      await supabase
        .from('notification_queue')
        .update({ status: 'processing' })
        .in('id', notifications.map(n => n.id));

      // Queue email sending instead of sending directly
      await emailQueue.enqueueJSON({
        url: `https://www.vocabry.com/api/notifications/send-email`,
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
    const nextReviewDates = notifications.map((n) => {
      const currentStage = n.words.review_stage || 0;

      // Don't increment if already at max stage
      if (currentStage >= 5) {  // Changed from 4 to 5
        return null; // Word is mastered
      }

      const nextStage = currentStage + 1;
      const interval = REVIEW_INTERVALS[nextStage];

      // console.log('Calculating next review:', {
      //   wordId: n.words.id,
      //   word: n.words.word,
      //   currentStage,
      //   nextStage,
      //   interval,
      //   nextReview: new Date(Date.now() + interval).toISOString()
      // });

      return new Date(Date.now() + interval).toISOString();
    });

    await supabase.rpc('update_notifications_and_words', {
      notification_ids: notifications.map((n) => n.id),
      word_ids: notifications.map((n) => n.words.id),
      next_review_dates: nextReviewDates,
      now: now.toISOString()
    });
  } catch (error) {
    // If there's an error, revert notifications back to pending
    await supabase
      .from('notification_queue')
      .update({ status: 'scheduled' })
      .in('id', notifications.map(n => n.id));

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

  const { subject, html, text } = getWordReviewTemplate(words);


  try {
    await  resend.emails.send({
      from: 'Vocabry <no-reply@vocabry.com>',
      to,
      subject,
      html,
      text
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending batched email:', error);
    throw error;
  }
}

// lib/notifications.ts
import nodemailer from 'nodemailer';
import { REVIEW_INTERVALS, supabase, User, Word } from './supabase';

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

interface NotificationQueue {
  id: string;
  user_id: string;
  word_id: string;
  status: 'pending' | 'sent';
  scheduled_for: string;
  sent_at?: string;
  users: User;
  words: Word;
}

interface UserNotifications {
  user: User;
  notifications: NotificationQueue[];
}

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


export async function processNotificationQueue() {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Fetch pending notifications
  const { data: notifications, error } = await supabase
    .from('notification_queue')
    .select(`
      *,
      words (*),
      users (*)
    `)
    .eq('status', 'pending')
    .lte('scheduled_for', now.toISOString())
    .gte('scheduled_for', hourAgo.toISOString());

  if (error) {
    console.error('Error fetching notifications:', error);
    return;
  }

  // Group notifications by user
  const notificationsByUser = (notifications as NotificationQueue[]).reduce<Record<string, UserNotifications>>((acc, notification) => {
    const userId = notification.users.email;
    if (!acc[userId]) {
      acc[userId] = {
        user: notification.users,
        notifications: []
      };
    }
    acc[userId].notifications.push(notification);
    return acc;
  }, {});

  // Process notifications for each user
  await Promise.all(
    Object.values(notificationsByUser).map(async (userNotification: UserNotifications) => {
      const { user, notifications } = userNotification;
      try {
      if (user.notification_preferences.email) {
        // Create batched email content
        const wordsToReview = notifications.map(notification => ({
          word: notification.words.word,
          definition: notification.words.definition
        }));

        await sendBatchedEmail({
          to: user.email,
          words: wordsToReview
        });
      }

      // Update all notifications and words
      await Promise.all(notifications.map(async (notification) => {
        // Mark notification as sent
        await supabase
          .from('notification_queue')
          .update({ status: 'sent', sent_at: now.toISOString() })
          .eq('id', notification.id);

        // Update word's review stage if not mastered
        if (notification.words.review_stage < 5) {
          const nextStage = notification.words.review_stage + 1;
          const nextReviewAt = new Date(Date.now() + REVIEW_INTERVALS[nextStage]);

          await supabase
            .from('words')
            .update({
              review_stage: nextStage,
              next_review_at: nextReviewAt.toISOString(),
              mastered: nextStage === 5
            })
            .eq('id', notification.words.id);

          if (nextStage < 5) {
            await addToNotificationQueue({
              userId: notification.user_id,
              wordId: notification.word_id,
              scheduledFor: nextReviewAt,
              type: 'email'
            });
          }
        }
      }));
    } catch (error) {
      console.error(`Error processing notifications for user ${user.email}:`, error);
    }
  }));
}

interface WordToReview {
  word: string;
  definition: string;
  context?: string | null;
}

async function sendBatchedEmail({ to, words }: { to: string; words: WordToReview[] }) {
  const subject = `Word Review Reminder - ${words.length} words to review`;
  const text = `
    Time to review your words:
    
  ${words.map((item, index) => `${index + 1}. ${item.word}
     Definition: ${item.definition}`).join('\n\n')}
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

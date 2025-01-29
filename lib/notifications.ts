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

  // Fetch pending notifications
  const { data: notifications, error } = await supabase
    .from('notification_queue')
    .select(`
      *,
      words (*),
      users (*)
    `)
    .eq('status', 'pending')
    .lte('scheduled_for', now.toISOString());

  if (error) {
    console.error('Error fetching notifications:', error);
    return;
  }

  for (const notification of notifications) {
    try {
      if (notification.type === 'email' && notification.users.notification_preferences.email) {
        await sendEmail({
          to: notification.users.email,
          subject: 'Word Review Reminder',
          text: `Time to review the word: ${notification.words.word}\nDefinition: ${notification.words.definition}`
        });
      }

      // Mark notification as sent
      await supabase
        .from('notification_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
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
    } catch (error) {
      console.error(`Error processing notification ${notification.id}:`, error);
    }
  }
}

async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

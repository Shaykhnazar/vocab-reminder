// lib/email.ts
import { getVerificationEmailTemplate } from './email-templates/verification-email';
import {getPasswordResetTemplate} from "@/lib/email-templates/password-reset";

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const { subject, html, text } = getVerificationEmailTemplate({ verificationUrl });

  const response = await fetch('/api/email/send-verification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: email,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const { subject, html, text } = getPasswordResetTemplate({ resetUrl });

  const response = await fetch('/api/email/send-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: email,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error('Failed to send password reset email');
  }
}

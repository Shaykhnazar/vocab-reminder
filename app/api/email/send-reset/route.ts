// app/api/email/send-reset/route.ts
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, html, text } = await request.json();

    await resend.emails.send({
      from: 'Vocabry <no-reply@vocabry.com>',
      to,
      subject,
      html,
      text,
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending reset password email:', error);
    return NextResponse.json(
      { error: 'Failed to send reset password email' },
      { status: 500 }
    );
  }
}

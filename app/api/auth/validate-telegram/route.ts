// app/api/auth/validate-telegram/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebAppDataServer } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json(
        { error: 'Missing initData' },
        { status: 400 }
      );
    }

    // Server-side validation with access to TELEGRAM_BOT_TOKEN
    const isValid = await validateTelegramWebAppDataServer(initData);

    return NextResponse.json({ 
      valid: isValid,
      message: isValid ? 'Valid Telegram data' : 'Invalid Telegram data'
    });

  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return NextResponse.json(
      { error: 'Validation failed', valid: false },
      { status: 500 }
    );
  }
}
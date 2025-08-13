// app/api/auth/validate-telegram/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebAppDataServer } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    console.log('🔍 Validate Telegram API called');
    console.log('📝 InitData received (first 100 chars):', initData?.substring(0, 100));
    console.log('🔑 TELEGRAM_BOT_TOKEN available:', !!process.env.TELEGRAM_BOT_TOKEN);

    if (!initData) {
      console.log('❌ Missing initData in request');
      return NextResponse.json(
        { error: 'Missing initData', valid: false },
        { status: 400 }
      );
    }

    // Parse initData to check basic structure
    try {
      const params = new URLSearchParams(initData);
      const user = params.get('user');
      const hash = params.get('hash');
      const authDate = params.get('auth_date');
      
      console.log('📊 InitData structure:', {
        hasUser: !!user,
        hasHash: !!hash,
        hasAuthDate: !!authDate,
        userPreview: user?.substring(0, 50)
      });
    } catch (e) {
      console.log('❌ Failed to parse initData as URLSearchParams:', e);
    }

    // Server-side validation with access to TELEGRAM_BOT_TOKEN
    const isValid = await validateTelegramWebAppDataServer(initData);

    console.log('✅ Validation result:', isValid);

    return NextResponse.json({ 
      valid: isValid,
      message: isValid ? 'Valid Telegram data' : 'Invalid Telegram data',
      debugInfo: {
        hasBotToken: !!process.env.TELEGRAM_BOT_TOKEN,
        initDataLength: initData.length,
        environment: process.env.NODE_ENV
      }
    });

  } catch (error: any) {
    console.error('❌ Error in validate-telegram API:', error);
    return NextResponse.json(
      { error: 'Validation failed', valid: false, message: error.message },
      { status: 500 }
    );
  }
}

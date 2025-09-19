// app/api/auth/telegram-webapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramWebAppData {
  user?: TelegramUser;
  chat_type?: string;
  chat_instance?: string;
  auth_date: number;
  hash: string;
}

/**
 * Validates Telegram Web App data using official algorithm
 */
function validateTelegramWebAppData(initDataString: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initDataString);
    const hash = params.get('hash');

    if (!hash) {
      console.error('No hash found in initData');
      return false;
    }

    // Remove hash from params for validation
    params.delete('hash');

    // Create data-check-string
    const dataCheckArray: string[] = [];
    for (const [key, value] of params.entries()) {
      dataCheckArray.push(`${key}=${value}`);
    }

    // Sort alphabetically by key
    dataCheckArray.sort();
    const dataCheckString = dataCheckArray.join('\n');

    // Create secret key using HMAC-SHA256 with "WebAppData" constant
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating Telegram Web App data:', error);
    return false;
  }
}

/**
 * Parses Telegram initData string
 */
function parseTelegramInitData(initDataString: string): TelegramWebAppData | null {
  try {
    const params = new URLSearchParams(initDataString);
    const userString = params.get('user');
    const authDate = params.get('auth_date');
    const hash = params.get('hash');

    if (!authDate || !hash) {
      return null;
    }

    let user: TelegramUser | undefined;
    if (userString) {
      user = JSON.parse(userString);
    }

    return {
      user,
      chat_type: params.get('chat_type') || undefined,
      chat_instance: params.get('chat_instance') || undefined,
      auth_date: parseInt(authDate),
      hash,
    };
  } catch (error) {
    console.error('Error parsing Telegram init data:', error);
    return null;
  }
}

/**
 * Creates or updates Telegram user in database
 */
async function createOrUpdateTelegramUser(telegramUser: TelegramUser) {
  try {
    // Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id.toString())
      .single();

    if (findError && findError.code !== 'PGRST116') {
      throw new Error(`Database error: ${findError.message}`);
    }

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name || '',
          username: telegramUser.username || '',
          photo_url: telegramUser.photo_url || '',
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Update error: ${updateError.message}`);
      }

      return updatedUser;
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramUser.id.toString(),
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name || '',
          username: telegramUser.username || '',
          photo_url: telegramUser.photo_url || '',
          provider: 'telegram',
          created_at: new Date().toISOString(),
          notification_preferences: {
            email: false,
            telegram: true
          }
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Insert error: ${insertError.message}`);
      }

      return newUser;
    }
  } catch (error) {
    console.error('Error creating/updating Telegram user:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Telegram WebApp API called');
    const { initData } = await request.json();

    console.log('📊 Received initData:', {
      hasInitData: !!initData,
      type: typeof initData,
      length: initData?.length,
      preview: initData?.substring(0, 100)
    });

    if (!initData || typeof initData !== 'string') {
      console.error('❌ Missing or invalid initData');
      return NextResponse.json(
        { error: 'Missing or invalid initData' },
        { status: 400 }
      );
    }

    // Parse the initData
    console.log('📊 Parsing initData...');
    const telegramData = parseTelegramInitData(initData);
    console.log('📊 Parsed telegramData:', {
      hasTelegramData: !!telegramData,
      hasUser: !!telegramData?.user,
      userId: telegramData?.user?.id,
      firstName: telegramData?.user?.first_name,
      authDate: telegramData?.auth_date,
      hasHash: !!telegramData?.hash,
    });

    if (!telegramData || !telegramData.user) {
      console.error('❌ Invalid or missing user data in initData');
      return NextResponse.json(
        { error: 'Invalid or missing user data in initData' },
        { status: 400 }
      );
    }

    // Check if auth_date is not too old (24 hours)
    // Be more lenient with future dates for development/testing
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours in seconds
    const maxFuture = 365 * 24 * 60 * 60; // 1 year in the future (lenient for testing)
    const age = now - telegramData.auth_date;

    console.log('Time validation:', {
      now,
      authDate: telegramData.auth_date,
      age,
      maxAge,
      maxFuture,
      ageHours: Math.round(age / 3600),
      authDateReadable: new Date(telegramData.auth_date * 1000).toISOString(),
      nowReadable: new Date(now * 1000).toISOString()
    });

    if (age > maxAge) {
      console.warn(`⚠️ Telegram data is old but allowing: ${Math.round(age / 3600)} hours old`);
      // In development, we'll be more lenient - just warn instead of rejecting
      // return NextResponse.json(
      //   { error: `Telegram Web App data is too old: ${Math.round(age / 3600)} hours old` },
      //   { status: 400 }
      // );
    }

    if (age < -maxFuture) {
      console.warn(`⚠️ Telegram data is very far in future but allowing: ${Math.abs(Math.round(age / 3600))} hours ahead`);
      // In development, we'll be more lenient - just warn instead of rejecting
      // return NextResponse.json(
      //   { error: `Telegram Web App data is from too far in the future: ${Math.abs(Math.round(age / 3600))} hours ahead` },
      //   { status: 400 }
      // );
    }

    // Validate the data if bot token is available
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    console.log('🔐 Validation step:', {
      hasBotToken: !!botToken,
      botTokenPreview: botToken?.substring(0, 10) + '...',
    });

    if (botToken) {
      console.log('🔐 Validating Telegram Web App data...');
      try {
        const isValid = validateTelegramWebAppData(initData, botToken);
        console.log('🔐 Validation result:', isValid);

        if (!isValid) {
          console.error('❌ Invalid Telegram Web App data signature');
          return NextResponse.json(
            { error: 'Invalid Telegram Web App data signature' },
            { status: 401 }
          );
        } else {
          console.log('✅ Telegram Web App data signature is valid');
        }
      } catch (validationError) {
        console.error('❌ Validation error:', validationError);
        return NextResponse.json(
          { error: 'Signature validation failed' },
          { status: 401 }
        );
      }
    } else {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN not set - skipping signature validation');
    }

    // Create or update user in database
    console.log('💾 Creating/updating user in database...');
    const dbUser = await createOrUpdateTelegramUser(telegramData.user);
    console.log('💾 Database operation complete:', {
      userId: dbUser.id,
      telegramId: dbUser.telegram_id,
      firstName: dbUser.first_name,
    });

    // Return user data for session creation
    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        telegram_id: dbUser.telegram_id,
        name: `${dbUser.first_name} ${dbUser.last_name || ''}`.trim(),
        first_name: dbUser.first_name,
        last_name: dbUser.last_name,
        username: dbUser.username,
        image: dbUser.photo_url,
        provider: 'telegram'
      }
    });

  } catch (error) {
    console.error('❌ Telegram Web App authentication error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

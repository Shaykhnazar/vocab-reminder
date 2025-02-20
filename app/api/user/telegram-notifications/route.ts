// app/api/user/telegram-notifications/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Build query based on available identifiers
    let query = supabase
      .from('users')
      .select('telegram_id, notification_preferences');

    if (session.user.email) {
      query = query.eq('email', session.user.email);
    } else if (session.user.telegram_id) {
      query = query.eq('telegram_id', session.user.telegram_id);
    } else if (session.user.id) {
      query = query.eq('id', session.user.id);
    } else {
      return NextResponse.json({ error: 'No valid identifier found' }, { status: 400 });
    }

    const { data, error } = await query.single();

    if (error) throw error;

    return NextResponse.json({
      connected: !!data.telegram_id,
      enabled: data.notification_preferences?.telegram || false
    });
  } catch (error) {
    console.error('Error fetching Telegram notification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Telegram notification status' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. "enabled" must be a boolean' },
        { status: 400 }
      );
    }

    // Build query to get current user data
    let query = supabase
      .from('users')
      .select('id, notification_preferences, telegram_id');

    if (session.user.email) {
      query = query.eq('email', session.user.email);
    } else if (session.user.telegram_id) {
      query = query.eq('telegram_id', session.user.telegram_id);
    } else if (session.user.id) {
      query = query.eq('id', session.user.id);
    } else {
      return NextResponse.json({ error: 'No valid identifier found' }, { status: 400 });
    }

    const { data: user, error: fetchError } = await query.single();

    if (fetchError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify Telegram is connected if enabling notifications
    if (enabled && !user.telegram_id) {
      return NextResponse.json({
        error: 'Cannot enable Telegram notifications: Telegram account not connected'
      }, { status: 400 });
    }

    // Update notification preferences
    const currentPreferences = user.notification_preferences || { email: true, telegram: false };
    const updatedPreferences = {
      ...currentPreferences,
      telegram: enabled
    };

    const { error: updateError } = await supabase
      .from('users')
      .update({ notification_preferences: updatedPreferences })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: `Telegram notifications ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Error updating Telegram notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update Telegram notification settings' },
      { status: 500 }
    );
  }
}

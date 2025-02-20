// app/api/user/notifications/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { notification_preferences } = await request.json();

    // Build query based on available identifiers
    let query = supabase.from('users').update({ notification_preferences });

    if (session.user.email) {
      query = query.eq('email', session.user.email);
    } else if (session.user.telegram_id) {
      query = query.eq('telegram_id', session.user.telegram_id);
    } else if (session.user.id) {
      query = query.eq('id', session.user.id);
    } else {
      return NextResponse.json({ error: 'No valid identifier found' }, { status: 400 });
    }

    const { error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Notification preferences update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error updating notification preferences'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Build query based on available identifiers
    let query = supabase
      .from('users')
      .select('notification_preferences');

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

    return NextResponse.json(data.notification_preferences || { email: true, telegram: false });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({
      error: 'Failed to fetch notification preferences'
    }, { status: 500 });
  }
}

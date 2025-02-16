// app/api/user/profile/route.ts
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

    let query = supabase
      .from('users')
      .select('first_name, last_name, username, email, telegram_id, photo_url, notification_preferences');

    // If user has email, query by email, otherwise query by telegram_id
    if (session.user.email) {
      query = query.eq('email', session.user.email);
    } else if (session.user.telegram_id) {
      query = query.eq('telegram_id', session.user.telegram_id);
    } else {
      return NextResponse.json({ error: 'No identifier found' }, { status: 400 });
    }

    const { data: userData, error } = await query.single();

    if (error) throw error;

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();

    let query = supabase
      .from('users')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        telegram_id: data.telegram_id,
        // Add email if provided
        ...(data.email && { email: data.email })
      });

    // Use appropriate identifier for the update
    if (session.user.email) {
      query = query.eq('email', session.user.email);
    } else if (session.user.telegram_id) {
      query = query.eq('telegram_id', session.user.telegram_id);
    } else {
      return NextResponse.json({ error: 'No identifier found' }, { status: 400 });
    }

    const { error } = await query;

    if (error) throw error;

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
  }
}

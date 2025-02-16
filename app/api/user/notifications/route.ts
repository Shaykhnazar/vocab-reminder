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

    const { error } = await supabase
      .from('users')
      .update({ notification_preferences })
      .eq('email', session.user.email);

    if (error) throw error;

    return NextResponse.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Notification preferences update error:', error);
    return NextResponse.json({ error: 'Error updating notification preferences' }, { status: 500 });
  }
}

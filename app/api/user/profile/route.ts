// app/api/user/profile/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { generateVerificationToken, hashToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";

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
    let verificationRequired = false;

    // Get current user data
    let query = supabase.from('users').select('*');
    if (session.user.email) {
      query = query.eq('email', session.user.email);
    } else if (session.user.telegram_id) {
      query = query.eq('telegram_id', session.user.telegram_id);
    }

    const { data: currentUser, error: fetchError } = await query.single();
    if (fetchError) throw fetchError;

    // Check if email is being changed
    if (data.email && data.email !== currentUser.email) {
      // Check if email already exists
      const { data: existingUser, error: emailCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'This email is already registered. Please use a different email.' },
          { status: 400 }
        );
      }

      // Generate verification token
      const verificationToken = generateVerificationToken();
      const hashedToken = hashToken(verificationToken);
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Update user with new email (unverified) and verification token
      data.email_verified = false;
      data.verification_token = hashedToken;
      data.verification_token_expires = tokenExpiry;
      verificationRequired = true;

      // Send verification email
      await sendVerificationEmail(data.email, verificationToken);
    }

    // Update user data
    let updateQuery = supabase.from('users').update({
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      ...(data.email && {
        email: data.email,
        email_verified: data.email_verified,
        verification_token: data.verification_token,
        verification_token_expires: data.verification_token_expires,
      }),
    });

    // Use appropriate identifier for the update
    if (session.user.email) {
      updateQuery = updateQuery.eq('email', session.user.email);
    } else if (session.user.telegram_id) {
      updateQuery = updateQuery.eq('telegram_id', session.user.telegram_id);
    }

    const { error } = await updateQuery;
    if (error) throw error;

    return NextResponse.json({
      message: 'Profile updated successfully',
      verificationRequired
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
  }
}

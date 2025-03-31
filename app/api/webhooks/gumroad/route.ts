// app/api/webhooks/gumroad/route.ts
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.formData();

  // Verify the webhook is from Gumroad
  const sellerID = data.get('seller_id');
  if (sellerID !== process.env.NEXT_PUBLIC_GUMROAD_SELLER_ID) {
    console.error('Invalid seller ID');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Extract information from the webhook
    const productID = data.get('product_id') as string;
    const email = data.get('email') as string;
    const saleID = data.get('sale_id') as string;
    const purchaseTimestamp = data.get('purchase_timestamp') as string;
    const productPermalink = data.get('product_permalink') as string;

    // Determine subscription type
    let subscriptionType = '';
    let expiresAt = null;

    if (productID === process.env.NEXT_PUBLIC_GUMROAD_MONTHLY_PRODUCT_ID) {
      subscriptionType = 'monthly';
      // Set expiration to 31 days from now
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 31);
    } else if (productID === process.env.NEXT_PUBLIC_GUMROAD_YEARLY_PRODUCT_ID) {
      subscriptionType = 'yearly';
      // Set expiration to 366 days from now (accounting for leap years)
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 366);
    } else if (productID === process.env.NEXT_PUBLIC_GUMROAD_LIFETIME_PRODUCT_ID) {
      subscriptionType = 'lifetime';
      // Lifetime subscription doesn't expire
      expiresAt = new Date('2099-12-31');
    } else {
      return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
    }

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error('User not found:', email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update or create subscription record
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userData.id,
        product_id: productID,
        subscription_type: subscriptionType,
        purchase_id: saleID,
        purchase_date: new Date(purchaseTimestamp).toISOString(),
        expires_at: expiresAt?.toISOString(),
        is_active: true,
        product_permalink: productPermalink
      })
      .select();

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Update user's premium status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_status: subscriptionType,
        is_premium: true
      })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

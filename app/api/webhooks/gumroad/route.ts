// app/api/webhooks/gumroad/route.ts
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('Received Gumroad webhook');

  // Try to parse content in different formats since Gumroad can send different types
  let data;
  let isJson = false;

  try {
    // First try to parse as JSON
    if (request.headers.get('content-type')?.includes('application/json')) {
      data = await request.json();
      isJson = true;
      console.log('Received JSON webhook data:', JSON.stringify(data));
    } else {
      // Then try to parse as form data
      data = await request.formData();
      console.log('Received form data webhook:', Object.fromEntries(data.entries()));
    }
  } catch (error) {
    console.error('Error parsing webhook data:', error);
    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
  }

  // Extract data differently based on format
  const getField = (fieldName: string): string | null => {
    if (isJson) {
      // For JSON data
      return data[fieldName] || null;
    } else {
      // For form data
      return data.get(fieldName) as string || null;
    }
  };

  // Extract common fields
  const sellerID = getField('seller_id');
  const resource = getField('resource'); // 'sale' or 'subscription'
  const resourceName = getField('resource_name'); // e.g., 'sale', 'refund', 'subscription'
  const productID = getField('product_id');
  const email = getField('email');
  const purchaseID = getField('sale_id') || getField('subscription_id');
  const purchaseTimestamp = getField('purchase_timestamp') || new Date().toISOString();
  const productPermalink = getField('product_permalink');
  const isFree = getField('is_free_trial') === 'true' || getField('price') === '0';
  const trialDays = parseInt(getField('free_trial_duration') || '0', 10);

  // Log key data for debugging
  console.log({
    event: resourceName,
    productID,
    email,
    purchaseID,
    isFree,
    trialDays
  });

  // Verify the webhook is from Gumroad - make this check optional in dev
  if (process.env.NODE_ENV === 'production' && sellerID !== process.env.NEXT_PUBLIC_GUMROAD_SELLER_ID) {
    console.error('Invalid seller ID:', sellerID);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Skip processing if email is missing - required for user lookup
  if (!email) {
    console.error('Email is missing from webhook data');
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    // Determine subscription type
    let subscriptionType = '';
    let expiresAt = null;
    let isTrial = isFree;

    // Determine subscription type by product ID
    if (productID === process.env.NEXT_PUBLIC_GUMROAD_MONTHLY_PRODUCT_ID) {
      subscriptionType = 'monthly';

      if (isTrial) {
        // If it's a free trial, set expiration based on trial days
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (trialDays || 30)); // Default to 30 days if not specified
      } else {
        // Regular monthly subscription
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 31);
      }
    } else if (productID === process.env.NEXT_PUBLIC_GUMROAD_YEARLY_PRODUCT_ID) {
      subscriptionType = 'yearly';

      if (isTrial) {
        // Trial for yearly subscription
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (trialDays || 30));
      } else {
        // Regular yearly subscription
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 366);
      }
    } else if (productID === process.env.NEXT_PUBLIC_GUMROAD_LIFETIME_PRODUCT_ID) {
      subscriptionType = 'lifetime';
      // Lifetime subscription doesn't expire (or far future date)
      expiresAt = new Date('2099-12-31');
    } else {
      console.error('Unknown product ID:', productID);
      return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
    }

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error('User not found for email:', email, userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user:', userData.id, 'with subscription type:', subscriptionType);

    // Create subscription record with trial info
    const subscriptionRecord = {
      user_id: userData.id,
      product_id: productID,
      subscription_type: subscriptionType,
      purchase_id: purchaseID,
      purchase_date: new Date(purchaseTimestamp).toISOString(),
      expires_at: expiresAt?.toISOString(),
      is_active: true,
      product_permalink: productPermalink,
      is_trial: isTrial,
      trial_days: isTrial ? (trialDays || 30) : 0
    };

    console.log('Creating subscription record:', subscriptionRecord);

    // Update or create subscription record
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionRecord)
      .select();

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
      return NextResponse.json({ error: 'Database error: ' + subscriptionError.message }, { status: 500 });
    }

    console.log('Subscription created successfully:', subscriptionData);

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
      return NextResponse.json({ error: 'Database error: ' + updateError.message }, { status: 500 });
    }

    console.log('User premium status updated successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}

// Add a GET handler for testing the webhook endpoint
export async function GET() {
  return NextResponse.json({ status: 'Gumroad webhook endpoint is active' });
}

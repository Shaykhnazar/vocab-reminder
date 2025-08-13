// app/api/auth/debug-telegram/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    console.log('🔍 DEBUG: Full validation process');
    
    if (!initData) {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }

    // Parse the initData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    const authDateStr = params.get('auth_date');
    const user = params.get('user');
    
    // Time validation
    const now = Math.floor(Date.now() / 1000);
    const authTimestamp = parseInt(authDateStr || '0');
    const age = now - authTimestamp;
    const maxAge = 24 * 60 * 60;
    const futureTolerance = 5 * 60;
    
    // Check if we have bot token
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    // Create data check string (same logic as validation)
    const dataCheckArray: string[] = [];
    for (const [key, value] of params.entries()) {
      if (key !== 'hash') {
        dataCheckArray.push(`${key}=${value}`);
      }
    }
    dataCheckArray.sort();
    const dataCheckString = dataCheckArray.join('\n');
    
    // Calculate hash if we have bot token
    let calculatedHash = 'N/A';
    if (botToken) {
      const crypto = require('crypto');
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
      
      calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
    }

    return NextResponse.json({
      debug: {
        // Basic structure
        hasHash: !!hash,
        hasAuthDate: !!authDateStr,
        hasUser: !!user,
        hasBotToken: !!botToken,
        
        // Time analysis
        currentTimestamp: now,
        authTimestamp: authTimestamp,
        age: age,
        ageHours: Math.round(age / 3600),
        isFuture: age < -futureTolerance,
        isTooOld: age > maxAge,
        timeValid: age >= -futureTolerance && age <= maxAge,
        
        // Hash analysis
        receivedHash: hash,
        calculatedHash: calculatedHash,
        hashMatch: hash === calculatedHash,
        
        // Data structure
        dataCheckString: dataCheckString,
        allParams: Object.fromEntries(params.entries()),
        
        // User data preview
        userPreview: user ? user.substring(0, 100) : null,
        
        // Environment
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Debug failed', message: error.message },
      { status: 500 }
    );
  }
}
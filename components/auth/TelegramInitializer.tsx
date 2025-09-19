"use client"

import { useEffect } from 'react';
import { initializeTelegramData } from '@/lib/telegram-webapp-auth-simple';

/**
 * Component to initialize Telegram data extraction on app startup
 * Should be placed in the root layout to run as early as possible
 */
export function TelegramInitializer() {
  useEffect(() => {
    // Run initialization as soon as the component mounts
    console.log('🚀 TelegramInitializer: Starting initialization...');
    initializeTelegramData();
  }, []);

  // This component doesn't render anything
  return null;
}
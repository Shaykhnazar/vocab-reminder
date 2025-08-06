// components/debug/TelegramDebugInfo.tsx
"use client"

import { useEffect, useState } from 'react';
import { useTelegramWebApp } from '@/lib/telegram-webapp';

export default function TelegramDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { isTelegramWebApp, initData, isValid, user } = useTelegramWebApp();

  useEffect(() => {
    // Only run once to prevent infinite loops
    if (typeof window !== 'undefined') {
      const info = {
        // Basic environment
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        search: window.location.search,
        hash: window.location.hash,
        
        // Telegram objects
        hasTelegramWindow: typeof window.Telegram !== 'undefined',
        hasTelegramWebApp: typeof window.Telegram?.WebApp !== 'undefined',
        telegramWebAppData: window.Telegram?.WebApp ? {
          version: window.Telegram.WebApp.version,
          platform: window.Telegram.WebApp.platform,
          initData: window.Telegram.WebApp.initData,
          initDataUnsafe: window.Telegram.WebApp.initDataUnsafe,
        } : null,
        
        // Our detection results
        detectedAsTWA: isTelegramWebApp,
        hasInitData: !!initData,
        isValid: isValid,
        hasUser: !!user,
        userData: user,
        
        // URL analysis
        searchParams: new URLSearchParams(window.location.search).toString(),
        searchParamsObj: Object.fromEntries(new URLSearchParams(window.location.search)),
        hashParams: Object.fromEntries(new URLSearchParams(window.location.hash.substring(1))),
        
        // Common Telegram params
        hasTgWebAppData: window.location.search.includes('tgWebAppData') || window.location.hash.includes('tgWebAppData'),
        hasTgWebAppVersion: window.location.search.includes('tgWebAppVersion') || window.location.hash.includes('tgWebAppVersion'),
      };
      
      setDebugInfo(info);
      console.log('Telegram Debug Info:', info);
    }
  }, []); // Empty dependency array - only run once on mount

  // Only show in development or when there are issues
  if (process.env.NODE_ENV === 'production' && isTelegramWebApp) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-100 border-b border-yellow-300 p-2 text-xs">
      <details>
        <summary className="cursor-pointer font-bold">
          Telegram Debug Info (Click to expand)
        </summary>
        <div className="mt-2 max-h-40 overflow-auto">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}
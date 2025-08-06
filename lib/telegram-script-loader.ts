// lib/telegram-script-loader.ts
"use client"

/**
 * Platform detection utilities
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isTelegramEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check various indicators of Telegram environment
  const indicators = [
    // URL-based detection
    window.location.hash.includes('tgWebAppData'),
    window.location.search.includes('tgWebAppData'),
    
    // User agent detection
    navigator.userAgent.includes('Telegram'),
    
    // Frame detection
    window.parent !== window,
    
    // Telegram WebApp object
    !!(window as any).Telegram?.WebApp,
    
    // Check if @telegram-apps/sdk detects Telegram environment
    (() => {
      try {
        // Import the SDK function directly since we already have it imported in the calling file
        // This is a browser environment, so we need to handle it differently
        if (typeof window !== 'undefined') {
          // Try to use the global reference if available
          const retrieveLaunchParams = (window as any).__retrieveLaunchParams;
          if (retrieveLaunchParams) {
            const launchParams = retrieveLaunchParams();
            return !!(launchParams?.tgWebAppData || launchParams?.tgWebAppVersion);
          }
          
          // Fallback: Check if we can detect SDK data another way
          // This is a workaround since we can't easily import in this function context
          return false;
        }
        return false;
      } catch {
        return false;
      }
    })()
  ];
  
  const detected = indicators.some(indicator => indicator);
  console.log('isTelegramEnvironment: Detection indicators:', {
    urlHash: window.location.hash.includes('tgWebAppData'),
    urlSearch: window.location.search.includes('tgWebAppData'),
    userAgent: navigator.userAgent.includes('Telegram'),
    frameDetection: window.parent !== window,
    telegramObject: !!(window as any).Telegram?.WebApp,
    sdkDetection: (() => {
      try {
        const { retrieveLaunchParams } = require('@telegram-apps/sdk');
        const launchParams = retrieveLaunchParams();
        return !!(launchParams?.tgWebAppData || launchParams?.tgWebAppVersion);
      } catch {
        return false;
      }
    })(),
    finalResult: detected
  });
  
  return detected;
};

/**
 * Setup iOS-optimized viewport
 */
export const setupIOSViewport = (): void => {
  if (!isIOS()) return;

  // Remove existing viewport meta
  const existingMeta = document.querySelector('meta[name="viewport"]');
  if (existingMeta) {
    existingMeta.remove();
  }

  // Create iOS-optimized viewport meta
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content';
  document.head.appendChild(meta);
};

/**
 * Setup Telegram WebApp after script loads
 */
export const setupTelegramWebApp = (): void => {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) {
      console.error('Telegram WebApp not available');
      return;
    }

    console.log('🚀 Setting up Telegram WebApp...');

    // iOS-specific initialization
    if (isIOS()) {
      // Wait for iOS to be ready
      setTimeout(() => {
        tg.ready();
        tg.expand();

        // iOS-specific settings
        if (tg.disableVerticalSwipes) {
          tg.disableVerticalSwipes();
        }
        if (tg.enableClosingConfirmation) {
          tg.enableClosingConfirmation();
        }
      }, 500);
    } else {
      // Standard initialization
      tg.ready();
      tg.expand();
    }

    // Store globally for easy access
    (window as any).__telegramWebApp = tg;

    console.log('✅ Telegram WebApp setup completed:', {
      hasInitData: !!tg.initData,
      hasUser: !!(tg.initDataUnsafe?.user),
      version: tg.version,
      platform: tg.platform,
      isIOS: isIOS(),
    });

  } catch (error) {
    console.error('❌ Error setting up Telegram WebApp:', error);
  }
};

/**
 * Load Telegram Web Apps script with iOS optimizations
 */
export const loadTelegramScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).Telegram?.WebApp) {
      console.log('📱 Telegram script already loaded');
      setupTelegramWebApp();
      resolve();
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src*="telegram-web-app.js"]')) {
      console.log('📱 Telegram script element exists, waiting for load...');
      // Wait longer for iOS
      const waitTime = isIOS() ? 1000 : 500;
      setTimeout(() => {
        if ((window as any).Telegram?.WebApp) {
          setupTelegramWebApp();
          resolve();
        } else {
          reject(new Error('Script loaded but Telegram not available'));
        }
      }, waitTime);
      return;
    }

    console.log('📱 Loading Telegram script dynamically...');
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js?v=7.10';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('📱 Telegram script loaded successfully');
      // Wait longer for iOS to initialize
      const waitTime = isIOS() ? 1000 : 200;
      setTimeout(() => {
        if ((window as any).Telegram?.WebApp) {
          setupTelegramWebApp();
          resolve();
        } else {
          reject(new Error('Telegram not available after loading'));
        }
      }, waitTime);
    };

    script.onerror = (error) => {
      console.error('❌ Failed to load Telegram script:', error);
      reject(new Error('Failed to load Telegram script'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Initialize Telegram Web App environment
 */
export const initializeTelegramEnvironment = async (): Promise<boolean> => {
  try {
    console.log('🚀 Initializing Telegram environment...', {
      isIOS: isIOS(),
      isTelegram: isTelegramEnvironment(),
    });

    // Setup iOS viewport first
    if (isIOS()) {
      setupIOSViewport();
    }

    // Load Telegram script if in Telegram environment
    if (isTelegramEnvironment()) {
      await loadTelegramScript();
      return true;
    } else {
      console.log('🔧 Not in Telegram environment');
      return false;
    }

  } catch (error) {
    console.error('❌ Telegram environment initialization failed:', error);
    return false;
  }
};
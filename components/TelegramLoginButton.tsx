// components/TelegramLoginButton.tsx
import { useEffect, useRef } from 'react';

interface TelegramLoginButtonProps {
  botName: string;
  onAuth: (user: never) => void;
}

export default function TelegramLoginButton({ botName, onAuth }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const sanitizeBotName = (name: string): string => {
    // Remove @ if present
    let sanitized = name.replace('@', '');
    // Remove _bot or bot suffix if present
    sanitized = sanitized.replace(/_?bot$/i, '');
    // Remove underscores
    // sanitized = sanitized.replace(/_/g, '');
    // Convert to lowercase
    sanitized = sanitized.toLowerCase();
    return sanitized;
  };

  useEffect(() => {
    const sanitizedBotName = sanitizeBotName(botName);
    console.log('Sanitized bot name:', sanitizedBotName); // Debug log

    // Define the callback function in the window object
    // @ts-expect-error
    window.TelegramLoginWidget = {
      dataOnauth: (user: never) => onAuth(user)
    };

    // Create and append the script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', sanitizedBotName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
    script.async = true;

    // Clear any existing content and append the script
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [botName, onAuth]);

  return <div ref={containerRef} className="telegram-login-container" />;
}

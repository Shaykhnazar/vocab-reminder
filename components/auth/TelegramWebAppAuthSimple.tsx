// components/auth/TelegramWebAppAuthSimple.tsx
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { useTelegramAuthSimple } from '@/hooks/use-telegram-auth-simple';
import { Button } from '@/components/shadcn-ui/button';
import { Loader2 } from 'lucide-react';

interface TelegramWebAppAuthSimpleProps {
  autoRedirect?: boolean;
  showButton?: boolean;
  onAuthSuccess?: () => void;
  onAuthFailure?: (error: string) => void;
}

export default function TelegramWebAppAuthSimple({
  autoRedirect = true,
  showButton = true,
  onAuthSuccess,
  onAuthFailure
}: TelegramWebAppAuthSimpleProps) {
  const t = useTranslations('Auth');
  const router = useRouter();
  const { toast } = useToast();
  const auth = useTelegramAuthSimple();

  // Handle authentication state changes
  useEffect(() => {
    if (auth.isAuthenticated && auth.user && !auth.isLoading) {
      console.log('✅ Telegram authentication successful:', auth.user);

      toast({
        title: t('toast.success'),
        description: t('toast.telegramAutoAuth'),
      });

      onAuthSuccess?.();

      if (autoRedirect) {
        router.push('/words');
      }
    } else if (auth.error && !auth.isLoading) {
      console.error('❌ Telegram authentication failed:', auth.error);
      onAuthFailure?.(auth.error);
    }
  }, [auth.isAuthenticated, auth.user, auth.error, auth.isLoading, onAuthSuccess, onAuthFailure, autoRedirect, router, t, toast]);

  // Manual authentication handler
  const handleManualAuth = async () => {
    try {
      const success = await auth.authenticate();
      if (!success && auth.error) {
        toast({
          title: t('toast.error'),
          description: auth.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: error instanceof Error ? error.message : 'Authentication failed',
        variant: 'destructive',
      });
    }
  };

  // Show loading state
  if (auth.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {t('telegramWebApp.authenticating')}
        </p>
      </div>
    );
  }

  // Show error state with retry option
  if (auth.error && !auth.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <p className="text-sm text-destructive text-center">
          {auth.error}
        </p>
        {auth.canAttemptAuth && showButton && (
          <Button
            onClick={handleManualAuth}
            variant="outline"
            disabled={auth.isLoading}
          >
            {auth.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('telegramWebApp.authenticating')}
              </>
            ) : (
              t('telegramWebApp.tryAgain')
            )}
          </Button>
        )}
      </div>
    );
  }

  // Show manual auth button if not authenticated and can attempt auth
  if (!auth.isAuthenticated && auth.canAttemptAuth && showButton) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <p className="text-sm text-muted-foreground text-center">
          {t('telegramWebApp.clickToAuth')}
        </p>
        <Button
          onClick={handleManualAuth}
          disabled={auth.isLoading}
          className="w-full"
        >
          {auth.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('telegramWebApp.authenticating')}
            </>
          ) : (
            t('telegramWebApp.authenticate')
          )}
        </Button>
      </div>
    );
  }

  // Don't render anything if authenticated or can't attempt auth
  return null;
}

/**
 * Auto-authentication component that attempts authentication on mount
 */
export function TelegramWebAppAutoAuth(props: Omit<TelegramWebAppAuthSimpleProps, 'showButton'>) {
  return <TelegramWebAppAuthSimple {...props} showButton={false} />;
}

/**
 * Manual authentication button component
 */
export function TelegramWebAppAuthButton(props: Omit<TelegramWebAppAuthSimpleProps, 'autoRedirect'>) {
  return <TelegramWebAppAuthSimple {...props} autoRedirect={false} />;
}

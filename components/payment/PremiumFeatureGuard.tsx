'use client';

import React, { ReactNode } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { LockIcon, Unlock } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { useRouter } from 'next/navigation';

interface PremiumFeatureGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  cardTitle?: string;
  cardDescription?: string;
}

export default function PremiumFeatureGuard({
                                              children,
                                              fallback,
                                              showUpgrade = true,
                                              cardTitle = "Premium Feature",
                                              cardDescription = "This feature is available to premium subscribers only.",
                                            }: PremiumFeatureGuardProps) {
  const { isPremium, isLoading } = useSubscription();
  const router = useRouter();

  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col items-center justify-center p-6 rounded-lg border border-slate-200 bg-slate-50">
        <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
      </div>
    );
  }

  // If user is premium, show the children
  if (isPremium) {
    return <>{children}</>;
  }

  // If a fallback is provided, show that
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise, show a locked feature card
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <div className="flex justify-center mb-2">
          <LockIcon className="h-10 w-10 text-amber-500" />
        </div>
        <CardTitle className="text-xl text-center">{cardTitle}</CardTitle>
        <CardDescription className="text-center">{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-slate-600">
        <p>
          Upgrade to a premium plan to unlock unlimited words, advanced review scheduling,
          and many more features to supercharge your vocabulary learning.
        </p>
      </CardContent>
      {showUpgrade && (
        <CardFooter className="flex justify-center pt-2">
          <Button
            onClick={() => router.push('/pricing')}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Unlock className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

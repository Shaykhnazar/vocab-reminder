// components/subscription/SubscriptionStatus.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { CreditCard, AlertTriangle, ShieldCheck, Crown } from 'lucide-react';
import { formatDate } from '@/utils/format';

interface SubscriptionStatusProps {
  subscription: {
    id: string;
    status: string;
    planName: string;
    startsAt: string;
    endsAt: string;
    daysRemaining: number;
    features: string[];
    gumroadUrl?: string;
  } | null;
  loading: boolean;
}

const SubscriptionStatus = ({ subscription, loading }: SubscriptionStatusProps) => {
  if (loading) {
    return (
      <Card className="mb-8 border-dashed">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="mb-8 border-dashed border-amber-200 bg-amber-50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg text-amber-700">No Active Subscription</CardTitle>
          </div>
          <CardDescription className="text-amber-600">
            You're using the free plan with limited features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-600 mb-4">
            Upgrade to a premium plan to unlock all features and increase your word limit.
          </p>
          <Button asChild>
            <Link href="/subscriptions">View Plans</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isExpiring = subscription.daysRemaining < 7 && subscription.daysRemaining > 0;
  const isExpired = subscription.status === 'expired';
  const isActive = subscription.status === 'active';

  return (
    <Card className={`mb-8 ${isExpiring ? 'border-amber-200 bg-amber-50' : isExpired ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isActive && <ShieldCheck className="h-5 w-5 text-green-500" />}
            {isExpiring && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            {isExpired && <AlertTriangle className="h-5 w-5 text-red-500" />}
            <CardTitle className={`text-lg ${isActive ? 'text-green-700' : isExpiring ? 'text-amber-700' : 'text-red-700'}`}>
              {subscription.planName} Plan
            </CardTitle>
          </div>
          <Badge variant={isActive ? "default" : isExpiring ? "outline" : "destructive"}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </Badge>
        </div>
        <CardDescription className={isActive ? 'text-green-600' : isExpiring ? 'text-amber-600' : 'text-red-600'}>
          {isActive && !isExpiring && 'Your subscription is active'}
          {isExpiring && `Expires in ${subscription.daysRemaining} days`}
          {isExpired && 'Your subscription has expired'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-white p-2 shadow-sm">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">
              {isActive ?
                `Valid until ${formatDate(subscription.endsAt)}` :
                `Expired on ${formatDate(subscription.endsAt)}`
              }
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {subscription.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="bg-white">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex flex-wrap gap-2">
        {isExpired || isExpiring ? (
          <Button asChild>
            <Link href={subscription.gumroadUrl || "/subscriptions"}>
              <CreditCard className="h-4 w-4 mr-2" />
              Renew Subscription
            </Link>
          </Button>
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link href="/billing">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/subscriptions">
                View Plans
              </Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionStatus;

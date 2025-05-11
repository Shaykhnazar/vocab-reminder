"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Check, Shield, CircleX, HelpCircle, CreditCard, ArrowRight, Zap, Loader2} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/shadcn-ui/alert';
import { Switch } from '@/components/shadcn-ui/switch';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatCurrency } from '@/utils/format';
import { Link } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/shadcn-ui/dialog';
import {SubscriptionsPageProps, Plan} from "@/types/subscriptions";


const SubscriptionsPage = (subscriptionData: SubscriptionsPageProps) => {
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [freeTrialAvailable, setFreeTrialAvailable] = useState(true);

  useEffect(() => {
    // Find current plan if user has a subscription
    if (subscriptionData.data.currentSubscription) {
      const plan = subscriptionData.data.plans.find(p => p.id === subscriptionData.data.currentSubscription?.planId);
      if (plan) {
        setCurrentPlan(plan);
      }
    }

  }, [subscriptionData]);

  const filteredPlans = subscriptionData.data.plans.filter(plan => plan.billingPeriod === billingPeriod);

  const handleSelectPlan = (plan: Plan) => {
    if (subscriptionData.data.currentSubscription && subscriptionData.data.currentSubscription.status === 'active') {
      // For users with active subscriptions, show confirmation dialog
      setSelectedPlan(plan);
      setShowConfirmDialog(true);
    } else {
      // For new users or users with expired subscriptions, go directly to checkout
      handleCheckout(plan);
    }
  };

  const handleCheckout = (plan: Plan) => {
    setLoading(true);

    // Track the event for analytics
    try {
      // Redirect to Gumroad checkout
      window.open(plan.gumroadPermalink, '_blank');

      toast({
        title: "Checkout Started",
        description: "Complete your purchase on Gumroad to activate your subscription.",
      });
    } catch (error) {
      console.error("Error during checkout:", error);
      toast({
        title: "Checkout Error",
        description: "There was an error starting the checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscriptionData.data.currentSubscription && subscriptionData.data.currentSubscription.planId === planId && subscriptionData.data.currentSubscription.status === 'active';
  };

  const calculateYearlySavings = (price: number) => {
    return Math.round(price * 12 * 0.2); // 20% discount for yearly plans
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
      <p className="text-muted-foreground mb-8">Choose the perfect plan for your vocabulary learning journey</p>

      {/* Current Subscription Alert */}
      {subscriptionData.data.currentSubscription && (
        <Alert className={`mb-8 ${subscriptionData.data.currentSubscription.status === 'active' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <Shield className={`h-4 w-4 ${subscriptionData.data.currentSubscription.status === 'active' ? 'text-green-600' : 'text-amber-600'}`} />
          <AlertTitle className={subscriptionData.data.currentSubscription.status === 'active' ? 'text-green-700' : 'text-amber-700'}>
            {subscriptionData.data.currentSubscription.status === 'active' ? 'Active Subscription' : 'Subscription Expired'}
          </AlertTitle>
          <AlertDescription className={subscriptionData.data.currentSubscription.status === 'active' ? 'text-green-600' : 'text-amber-600'}>
            {subscriptionData.data.currentSubscription.status === 'active' ? (
              <>
                You're currently on the <strong>{subscriptionData.data.currentSubscription.planName}</strong> plan, valid until {formatDate(subscriptionData.data.currentSubscription.endsAt)}.
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <div className="text-sm bg-white border border-green-100 rounded-md px-3 py-1.5 inline-flex items-center">
                    <Zap className="h-4 w-4 mr-1.5 text-green-500" />
                    <span>{subscriptionData.data.currentSubscription.wordsRemaining} words remaining</span>
                  </div>
                  <div className="text-sm bg-white border border-green-100 rounded-md px-3 py-1.5 inline-flex items-center">
                    <Check className="h-4 w-4 mr-1.5 text-green-500" />
                    <span>{subscriptionData.data.currentSubscription.daysRemaining} days left in billing period</span>
                  </div>
                </div>
              </>
            ) : (
              <>Your {subscriptionData.data.currentSubscription.planName} plan expired on {formatDate(subscriptionData.data.currentSubscription.endsAt)}. Please renew to continue enjoying premium features.</>
            )}
            <div className="mt-4">
              <Button size="sm" asChild variant="outline">
                <Link href="/billing">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Billing Period Toggle */}
      <div className="flex justify-center items-center mb-8">
        <div className="flex items-center space-x-2 bg-muted rounded-lg p-2">
          <span className={`px-3 py-1 rounded transition-colors ${billingPeriod === 'monthly' ? 'bg-background font-semibold shadow-sm' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Switch
            checked={billingPeriod === 'yearly'}
            onCheckedChange={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
          />
          <span className={`px-3 py-1 rounded flex items-center gap-1 transition-colors ${billingPeriod === 'yearly' ? 'bg-background font-semibold shadow-sm' : 'text-muted-foreground'}`}>
            Yearly
            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800 hover:bg-green-100">
              Save 20%
            </Badge>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className={`relative overflow-hidden transition-all duration-200 ${plan.popular ? 'border-primary shadow-md hover:shadow-lg' : 'hover:border-gray-300 hover:shadow-sm'}`}>
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                Most Popular
              </div>
            )}
            <CardHeader className={plan.popular ? 'bg-primary-50 border-b border-primary-100' : ''}>
              <CardTitle className={plan.popular ? 'text-primary' : ''}>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-muted-foreground">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>

                {billingPeriod === 'yearly' && (
                  <div className="mt-1 text-sm text-green-600">
                    Save {formatCurrency(calculateYearlySavings(plan.price))} per year
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h4 className="font-medium mb-2">What's included:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Word Limit</span>
                  <span className="font-semibold">{plan.wordLimit.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                className="w-full"
                variant={isCurrentPlan(plan.id) ? "outline" : plan.popular ? "default" : "outline"}
                disabled={isCurrentPlan(plan.id) || loading}
                onClick={() => handleSelectPlan(plan)}
              >
                {loading ? (
                  <>Please wait</>
                ) : isCurrentPlan(plan.id) ? (
                  "Current Plan"
                ) : subscriptionData.data.currentSubscription && subscriptionData.data.currentSubscription.status === 'active' ? (
                  "Change Plan"
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {freeTrialAvailable && plan.id !== 'free' && !subscriptionData.data.currentSubscription && (
                <p className="text-xs text-center text-muted-foreground">
                  Includes 7-day free trial
                </p>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Plans Comparison Table */}
      <div className="mt-12 mb-16">
        <h2 className="text-2xl font-bold mb-6">Plans Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-4 px-4 text-left font-medium">Feature</th>
                {subscriptionData.data.plans.filter(p => p.billingPeriod === 'monthly').map(plan => (
                  <th key={plan.id} className="py-4 px-4 text-center font-medium">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">Price</td>
                {subscriptionData.data.plans.filter(p => p.billingPeriod === 'monthly').map(plan => (
                  <td key={plan.id} className="py-4 px-4 text-center">
                    {billingPeriod === 'monthly' ?
                      `${formatCurrency(plan.price)}/mo` :
                      `${formatCurrency(plan.price * 12 * 0.8)}/yr`}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">Word Limit</td>
                {subscriptionData.data.plans.filter(p => p.billingPeriod === 'monthly').map(plan => (
                  <td key={plan.id} className="py-4 px-4 text-center">
                    {plan.wordLimit.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">Telegram Notifications</td>
                {subscriptionData.data.plans.filter(p => p.billingPeriod === 'monthly').map(plan => (
                  <td key={plan.id} className="py-4 px-4 text-center">
                    {plan.id === 'free' ?
                      <CircleX className="inline h-5 w-5 text-red-500" /> :
                      <Check className="inline h-5 w-5 text-green-500" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">Custom Review Schedule</td>
                {subscriptionData.data.plans.filter(p => p.billingPeriod === 'monthly').map(plan => (
                  <td key={plan.id} className="py-4 px-4 text-center">
                    {plan.id === 'free' || plan.id === 'basic' ?
                      <CircleX className="inline h-5 w-5 text-red-500" /> :
                      <Check className="inline h-5 w-5 text-green-500" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">Advanced Statistics</td>
                {subscriptionData.data.plans.filter(p => p.billingPeriod === 'monthly').map(plan => (
                  <td key={plan.id} className="py-4 px-4 text-center">
                    {plan.id === 'free' || plan.id === 'basic' ?
                      <CircleX className="inline h-5 w-5 text-red-500" /> :
                      <Check className="inline h-5 w-5 text-green-500" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4 font-medium">API Access</td>
                {subscriptionData.data.plans.filter(p => p.billingPeriod === 'monthly').map(plan => (
                  <td key={plan.id} className="py-4 px-4 text-center">
                    {plan.id === 'unlimited' ?
                      <Check className="inline h-5 w-5 text-green-500" /> :
                      <CircleX className="inline h-5 w-5 text-red-500" />}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-4"></td>
                {subscriptionData.data.plans.filter(p => p.billingPeriod === 'monthly').map(plan => (
                  <td key={plan.id} className="py-4 px-4 text-center">
                    {!isCurrentPlan(plan.id) && (
                      <Button
                        variant={plan.popular ? "default" : "outline"}
                        size="sm"
                        disabled={isCurrentPlan(plan.id) || loading}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        {isCurrentPlan(plan.id) ? "Current Plan" : "Choose Plan"}
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">How does billing work?</h3>
            <p className="text-muted-foreground">
              All plans are billed either monthly or yearly. You'll be charged immediately upon subscription, and then at the start of each billing period. You can cancel anytime.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Can I change plans?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes will take effect immediately, and you'll be credited for the unused portion of your current plan.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">What happens if I reach my word limit?</h3>
            <p className="text-muted-foreground">
              Once you reach your word limit, you won't be able to add new words until you upgrade your plan or the next billing cycle begins.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">How do I cancel my subscription?</h3>
            <p className="text-muted-foreground">
              You can cancel your subscription anytime from the Billing page. After cancellation, you'll still have access to premium features until the end of your current billing period.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-muted-foreground">
              Yes, all paid plans come with a 7-day free trial for new users. You can cancel anytime during the trial period without being charged.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Are there any refunds?</h3>
            <p className="text-muted-foreground">
              We offer a 30-day money-back guarantee if you're not satisfied with our service. Contact our support team to request a refund.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to change your subscription from {subscriptionData.data.currentSubscription?.planName} to {selectedPlan?.name}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Current Plan:</span>
              <span>{subscriptionData.data.currentSubscription?.planName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">New Plan:</span>
              <span>{selectedPlan?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">New Word Limit:</span>
              <span>{selectedPlan?.wordLimit.toLocaleString()} words</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">New Price:</span>
              <span>{formatCurrency(selectedPlan?.price || 0)}/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Your current subscription will remain active until the end of the billing period. You'll be credited for the unused portion when switching plans.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button
              onClick={() => selectedPlan && handleCheckout(selectedPlan)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Confirm Change"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsPage;

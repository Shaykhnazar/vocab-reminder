"use client";

import React, { useState } from 'react';
import { Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, Receipt, ExternalLink, AlertTriangle, Calendar, ArrowRight, ShieldCheck, FileText, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatCurrency } from '@/utils/format';
import { Alert, AlertDescription, AlertTitle } from '@/components/shadcn-ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shadcn-ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn-ui/table';
import {BillingPageProps} from "@/types/subscriptions";


const BillingPage = ({ subscriptionData, billingHistory }: BillingPageProps) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call an API endpoint that would cancel the subscription in Gumroad
      // For now, we'll just redirect to Gumroad
      if (subscriptionData.currentSubscription?.productPermalink) {
        window.open(subscriptionData.currentSubscription.productPermalink, '_blank');
        toast({
          title: "Redirecting to Gumroad",
          description: "Please complete the cancellation process on Gumroad.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setCancelDialogOpen(false);
    }
  };

  const handleManageSubscription = () => {
    if (subscriptionData.currentSubscription?.productPermalink) {
      window.open(subscriptionData.currentSubscription.productPermalink, '_blank');
    }
  };

  // Calculate usage percentage
  const usagePercentage = subscriptionData.wordLimit ?
    (subscriptionData.wordsUsed / subscriptionData.wordLimit) * 100 : 0;

  // Check if subscription is nearing expiry (within 7 days)
  const isNearExpiry = subscriptionData.currentSubscription?.expiresAt &&
    new Date(subscriptionData.currentSubscription.expiresAt).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
      <p className="text-muted-foreground mb-8">Manage your subscription and view billing history</p>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Subscription Details */}
        <div className="md:col-span-2 space-y-8">
          {/* Current Subscription Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Subscription</CardTitle>
                {subscriptionData.currentSubscription?.isActive && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                )}
                {!subscriptionData.currentSubscription?.isActive && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Inactive
                  </Badge>
                )}
              </div>
              <CardDescription>
                {subscriptionData.currentSubscription ?
                  `${subscriptionData.currentSubscription.subscriptionType} Plan` :
                  "No active subscription"}
              </CardDescription>
            </CardHeader>

            {subscriptionData.currentSubscription ? (
              <>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Subscription Type</p>
                      <p className="font-medium">{subscriptionData.currentSubscription.subscriptionType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">{subscriptionData.currentSubscription.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Billing Cycle</p>
                      <p className="font-medium">{subscriptionData.currentSubscription.recurrence || "Monthly"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Billing Date</p>
                      <p className="font-medium">{formatDate(subscriptionData.currentSubscription.expiresAt)}</p>
                    </div>
                  </div>

                  {isNearExpiry && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-700">Subscription Expiring Soon</AlertTitle>
                      <AlertDescription className="text-amber-600">
                        Your subscription will renew on {formatDate(subscriptionData.currentSubscription.expiresAt)}. Ensure your payment method is up to date.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Usage Progress */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium">Word Usage</p>
                      <p className="text-sm text-muted-foreground">
                        {subscriptionData.wordsUsed} / {subscriptionData.wordLimit} words
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${usagePercentage >= 90 ? 'bg-red-500' : usagePercentage >= 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}>
                      </div>
                    </div>
                    {usagePercentage >= 90 && (
                      <p className="text-xs text-red-600 mt-1">
                        You're almost at your word limit. Consider upgrading your plan.
                      </p>
                    )}
                  </div>

                  {subscriptionData.currentSubscription.isTrial && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-700">Trial Subscription</AlertTitle>
                      <AlertDescription className="text-blue-600">
                        You're currently on a {subscriptionData.currentSubscription.trialDays}-day trial.
                        Your trial will end on {formatDate(subscriptionData.currentSubscription.expiresAt)}.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleManageSubscription}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage on Gumroad
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                  <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                        Cancel Subscription
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel your subscription? You'll lose access to premium features once your current billing period ends.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 my-4">
                        <p className="text-sm text-amber-700">
                          If you cancel, your subscription will remain active until {formatDate(subscriptionData.currentSubscription.expiresAt)}, after which you'll be downgraded to the free plan.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Subscription</Button>
                        <Button
                          variant="destructive"
                          onClick={handleCancelSubscription}
                          disabled={loading}
                        >
                          {loading ? "Processing..." : "Confirm Cancellation"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" asChild>
                    <Link href="/subscriptions">
                      Upgrade Plan
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </>
            ) : (
              <CardContent className="space-y-4">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-700">No Active Subscription</AlertTitle>
                  <AlertDescription className="text-amber-600">
                    You don't have an active subscription. Subscribe to unlock premium features.
                  </AlertDescription>
                </Alert>
                <Button asChild>
                  <Link href="/subscriptions">
                    View Plans
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent billing activity</CardDescription>
            </CardHeader>
            <CardContent>
              {billingHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingHistory.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          {transaction.type === 'subscription' ? 'Subscription Payment' : 'Refund'}
                        </TableCell>
                        <TableCell className={transaction.type === 'refund' ? 'text-red-600' : ''}>
                          {transaction.type === 'refund' ? '-' : ''}{formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'completed' ? 'outline' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.receiptUrl && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your transaction history will appear here once you subscribe to a plan.
                  </p>
                  <Button asChild>
                    <Link href="/subscriptions">View Plans</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Plan Details & FAQs */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link href="/subscriptions">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Change Plan
                </Link>
              </Button>

              {subscriptionData.currentSubscription && (
                <Button variant="outline" className="w-full" onClick={handleManageSubscription}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Invoices
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Subscription
              </Button>
            </CardContent>
          </Card>

          {/* FAQ Card */}
          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">How do I upgrade my plan?</h3>
                <p className="text-sm text-muted-foreground">
                  Visit the Subscriptions page to see available plans and upgrade options.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Will I lose my words if I downgrade?</h3>
                <p className="text-sm text-muted-foreground">
                  No, your words are safe. However, you won't be able to add new words beyond your plan's limit.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">How do refunds work?</h3>
                <p className="text-sm text-muted-foreground">
                  Please contact support for refund requests within 7 days of purchase.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">What payment methods are accepted?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept credit cards, PayPal, and Apple Pay through our payment processor, Gumroad.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about your subscription or billing, please contact our support team.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/support">
                  Contact Support
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;

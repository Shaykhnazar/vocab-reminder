// app/admin/telegram/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { RefreshCw, Check, AlertTriangle, Shield, LogOut } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn-ui/alert";
import { useSession, signIn, signOut } from "next-auth/react";
import { Skeleton } from "@/components/shadcn-ui/skeleton";

export default function TelegramAdminPage() {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check if the current user is authorized
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      // We'll make an API call to check admin status on the server side
      // This keeps the ADMIN_EMAIL secure on the server
      checkAdminStatus();
    }
  }, [session, status]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/check-admin');
      const data = await response.json();

      setIsAuthorized(data.isAdmin);

      if (!data.isAdmin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this page',
        });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAuthorized(false);
    }
  };

  const fetchWebhookInfo = async () => {
    if (!isAuthorized) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/telegram/setup-webhook');
      if (!response.ok) throw new Error('Failed to fetch webhook info');

      const data = await response.json();
      setWebhookInfo(data.webhook);

      if (!data.webhook?.url) {
        setError('Webhook is not configured');
      }
    } catch (error) {
      setError('Error fetching webhook status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebhook = async () => {
    if (!isAuthorized) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/telegram/setup-webhook', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to set up webhook');

      const data = await response.json();
      setWebhookInfo(data.webhook?.info);
      setSuccess('Webhook configured successfully!');

      toast({
        title: 'Success',
        description: 'Telegram webhook configured successfully',
      });
    } catch (error) {
      setError('Error setting up webhook');
      console.error(error);

      toast({
        title: 'Error',
        description: 'Failed to set up Telegram webhook',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchWebhookInfo();
    }
  }, [isAuthorized]);

  // Loading state while checking session
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Telegram Bot Configuration</h1>
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not signed in
  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Access Required</h1>
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Shield className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-500 mb-6 text-center">
              You need to sign in as an administrator to access this page.
            </p>
            <Button onClick={() => signIn()}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Signed in but not authorized
  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Access Denied</h1>
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Shield className="h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unauthorized Access</h2>
            <p className="text-gray-500 mb-6 text-center">
              Your account doesn't have permission to access this admin area.
              Please contact the administrator for access.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authorized admin view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Telegram Bot Configuration</h1>
        <Button variant="outline" onClick={() => signOut()} size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Webhook Status</CardTitle>
          <CardDescription>
            Check and configure your Telegram bot webhook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-700">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {webhookInfo && (
            <div className="bg-slate-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Current Webhook Configuration:</h3>
              <pre className="text-xs overflow-auto p-2 bg-slate-100 rounded">
                {JSON.stringify(webhookInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={fetchWebhookInfo}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>

            <Button
              onClick={setupWebhook}
              disabled={loading}
            >
              {loading ? 'Configuring...' : 'Configure Webhook'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create a Telegram bot using BotFather if you haven't already</li>
            <li>Set the <code>TELEGRAM_BOT_TOKEN</code> environment variable</li>
            <li>Set the <code>TELEGRAM_WEBHOOK_SECRET</code> to a random string</li>
            <li>Make sure your app is deployed to a public HTTPS URL</li>
            <li>Click the "Configure Webhook" button above</li>
            <li>Test your bot by sending it a message on Telegram</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, {useEffect, useState} from 'react';
import { Button } from "@/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { Switch } from "@/components/shadcn-ui/switch";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Bell,
  Mail,
  MessageCircle,
  User,
  BarChart,
  RefreshCw,
  AlertTriangle,
  Check,
  ExternalLink
} from 'lucide-react';
import { useSession } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn-ui/alert";
import { Badge } from "@/components/shadcn-ui/badge";
import { Separator } from "@/components/shadcn-ui/separator";

// Update the form schema to make email optional for Telegram users
const profileFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  telegram_id: z.string().optional(),
});

const ProfilePage = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  // Check if user is authenticated via Telegram
  const isTelegramUser = !!session?.user?.telegram_id;
  // Add loading state
  const [isLoading, setIsLoading] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState({
    connected: false,
    connecting: false,
    refreshing: false
  });

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      telegram_id: "",
    },
  });

  const [notificationPreferences, setNotificationPreferences] = React.useState({
    email: true,
    telegram: true
  });

  const [successMessage, setSuccessMessage] = useState('');
// Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const userData = await response.json();

        // Set form values
        form.reset({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          username: userData.username || "",
          email: userData.email || "",
          telegram_id: userData.telegram_id || "",
        });

        // Set notification preferences
        setNotificationPreferences(userData.notification_preferences || { email: true, telegram: false });

        // Set Telegram connection status
        setTelegramStatus(prev => ({
          ...prev,
          connected: !!userData.telegram_id
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
        });
      }
    };

    fetchUserData();
  }, [form, toast]);

  const onSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    setIsLoading(true);
    try {
      // Check if email is being changed
      const emailChanged = data.email !== form.getValues('email');

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const result = await response.json();

      // If email was changed and needs verification
      if (emailChanged && result.verificationRequired) {
        toast({
          title: "Verification Required",
          description: "Please check your email to verify your new email address.",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile settings have been saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationPreferenceChange = async (type: 'email' | 'telegram', enabled: boolean) => {
    try {
      const newPreferences = {
        ...notificationPreferences,
        [type]: enabled
      };

      // For Telegram notifications, we need to check connection status first
      if (type === 'telegram' && enabled && !telegramStatus.connected) {
        toast({
          title: "Telegram not connected",
          description: "Please connect your Telegram account first",
        });
        return;
      }

      let response;
      if (type === 'telegram') {
        // Use the dedicated Telegram notification endpoint
        response = await fetch('/api/user/telegram-notifications', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled }),
        });
      } else {
        // Use the general notification preferences endpoint
        response = await fetch('/api/user/notifications', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notification_preferences: newPreferences }),
        });
      }

      if (!response.ok) throw new Error('Failed to update notification preferences');

      setNotificationPreferences(newPreferences);
      toast({
        title: "Preferences updated",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
      });
    }
  };

  // Connect Telegram account
  const handleConnectTelegram = () => {
    if (!session?.user?.id) return;

    setTelegramStatus(prev => ({ ...prev, connecting: true }));
    const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

    // Open Telegram in new window with deep link containing user ID
    window.open(`https://t.me/${telegramBotUsername}?start=${session.user.id}`, '_blank');

    // Show success message
    setSuccessMessage('Telegram window opened. Please complete connection there and refresh status when done.');

    // Reset connecting state after a delay
    setTimeout(() => {
      setTelegramStatus(prev => ({ ...prev, connecting: false }));
    }, 3000);
  };

  // Refresh Telegram connection status
  const refreshTelegramStatus = async () => {
    if (!session?.user) return;

    try {
      setTelegramStatus(prev => ({ ...prev, refreshing: true }));

      // First check Telegram-specific endpoint
      const telegramRes = await fetch('/api/user/telegram-notifications');
      if (!telegramRes.ok) throw new Error('Failed to fetch Telegram status');

      const telegramData = await telegramRes.json();

      // Then refresh general profile data to ensure everything is in sync
      const profileRes = await fetch('/api/user/profile');
      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileRes.json();

      // Update states
      setTelegramStatus(prev => ({
        ...prev,
        connected: telegramData.connected,
        refreshing: false
      }));

      setNotificationPreferences(profileData.notification_preferences || { email: true, telegram: false });

      // Update form data in case telegram_id changed
      if (telegramData.connected && !form.getValues('telegram_id')) {
        form.setValue('telegram_id', profileData.telegram_id || '');
      }

      // Show success message if connection was established
      if (telegramData.connected && !telegramStatus.connected) {
        setSuccessMessage('Telegram successfully connected!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error refreshing Telegram status:', error);
      toast({
        title: "Error",
        description: "Failed to refresh Telegram connection status",
      });
    } finally {
      setTelegramStatus(prev => ({ ...prev, refreshing: false }));
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telegram_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telegram ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your Telegram ID, e.g. 123456789"
                            {...field}
                            disabled={isTelegramUser}
                          />
                        </FormControl>
                        <FormDescription>
                          {isTelegramUser
                            ? "Telegram ID cannot be changed when signed in with Telegram"
                            : "Your Telegram username for receiving word reminders."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab - Enhanced with Telegram connection UI */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Customize how and when you receive vocabulary reminders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {successMessage && (
                <Alert className="bg-green-50 border-green-200 text-green-700">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <label htmlFor="email-notifications" className="font-medium">
                      Email Notifications
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Receive word reminders via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationPreferences?.email}
                  onCheckedChange={(checked) => handleNotificationPreferenceChange('email', checked)}
                />
              </div>

              <Separator />

              {/* Telegram Notifications - Enhanced with connection status */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <label htmlFor="telegram-notifications" className="font-medium">
                        Telegram Notifications
                      </label>
                      {telegramStatus.connected && (
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-50">Connected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {telegramStatus.connected
                        ? "Receive word reminders via Telegram"
                        : "Connect your Telegram account for notifications"}
                    </p>
                  </div>

                  {telegramStatus.connected ? (
                    <Switch
                      id="telegram-notifications"
                      checked={notificationPreferences?.telegram}
                      onCheckedChange={(checked) => handleNotificationPreferenceChange('telegram', checked)}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleConnectTelegram}
                      disabled={telegramStatus.connecting}
                    >
                      {telegramStatus.connecting ? 'Connecting...' : 'Connect'}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>

                {!telegramStatus.connected && (
                  <Alert className="bg-blue-50 border-blue-100">
                    <AlertDescription className="flex justify-between items-center">
                      <div className="text-sm">
                        After connecting in Telegram, refresh status to confirm
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshTelegramStatus}
                        disabled={telegramStatus.refreshing}
                        className="h-8 px-2"
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${telegramStatus.refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Alert className="bg-amber-50 border-amber-100 mt-6">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle>About Spaced Repetition</AlertTitle>
                <AlertDescription className="text-sm">
                  <p>You'll receive reminders on this schedule for optimal learning:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>1 hour after adding a word</li>
                    <li>3 hours later</li>
                    <li>8 hours later</li>
                    <li>1 day later</li>
                    <li>3 days later</li>
                    <li>7 days later</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab - Keeping the same as before */}
        <TabsContent value="statistics">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Words</CardTitle>
                <CardDescription>Words added to your collection</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">127</p>
                <p className="text-sm text-gray-500">+12 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Success</CardTitle>
                <CardDescription>Average reminder response rate</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">89%</p>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Streak</CardTitle>
                <CardDescription>Consecutive days of activity</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">15</p>
                <p className="text-sm text-gray-500">days</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;

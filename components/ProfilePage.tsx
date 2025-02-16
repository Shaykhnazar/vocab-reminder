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
  BarChart
} from 'lucide-react';
import { useSession } from "next-auth/react";

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
        setNotificationPreferences(userData.notification_preferences);
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

      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_preferences: newPreferences }),
      });

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

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Customize how and when you receive reminders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <label htmlFor="telegram-notifications" className="font-medium">
                      Telegram Notifications
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Receive word reminders via Telegram
                  </p>
                </div>
                <Switch
                  id="telegram-notifications"
                  checked={notificationPreferences?.telegram}
                  onCheckedChange={(checked) => handleNotificationPreferenceChange('telegram', checked)}
                />
              </div>
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

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
import { useTranslations } from 'next-intl';

const ProfilePage = () => {
  const t = useTranslations('Profile');
  const { data: session } = useSession();
  const { toast } = useToast();

  // Create the form schema with translated validation messages
  const profileFormSchema = z.object({
    first_name: z.string().min(2, {
      message: t('form.validation.firstNameLength'),
    }),
    last_name: z.string().min(2, {
      message: t('form.validation.lastNameLength'),
    }),
    username: z.string().min(2, {
      message: t('form.validation.usernameLength'),
    }),
    email: z.string().email({
      message: t('form.validation.emailValid'),
    }).optional(),
    telegram_id: z.string().optional(),
  });

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
          title: t('toast.error'),
          description: t('toast.errorFetchUserData'),
        });
      }
    };

    fetchUserData();
  }, [form, toast, t]);

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
          title: t('toast.verificationRequired'),
          description: t('toast.checkEmail'),
        });
      } else {
        toast({
          title: t('toast.profileUpdated'),
          description: t('toast.profileUpdateSuccess'),
        });
      }
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.errorUpdateProfile'),
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
          title: t('toast.telegramNotConnected'),
          description: t('toast.connectTelegramFirst'),
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
        title: t('toast.preferencesUpdated'),
        description: t('toast.notificationToggle', {
          type: type.charAt(0).toUpperCase() + type.slice(1),
          status: enabled ? t('common.enabled') : t('common.disabled')
        }),
      });
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.errorUpdateNotification'),
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
    setSuccessMessage(t('telegram.windowOpened'));

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
        setSuccessMessage(t('telegram.successfullyConnected'));
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error refreshing Telegram status:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.errorRefreshTelegram'),
      });
    } finally {
      setTelegramStatus(prev => ({ ...prev, refreshing: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('tabs.profile')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t('tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            {t('tabs.statistics')}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profileTab.title')}</CardTitle>
              <CardDescription>
                {t('profileTab.description')}
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
                          <FormLabel>{t('form.firstName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('form.firstNamePlaceholder')} {...field} />
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
                          <FormLabel>{t('form.lastName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('form.lastNamePlaceholder')} {...field} />
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
                        <FormLabel>{t('form.username')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('form.usernamePlaceholder')} {...field} />
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
                        <FormLabel>{t('form.email')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('form.emailPlaceholder')} {...field} />
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
                        <FormLabel>{t('form.telegramId')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('form.telegramIdPlaceholder')}
                            {...field}
                            disabled={isTelegramUser}
                          />
                        </FormControl>
                        <FormDescription>
                          {isTelegramUser
                            ? t('form.telegramIdLocked')
                            : t('form.telegramIdDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? t('form.saving') : t('form.saveChanges')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab - Enhanced with Telegram connection UI */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('notificationsTab.title')}</CardTitle>
              <CardDescription>
                {t('notificationsTab.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {successMessage && (
                <Alert className="bg-green-50 border-green-200 text-green-700">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>{t('common.success')}</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <label htmlFor="email-notifications" className="font-medium">
                      {t('notificationsTab.emailNotifications')}
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('notificationsTab.emailDescription')}
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
                        {t('notificationsTab.telegramNotifications')}
                      </label>
                      {telegramStatus.connected && (
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-50">{t('common.connected')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {telegramStatus.connected
                        ? t('notificationsTab.telegramConnectedDesc')
                        : t('notificationsTab.telegramNotConnectedDesc')}
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
                      {telegramStatus.connecting ? t('common.connecting') : t('common.connect')}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>

                {!telegramStatus.connected && (
                  <Alert className="bg-blue-50 border-blue-100">
                    <AlertDescription className="flex justify-between items-center">
                      <div className="text-sm">
                        {t('telegram.refreshAfterConnecting')}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshTelegramStatus}
                        disabled={telegramStatus.refreshing}
                        className="h-8 px-2"
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${telegramStatus.refreshing ? 'animate-spin' : ''}`} />
                        {t('common.refresh')}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Alert className="bg-amber-50 border-amber-100 mt-6">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle>{t('notificationsTab.spacedRepetition.title')}</AlertTitle>
                <AlertDescription className="text-sm">
                  <p>{t('notificationsTab.spacedRepetition.description')}</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>{t('notificationsTab.spacedRepetition.schedule.oneHour')}</li>
                    <li>{t('notificationsTab.spacedRepetition.schedule.threeHours')}</li>
                    <li>{t('notificationsTab.spacedRepetition.schedule.eightHours')}</li>
                    <li>{t('notificationsTab.spacedRepetition.schedule.oneDay')}</li>
                    <li>{t('notificationsTab.spacedRepetition.schedule.threeDays')}</li>
                    <li>{t('notificationsTab.spacedRepetition.schedule.sevenDays')}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{t('statsTab.totalWords.title')}</CardTitle>
                <CardDescription>{t('statsTab.totalWords.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">127</p>
                <p className="text-sm text-gray-500">{t('statsTab.totalWords.weekChange', { count: 12 })}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('statsTab.reviewSuccess.title')}</CardTitle>
                <CardDescription>{t('statsTab.reviewSuccess.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">89%</p>
                <p className="text-sm text-gray-500">{t('statsTab.reviewSuccess.period')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('statsTab.streak.title')}</CardTitle>
                <CardDescription>{t('statsTab.streak.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">15</p>
                <p className="text-sm text-gray-500">{t('statsTab.streak.unit')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;

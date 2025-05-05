// components/LandingPage.tsx
"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Brain, Clock, Bell, Mail } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/shadcn-ui/card";
import GumroadPurchaseLink from "@/components/payment/GumroadPurchaseLink";

export default function LandingPage() {
  const t = useTranslations('Home');
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleGetStarted}
            >
              {t('hero.startFreeTrial')}
            </Button>
            <GumroadPurchaseLink
              planType="monthly"
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {t('hero.buyPremium')}
            </GumroadPurchaseLink>
          </div>
        </div>

      {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-all">
            <CardHeader>
              <Brain className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>{t('features.spaced.title')}</CardTitle>
              <CardDescription>
                {t('features.spaced.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {t('features.spaced.description')}
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-all">
            <CardHeader>
              <Bell className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>{t('features.notifications.title')}</CardTitle>
              <CardDescription>
                {t('features.notifications.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {t('features.notifications.description')}
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-all">
            <CardHeader>
              <Clock className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>{t('features.effortless.title')}</CardTitle>
              <CardDescription>
                {t('features.effortless.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {t('features.effortless.description')}
            </CardContent>
          </Card>
        </div>

      {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold mb-6">
            {t('cta.title')}
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/about" passHref>
              <Button size="lg" variant="outline">
                {t('cta.learnMore')}
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleGetStarted}
            >
              {t('cta.getStarted')}
            </Button>
            <GumroadPurchaseLink
              planType="yearly"
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {t('cta.getPremium')}
            </GumroadPurchaseLink>
          </div>
        </div>
      </div>
    </div>
  );
}
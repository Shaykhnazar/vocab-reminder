// components/AboutPage.tsx
"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Brain, TrendingUp, Clock, Zap, BookOpen, BarChart } from 'lucide-react';
import { useRouter } from "next/navigation";
import GumroadPurchaseLink from "@/components/payment/GumroadPurchaseLink";

export default function AboutPage() {
  const t = useTranslations('About');
  const router = useRouter();

  const handleStartLearning = () => {
    router.push('signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">
            {t('hero.titlePrefix')}{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              {t('hero.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Science Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('science.title')}</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <Brain className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>{t('science.forgettingCurve.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('science.forgettingCurve.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>{t('science.spacedRepetition.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('science.spacedRepetition.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

      {/* Benefits Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('benefits.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <Clock className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>{t('benefits.timing.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('benefits.timing.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <Zap className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>{t('benefits.multiChannel.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('benefits.multiChannel.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>{t('benefits.integration.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('benefits.integration.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('stats.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <BarChart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-600">{t('stats.retention.value')}</h3>
              <p className="text-gray-600">{t('stats.retention.description')}</p>
            </div>
            <div className="text-center">
              <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-600">{t('stats.time.value')}</h3>
              <p className="text-gray-600">{t('stats.time.description')}</p>
            </div>
            <div className="text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-600">{t('stats.acquisition.value')}</h3>
              <p className="text-gray-600">{t('stats.acquisition.description')}</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleStartLearning}
            >
              {t('cta.startTrial')}
            </Button>
            <GumroadPurchaseLink
              planType="yearly"
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {t('cta.getPremium')}
            </GumroadPurchaseLink>
          </div>
        </section>
      </div>
    </div>
  );
}
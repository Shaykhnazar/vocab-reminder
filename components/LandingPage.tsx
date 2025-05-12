// components/LandingPage.tsx
"use client";

import { useTranslations } from 'next-intl';
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Brain, Bell, Clock, Check, ArrowRight } from 'lucide-react';
import GumroadPurchaseLink from "@/components/payment/GumroadPurchaseLink";

export default function LandingPage() {
  const t = useTranslations('Home');
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('words');
  };

  const reminderSteps = [
    { time: t('reminderSchedule.steps.0.time1'), description: t('reminderSchedule.steps.0.description1') },
    { time: t('reminderSchedule.steps.1.time2'), description: t('reminderSchedule.steps.1.description2') },
    { time: t('reminderSchedule.steps.2.time3'), description: t('reminderSchedule.steps.2.description3') },
    { time: t('reminderSchedule.steps.3.time4'), description: t('reminderSchedule.steps.3.description4') },
    { time: t('reminderSchedule.steps.4.time5'), description: t('reminderSchedule.steps.4.description5') },
    { time: t('reminderSchedule.steps.5.time6'), description: t('reminderSchedule.steps.5.description6') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Hero Section - Simplified with visual focus */}
      <div className="container mx-auto px-4 pt-16 pb-12">
        <div className="flex flex-col lg:flex-row items-center max-w-6xl mx-auto gap-8">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleGetStarted}
              >
                {t('hero.startFreeTrial')} <ArrowRight className="ml-2 h-4 w-4" />
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

          {/* Hero Image */}
          <div className="lg:w-1/2 rounded-xl overflow-hidden shadow-2xl">
            <img
              src="/images/main_showcase.png"
              alt="Vocabulary learning app showcase"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      {/* How It Works Section - Visual Steps */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('howItWorks.title')}</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('howItWorks.addWords.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.addWords.description')}</p>
              <img
                src="/images/add_word.png"
                alt={t('howItWorks.addWords.title')}
                className="mt-4 rounded-lg shadow-md w-full"
              />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('howItWorks.getReminders.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.getReminders.description')}</p>
              <img
                src="/images/telegram-notification.png"
                alt={t('howItWorks.getReminders.title')}
                className="mt-4 rounded-lg shadow-md w-full"
              />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('howItWorks.masterVocabulary.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.masterVocabulary.description')}</p>
              <img
                src="/images/mastered.png"
                alt={t('howItWorks.masterVocabulary.title')}
                className="mt-4 rounded-lg shadow-md w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Simplified with icons */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('keyFeatures.title')}</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4">
              <Brain className="h-10 w-10 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('features.spaced.title')}</h3>
                <p className="text-gray-600">{t('features.spaced.description')}</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4">
              <Bell className="h-10 w-10 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('features.notifications.title')}</h3>
                <p className="text-gray-600">{t('features.notifications.description')}</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4">
              <Clock className="h-10 w-10 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('features.effortless.title')}</h3>
                <p className="text-gray-600">{t('features.effortless.description')}</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4">
              <Check className="h-10 w-10 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('keyFeatures.progressTracking.title')}</h3>
                <p className="text-gray-600">{t('keyFeatures.progressTracking.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Schedule - Visual Timeline */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t('reminderSchedule.title')}</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            {t('reminderSchedule.subtitle')}
          </p>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-purple-200 transform -translate-x-1/2"></div>

            {/* Timeline Points */}
            <div className="space-y-12 relative">
              {reminderSteps.map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                    <h3 className="text-xl font-bold text-purple-600">{item.time}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                  <div
                    className="absolute left-1/2 w-4 h-4 bg-purple-600 rounded-full transform -translate-x-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('joinUs.text')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={handleGetStarted}
            >
              {t('cta.getStarted')}
            </Button>
            <GumroadPurchaseLink
              planType="yearly"
              className="bg-blue-800 hover:bg-blue-900 text-white"
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

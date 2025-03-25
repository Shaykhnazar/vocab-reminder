// app/pricing/page.tsx
'use client';

import { Metadata } from "next"
//
// export const metadata: Metadata = {
//   title: "Privacy Policy - Vocabry",
//   description: "Privacy policy and data protection information for Vocabry users",
// }

import React, { useState } from 'react';
import { Button } from '@/components/shadcn-ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Switch } from '@/components/shadcn-ui/switch';
import { Check } from 'lucide-react';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  return (
    <div className="flex flex-col items-center py-12 px-4 bg-slate-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">Choose Your Plan</h1>
        <p className="text-slate-600 max-w-lg mx-auto">
          Select the perfect plan to accelerate your vocabulary growth and retention.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-12">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-blue-600' : 'text-slate-500'}`}>
          Monthly
        </span>
        <Switch
          checked={billingCycle === 'yearly'}
          onCheckedChange={toggleBillingCycle}
        />
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-blue-600' : 'text-slate-500'}`}>
          Yearly <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Save 30%</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Free Plan */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Free</CardTitle>
            <CardDescription>Get started with basic features</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-slate-500 ml-1">forever</span>
            </div>
          </CardHeader>
          <CardContent className="mt-2">
            <ul className="space-y-3">
              <FeatureItem text="Up to 50 words" />
              <FeatureItem text="Basic review system" />
              <FeatureItem text="Email notifications" />
              <FeatureItem text="Telegram notifications" />
              <FeatureItem text="Word import from text" />
              <FeatureItem text="7-day review history" />
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Get Started</Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="border-blue-200 shadow-md bg-blue-50">
          <div className="bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-t-lg text-center">
            MOST POPULAR
          </div>
          <CardHeader>
            <CardTitle className="text-xl">Premium</CardTitle>
            <CardDescription>Perfect for serious language learners</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">
                {billingCycle === 'monthly' ? '$6' : '$49'}
              </span>
              <span className="text-slate-500 ml-1">
                {billingCycle === 'monthly' ? '/month' : '/year'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="mt-2">
            <ul className="space-y-3">
              <FeatureItem text="Unlimited words" />
              <FeatureItem text="Advanced review algorithm" />
              <FeatureItem text="Custom review schedules" />
              <FeatureItem text="Email & Telegram notifications" />
              <FeatureItem text="Word import from text & images" />
              <FeatureItem text="Full review history" />
              <FeatureItem text="Learning analytics" />
              <FeatureItem text="Context-rich examples" />
              <FeatureItem text="Priority support" />
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              {billingCycle === 'monthly' ? 'Start Monthly Plan' : 'Start Yearly Plan'}
            </Button>
          </CardFooter>
        </Card>

        {/* Lifetime Plan */}
        <Card className="border-purple-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Lifetime</CardTitle>
            <CardDescription>One-time payment, lifetime access</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$129</span>
              <span className="text-slate-500 ml-1">one-time</span>
            </div>
          </CardHeader>
          <CardContent className="mt-2">
            <ul className="space-y-3">
              <FeatureItem text="All Premium features" />
              <FeatureItem text="Unlimited words" />
              <FeatureItem text="Future updates included" />
              <FeatureItem text="Priority support" />
              <FeatureItem text="Early access to new features" />
              <FeatureItem text="No recurring payments" />
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-purple-300 hover:bg-purple-50">
              Buy Lifetime
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center max-w-xl">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4 text-left">
          <FAQ
            question="Can I upgrade or downgrade my plan later?"
            answer="Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, you'll receive credit toward your next billing period."
          />
          <FAQ
            question="What payment methods do you accept?"
            answer="We accept all major credit cards, PayPal, and for users in Uzbekistan, we also support Click, Payme, and Uzum payment methods."
          />
          <FAQ
            question="Is there a free trial for paid plans?"
            answer="Yes, all paid plans come with a 7-day free trial. No credit card required to start your trial."
          />
          <FAQ
            question="What happens to my words if I downgrade to Free?"
            answer="If you downgrade to the Free plan with more than 50 words, your words will be preserved but you'll only be able to review the most recent 50 words. Upgrade again to regain access to all your words."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-2">
    <Check size={16} className="text-green-500 mt-1 shrink-0" />
    <span className="text-sm">{text}</span>
  </li>
);

const FAQ = ({ question, answer }: { question: string; answer: string }) => (
  <div className="p-4 bg-white rounded-lg shadow-sm">
    <h3 className="font-semibold mb-2">{question}</h3>
    <p className="text-sm text-slate-600">{answer}</p>
  </div>
);

export default PricingPage;

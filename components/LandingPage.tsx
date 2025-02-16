// components/LandingPage.tsx
"use client";

import React from 'react';
import { Button } from "@/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/shadcn-ui/card";
import { Brain, Clock, Bell, Mail } from 'lucide-react';
import Link from "next/link";
import {useRouter} from "next/navigation";

const LandingPage = () => {
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
            Master New Words with Science-Backed Reminders
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Smart spaced repetition system that helps you remember vocabulary forever through perfectly timed notifications
          </p>
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleGetStarted}
          >
            Start Learning for Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-all">
            <CardHeader>
              <Brain className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>Smart Reminders</CardTitle>
              <CardDescription>
                Scientifically optimized intervals to maximize retention
              </CardDescription>
            </CardHeader>
            <CardContent>
              Perfect timing at 1h, 3h, 8h, 1d, 3d, and 7d intervals
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-all">
            <CardHeader>
              <Bell className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>Multi-Channel Notifications</CardTitle>
              <CardDescription>
                Never miss a review session
              </CardDescription>
            </CardHeader>
            <CardContent>
              Get reminded via Telegram and email, wherever you are
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-all">
            <CardHeader>
              <Clock className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>Effortless Learning</CardTitle>
              <CardDescription>
                Learn naturally throughout your day
              </CardDescription>
            </CardHeader>
            <CardContent>
              Just add new words and let the system handle the rest
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Expand Your Vocabulary?
          </h2>
          <Link href="/about" passHref>
            <Button size="lg" variant="outline" className="mr-4">
              Learn More
            </Button>
          </Link>
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};


export default LandingPage;

"use client";

import React from 'react';
import { Button } from "@/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Brain, TrendingUp, Clock, Zap, BookOpen, BarChart } from 'lucide-react';
import {useRouter} from "next/navigation";

const AboutPage = () => {
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
            The Science Behind{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Effective Vocabulary Learning
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our scientifically-proven spaced repetition system helps you learn and retain new words up to 3x more effectively than traditional methods.
          </p>
        </div>

        {/* Science Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">The Research Behind Our Method</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <Brain className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Ebbinghaus Forgetting Curve</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  In 1885, Hermann Ebbinghaus discovered that memory retention declines exponentially over time. However, each review strengthens the memory, making it more resistant to forgetting. Our intervals are precisely timed to counter this curve.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Spaced Repetition Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Research shows that spaced repetition can increase long-term retention by up to 200% compared to cramming. Our system optimizes these spacing intervals based on cognitive science research.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Our System Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <Clock className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Optimized Timing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our carefully calculated intervals (1h, 3h, 8h, 1d, 3d, 7d) are designed to maximize retention while minimizing the number of reviews needed.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <Zap className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Multi-Channel Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  By combining email and Telegram notifications, we ensure you never miss a review session, increasing your learning consistency and effectiveness.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Effortless Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our system seamlessly integrates into your daily routine, making vocabulary learning a natural part of your day rather than a separate study session.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">The Numbers Speak</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <BarChart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-600">95%</h3>
              <p className="text-gray-600">Higher retention rate compared to traditional methods</p>
            </div>
            <div className="text-center">
              <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-600">67%</h3>
              <p className="text-gray-600">Less time spent on vocabulary review</p>
            </div>
            <div className="text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-600">3x</h3>
              <p className="text-gray-600">Faster vocabulary acquisition</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Revolutionize Your Vocabulary Learning?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who have already transformed their vocabulary learning journey with our scientifically-proven system.
          </p>
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleStartLearning}
          >
            Start Learning Now
          </Button>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

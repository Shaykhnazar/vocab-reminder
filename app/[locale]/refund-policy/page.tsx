'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Separator } from '@/components/shadcn-ui/separator';
import { ArrowLeft } from 'lucide-react';
import {Link} from '@/i18n/navigation';

const RefundPolicyPage = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/pricing" className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pricing
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Refund Policy</CardTitle>
          <CardDescription>Last updated: March 26, 2025</CardDescription>
        </CardHeader>

        <CardContent className="prose max-w-none">
          <section>
            <h2 className="text-xl font-semibold">Overview</h2>
            <p>
              At Vocabry, we are committed to ensuring your satisfaction with our vocabulary learning service.
              This refund policy outlines the terms and conditions for requesting and receiving refunds for
              purchased subscriptions or lifetime access.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold">Free Trial</h2>
            <p>
              All paid plans include a 7-day free trial period. During this period, you can explore all premium
              features without any charge. No payment method is required to start a free trial.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold">Subscription Plans (Monthly and Annual)</h2>

            <h3 className="text-lg font-medium mt-4">Monthly Subscriptions</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>You may request a full refund within 7 days of your initial purchase.</li>
              <li>No refunds will be issued after the 7-day period has elapsed.</li>
              <li>
                Refund requests for monthly subscriptions made after the initial purchase period will not be
                processed, but you can cancel your subscription at any time to prevent future charges.
              </li>
            </ul>

            <h3 className="text-lg font-medium mt-4">Annual Subscriptions</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>You may request a full refund within 14 days of your initial purchase.</li>
              <li>
                After the 14-day period, we may offer a prorated refund for the unused portion of your
                subscription at our discretion.
              </li>
              <li>
                Prorated refunds are calculated based on the time remaining in your subscription period
                and may be subject to an administrative fee.
              </li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold">Lifetime Access</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You may request a full refund within 30 days of your purchase.</li>
              <li>No refunds will be issued after the 30-day period has elapsed.</li>
              <li>
                We reserve the right to refuse a refund if we detect abuse or excessive use of the service
                during the refund eligibility period.
              </li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold">How to Request a Refund</h2>
            <p>
              To request a refund, please contact our support team at <a href="mailto:support@vocabry.com" className="text-blue-600 hover:underline">support@vocabry.com</a> with the following information:
            </p>

            <ol className="list-decimal pl-5 space-y-1">
              <li>Your full name</li>
              <li>Email address associated with your account</li>
              <li>Date of purchase</li>
              <li>Reason for requesting a refund</li>
              <li>Payment method used</li>
            </ol>

            <p className="mt-3">
              We will process your refund request within 5 business days and provide a confirmation email
              once processed.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold">Refund Processing</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Refunds will be issued using the same payment method used for the purchase.</li>
              <li>
                Processing times for refunds depend on your payment provider:
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Credit/debit cards: 5-10 business days</li>
                  <li>PayPal: 3-5 business days</li>
                  <li>Uzbekistan local payment methods (Click, Payme, Uzum): 5-7 business days</li>
                </ul>
              </li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold">Exceptions</h2>
            <p>We reserve the right to deny refund requests in the following cases:</p>

            <ol className="list-decimal pl-5 space-y-1">
              <li>The refund request is made outside the eligible time frame</li>
              <li>Evidence of fraud or abuse of the service</li>
              <li>Violation of our Terms of Service</li>
              <li>Multiple prior refunds for the same customer</li>
            </ol>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold">Promotional or Discounted Purchases</h2>
            <p>
              Special promotional offers, discount codes, or bundled purchases may have different refund terms,
              which will be specified at the time of purchase. Generally, deeply discounted or promotional
              purchases are not eligible for refunds.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold">Account Status After Refund</h2>
            <p>Upon refund:</p>

            <ol className="list-decimal pl-5 space-y-1">
              <li>Your account will be downgraded to the Free plan</li>
              <li>You will retain access to a maximum of 50 words</li>
              <li>Any premium features will no longer be available</li>
            </ol>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold">Changes to Refund Policy</h2>
            <p>
              Vocabry reserves the right to modify this refund policy at any time. Any changes will be
              effective immediately upon posting on our website. It is your responsibility to review this
              policy periodically.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold">Contact Us</h2>
            <p>
              If you have any questions about our refund policy, please contact our support team at:
            </p>

            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                Email: <a href="mailto:support@vocabry.com" className="text-blue-600 hover:underline">support@vocabry.com</a>
              </li>
              <li>
                Contact form: <a href="https://vocabry.com/contact" className="text-blue-600 hover:underline">vocabry.com/contact</a>
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundPolicyPage;

// app/privacy/page.tsx
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Vocabry",
  description: "Privacy policy and data protection information for Vocabry users",
}

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            At Vocabry, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, and protect your personal information when you use our vocabulary learning platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Account Information</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Password (encrypted)</li>
              <li>Profile picture (if provided via Google or Telegram)</li>
            </ul>

            <h3 className="text-xl font-medium">Learning Data</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Words and phrases you add</li>
              <li>Definitions and context</li>
              <li>Study progress and review history</li>
              <li>Learning preferences and settings</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>To provide personalized vocabulary learning experience</li>
            <li>To send review reminders via email and/or Telegram</li>
            <li>To improve our services and user experience</li>
            <li>To communicate important updates about our service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Protection</h2>
          <p className="text-gray-600 leading-relaxed">
            We implement appropriate security measures to protect your personal information:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
            <li>Encryption of sensitive data</li>
            <li>Secure data storage using Supabase</li>
            <li>Regular security audits and updates</li>
            <li>Limited access to personal data by our team</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
          <p className="text-gray-600 leading-relaxed">
            We use the following third-party services:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
            <li>Google Authentication for sign-in</li>
            <li>Telegram for notifications</li>
            <li>Resend for email communications</li>
            <li>QStash for scheduling notifications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="text-gray-600 leading-relaxed">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of communications</li>
            <li>Export your learning data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:support@vocabry.com" className="text-primary hover:underline">
              support@vocabry.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the "last updated" date.
          </p>
          <p className="text-gray-500 mt-4">
            Last updated: February 16, 2025
          </p>
        </section>
      </div>
    </div>
  )
}

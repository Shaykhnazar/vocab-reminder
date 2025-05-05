// app/terms/page.tsx
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Vocabry",
  description: "Terms of service and usage agreement for Vocabry users",
}

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using Vocabry, you agree to be bound by these Terms of Service. If you
            disagree with any part of these terms, you may not access the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
          <p className="text-gray-600 leading-relaxed">
            Vocabry is a learning platform that helps users improve their vocabulary through spaced
            repetition and personalized notifications. We provide:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
            <li>Tools for vocabulary management and learning</li>
            <li>Scheduled review reminders</li>
            <li>Multi-channel notifications (email and Telegram)</li>
            <li>Progress tracking and analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <div className="space-y-4 text-gray-600">
            <p>You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us of any unauthorized access or security breaches</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
          <p className="text-gray-600 leading-relaxed">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
            <li>Use the service for any illegal purposes</li>
            <li>Share account credentials with others</li>
            <li>Attempt to gain unauthorized access to the service</li>
            <li>Upload malicious content or code</li>
            <li>Interfere with other users' access to the service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              The service and its original content, features, and functionality are owned by Vocabry
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              User-generated content remains the property of the user, but you grant us a license to
              use, store, and display such content in connection with the service.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
          <p className="text-gray-600 leading-relaxed">
            We may terminate or suspend your account immediately, without prior notice or liability, for
            any reason, including breach of these Terms. Upon termination, your right to use the service
            will immediately cease.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            Vocabry and its owners, employees, and affiliates shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages resulting from your use of or
            inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to modify or replace these Terms at any time. If a revision is
            material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about these Terms, please contact us at{" "}
            <a href="mailto:support@vocabry.com" className="text-primary hover:underline">
              support@vocabry.com
            </a>
          </p>
        </section>

        <section className="pt-4">
          <p className="text-gray-500">
            Last updated: February 16, 2025
          </p>
        </section>
      </div>
    </div>
  )
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Project Architecture

This is a vocabulary learning application built with Next.js 14 (App Router) with the following key architectural components:

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL via Supabase
- **Authentication**: NextAuth.js with Google OAuth and Telegram Login
- **Internationalization**: next-intl (supports en, ru, uz, de)
- **UI Components**: Radix UI with Tailwind CSS
- **State Management**: Zustand for client state
- **Payment Processing**: Gumroad integration
- **AI/OCR Services**: Multiple AI models for image text extraction

### Core Features
- **Vocabulary Management**: CRUD operations for words with spaced repetition system
- **Subscription System**: Tiered plans with word limits and premium features
- **Multi-channel Notifications**: Email (Resend) and Telegram notifications
- **Image OCR**: Extract vocabulary from images using AI models
- **Internationalization**: Full i18n support with locale-based routing

### Directory Structure
- `app/[locale]/` - Internationalized app routes with nested layouts
  - `(app)/` - Authenticated app pages (dashboard, words, profile, etc.)
  - `(auth)/` - Authentication pages (login, signup)
  - `(marketing)/` - Public pages (landing, pricing, about)
- `components/` - Reusable React components organized by feature
- `lib/` - Core utilities and configurations
  - `supabase.ts` - Database client and subscription logic
  - `auth.ts` - NextAuth configuration and user management
  - `email-templates/` - Email notification templates
- `services/` - External service integrations
  - `ai-models/` - Image OCR service implementations
- `hooks/` - Custom React hooks
- `messages/` - Internationalization message files
- `prisma/` - Database schema (PostgreSQL)

### Key Patterns
- **Spaced Repetition**: Words have review stages (0-6) with increasing intervals
- **Subscription Limits**: Word limits enforced based on user's subscription plan
- **Multi-provider Auth**: Supports email/password, Google OAuth, and Telegram Login
- **Internationalized Routing**: All routes prefixed with locale (`/en/`, `/ru/`, etc.)
- **Real-time Notifications**: Cron jobs for scheduled word reviews via email/Telegram

### Database Schema
- `users` - User accounts with multiple auth providers
- `words` - Vocabulary entries with spaced repetition metadata
- `subscriptions` - User subscription data linked to Gumroad purchases
- `billing_history` - Transaction records

### Environment Requirements
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase configuration
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - Google OAuth
- `TELEGRAM_BOT_TOKEN` - Telegram integration
- `RESEND_API_KEY` - Email notifications
- Gumroad webhook secrets for payment processing

### Testing
- Tests located in `__tests__/` directory with API, component, integration, and lib test suites
- No specific test runner configuration found - check with user for test execution commands

### AI Integration
The application uses multiple AI models for OCR functionality:
- Claude, Gemini, GPT-4 Vision, and ImgOCR services
- Configurable model selection for text extraction from images
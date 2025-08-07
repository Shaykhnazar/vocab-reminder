# Vocab Reminder

A vocabulary learning application built with Next.js 14 that helps users master new words through spaced repetition, image-based text extraction, and multi-channel notifications.

## ✨ Features

- **Spaced Repetition System**: Learn vocabulary efficiently with scientifically-proven spaced intervals
- **Image OCR**: Extract text from images using multiple AI models (Claude, Gemini, GPT-4 Vision, ImgOCR)
- **Multi-Language Support**: Full internationalization with English, Russian, Uzbek, and German
- **Smart Notifications**: Email and Telegram reminders for word reviews
- **Flexible Authentication**: Google OAuth, email/password, and Telegram Login
- **Subscription Management**: Tiered plans with word limits and premium features
- **Real-time Dashboard**: Track learning progress and statistics

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL via Supabase
- **Authentication**: NextAuth.js with multiple providers
- **UI Components**: Radix UI with Tailwind CSS
- **State Management**: Zustand
- **Internationalization**: next-intl
- **Payment Processing**: Gumroad integration
- **Email Service**: Resend
- **Notifications**: Email and Telegram Bot API

## 📁 Project Structure

```
app/[locale]/              # Internationalized routes
├── (app)/                # Authenticated app pages
│   ├── dashboard/        # Learning dashboard
│   ├── words/           # Vocabulary management
│   ├── review/          # Spaced repetition review
│   ├── profile/         # User settings
│   └── billing/         # Subscription management
├── (auth)/              # Authentication pages
└── (marketing)/         # Public landing pages

components/               # Reusable React components
├── auth/                # Authentication forms
├── billing/             # Payment and subscription
├── navigation/          # Navigation components
├── shadcn-ui/          # UI component library
└── subscription/        # Subscription management

lib/                     # Core utilities
├── email-templates/     # Email notification templates
├── stores/              # Zustand state management
├── auth.ts             # NextAuth configuration
└── supabase.ts         # Database client

services/                # External integrations
└── ai-models/          # OCR service implementations

api/                     # API routes
├── auth/               # Authentication endpoints
├── words/              # Vocabulary CRUD operations
├── notifications/      # Email/Telegram notifications
├── subscriptions/      # Payment processing
└── webhooks/           # External service webhooks
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (via Supabase)
- API keys for external services

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_url

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Telegram Integration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Email Service
RESEND_API_KEY=your_resend_api_key

# Payment Processing
GUMROAD_WEBHOOK_SECRET=your_gumroad_webhook_secret

# AI Services (for OCR)
CLAUDE_API_KEY=your_claude_api_key
GOOGLE_AI_API_KEY=your_google_ai_key
OPENAI_API_KEY=your_openai_api_key
```

### Installation & Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

### Build Commands

```bash
npm run build     # Build production application
npm run start     # Start production server
npm run lint      # Run ESLint for code quality
```

## 🎯 Core Features

### Spaced Repetition Algorithm

Words progress through 7 stages (0-6) with increasing review intervals:
- Stage 0: Immediate review
- Stage 1: 1 day
- Stage 2: 3 days  
- Stage 3: 1 week
- Stage 4: 2 weeks
- Stage 5: 1 month
- Stage 6: 3+ months (mastered)

### Image OCR Integration

Extract vocabulary from images using multiple AI models:
- **Claude**: High accuracy for complex text
- **Gemini**: Google's multimodal AI
- **GPT-4 Vision**: OpenAI's vision model
- **ImgOCR**: Specialized OCR service

### Subscription System

Three-tier subscription model:
- **Free**: Limited words, basic features
- **Premium**: Unlimited words, advanced features
- **Pro**: All features + priority support

## 🌍 Internationalization

Fully localized in 4 languages:
- English (`/en/`)
- Russian (`/ru/`)
- Uzbek (`/uz/`)  
- German (`/de/`)

Language-specific routing with locale detection and user preferences.

## 📊 Database Schema

Key entities:
- `users`: User accounts with multi-provider authentication
- `words`: Vocabulary entries with spaced repetition metadata
- `subscriptions`: User subscription data and limits
- `billing_history`: Transaction records and payment history

## 🔐 Authentication

Multiple authentication methods supported:
- **Email/Password**: Traditional authentication
- **Google OAuth**: Social login integration
- **Telegram Login**: Seamless Telegram Web App integration

## 📱 Telegram Integration

- **Mini Web App**: Embedded vocabulary learning within Telegram
- **Bot Notifications**: Scheduled review reminders
- **Seamless Auth**: One-click login for Telegram users

## 🚀 Deployment

The application is optimized for deployment on Vercel with:
- Automatic builds on git push
- Environment variable management
- Edge function support for API routes
- Global CDN distribution

For detailed deployment instructions, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 🧪 Testing

Tests are located in the `__tests__/` directory with coverage for:
- API endpoints
- React components  
- Integration workflows
- Core utilities

## 📄 License

This project is private and proprietary.

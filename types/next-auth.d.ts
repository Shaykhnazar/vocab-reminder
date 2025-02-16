// types/next-auth.d.ts
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string
      name?: string | null
      image?: string | null
      telegram_id?: string | null
      provider?: string
      providerId?: string
    }
  }

  interface User {
    id: string
    email?: string
    name?: string | null
    image?: string | null
    telegram_id?: string | null,
    provider?: string
    providerId?: string
    email_verified?: boolean;
    notification_preferences?: {
      email: boolean;
      telegram: boolean;
    };
  }
}

// Add JWT type extension
declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    providerId?: string;
    telegram_id?: string;
    name?: string;
    image?: string;
  }
}

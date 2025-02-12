// lib/telegram-provider.ts
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";
import crypto from 'crypto';

interface TelegramProfile {
  id: string;
  first_name: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

export default function TelegramProvider(
  config: Omit<OAuthUserConfig<TelegramProfile>, "clientSecret"> & {
    clientSecret: string;
  }
): OAuthConfig<TelegramProfile> {
  return {
    id: "telegram",
    name: "Telegram",
    type: "oauth",
    authorization: "https://oauth.telegram.org/auth",
    token: {
      url: "https://oauth.telegram.org/auth",
      async request({ params }) {
        // Validate Telegram login data
        const { hash, ...fields } = params;

        if (!hash || !fields.auth_date) {
          throw new Error("Missing required Telegram login data");
        }

        // Create check string
        const checkString = Object.entries(fields)
          .filter(([_, value]) => value !== undefined)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}=${value}`)
          .join('\n');

        // Validate hash
        const secret = crypto
          .createHash('sha256')
          .update(process.env.TELEGRAM_BOT_TOKEN!)
          .digest();

        const calculatedHash = crypto
          .createHmac('sha256', secret)
          .update(checkString)
          .digest('hex');

        if (calculatedHash !== hash) {
          throw new Error("Invalid Telegram authentication data");
        }

        return { tokens: { access_token: calculatedHash } };
      }
    },
    userinfo: {
      url: "https://oauth.telegram.org/userinfo",
      // async request({ provider }) {
      //   // Since we already validated in the token step,
      //   // we can just return the user data we got from the authorization
      //   return provider.clientId;
      // }
    },
    profile(profile) {
      return {
        id: profile.id,
        name: profile.username || profile.first_name || profile.id,
        email: `${profile.id}@telegram.placeholder`,
        image: profile.photo_url,
      };
    }
  };
}

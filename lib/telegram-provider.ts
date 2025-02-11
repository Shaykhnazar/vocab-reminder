// lib/telegram-provider.ts
import type { OAuthUserConfig } from "next-auth/providers/oauth";
import crypto from 'crypto';

interface TelegramProfile {
  id: string;
  first_name: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
}

export default function TelegramProvider(
  options: Omit<OAuthUserConfig<TelegramProfile>, "clientSecret"> & {
    clientSecret: string;
  }
): {
  authorization: { params: { scope: string } };
  checks: string[];
  profile(profile: TelegramProfile): { image: string | undefined; name: string; id: string; email: null };
  name: string;
  id: string;
  type: string;
  authorize(params: never): Promise<{ image: string | undefined; name: string; id: string; email: null }>;
  userinfo: { request: () => null };
  token: { request: () => null }
} {
  return {
    id: "telegram",
    name: "Telegram",
    type: "oauth",
    authorization: { params: { scope: "" } },
    token: { request: () => null },
    userinfo: { request: () => null },
    profile(profile: TelegramProfile) {
      return {
        id: profile.id,
        name: profile.username || profile.first_name,
        email: null,
        image: profile.photo_url,
      };
    },
    checks: ["state"],
    async authorize(params) {
      const { data_check_string, hash } = params;

      if (!data_check_string || !hash) {
        throw new Error("Missing authentication data");
      }

      // Validate Telegram authentication data
      const secret = crypto
        .createHash('sha256')
        .update(options.clientSecret)
        .digest();

      const calculatedHash = crypto
        .createHmac('sha256', secret)
        .update(data_check_string)
        .digest('hex');

      if (calculatedHash !== hash) {
        throw new Error("Invalid authentication data");
      }

      const data = Object.fromEntries(
        new URLSearchParams(data_check_string)
      ) as unknown as TelegramProfile;

      return {
        id: data.id,
        name: data.username || data.first_name,
        email: null,
        image: data.photo_url,
      };
    },
  };
}

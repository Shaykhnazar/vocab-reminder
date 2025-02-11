// lib/telegram-provider.ts
import type {OAuthConfig, OAuthUserConfig, Provider} from "next-auth/providers";
import crypto from 'crypto';

export default function TelegramProvider(options: {
  clientId: string;
  clientSecret: string;
}): Provider {
  return {
    id: "telegram",
    name: "Telegram",
    type: "oauth",
    wellKnown: null,
    authorization: { params: { scope: "" } },
    token: null,
    userinfo: null,
    profile(profile) {
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
      );

      return {
        id: data.id,
        name: data.username || data.first_name,
        image: data.photo_url,
      };
    },
  };
}

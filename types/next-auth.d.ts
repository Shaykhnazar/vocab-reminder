// types/next-auth.d.ts
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      telegramId?: string | null
      provider?: string
      providerId?: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    telegramId?: string | null,
    provider?: string
    providerId?: string
  }
}

// lib/auth.ts
import { compare, hash } from 'bcryptjs';
import {supabase, User} from './supabase';
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { objectToAuthDataMap, AuthDataValidator } from "@telegram-auth/server";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await findUserByEmail(credentials.email);
        if (!user) throw new Error('No user found');

        const isValid = await validatePassword(user, credentials.password);
        if (!isValid) throw new Error('Invalid password');

        return {
          id: user.id,
          email: user.email,
        };
      }
    }),
    CredentialsProvider({
      id: "telegram-login",
      name: "Telegram Login",
      credentials: {},
      async authorize(credentials, req) {
        const validator = new AuthDataValidator({
          botToken: process.env.TELEGRAM_BOT_TOKEN!,
        });

        const data = objectToAuthDataMap(req.query || {});
        const user = await validator.validate(data);

        if (user.id && user.first_name) {
          // Check if user exists in your database
          const existingUser = await findUserByTelegramId(user.id.toString());

          if (!existingUser) {
            // Create new user if doesn't exist
            await createTelegramUser({
              telegramId: user.id.toString(),
              firstName: user.first_name,
              lastName: user.last_name || "",
              username: user.username || "",
              photoUrl: user.photo_url || "",
            });
          }

          return {
            id: user.id.toString(),
            name: [user.first_name, user.last_name || ""].join(" "),
            image: user.photo_url,
            email: `${user.id}@telegram.user`, // Create a placeholder email
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const { data: existingUser } = await supabase
          .from('users')
          .select()
          .eq('email', user.email)
          .single();

        if (!existingUser) {
          const { error } = await supabase.from('users').insert({
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            provider: 'google',
            provider_id: profile?.sub,
            created_at: new Date(),
          });

          if (error) return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        token.provider = account.provider;
        token.providerId = profile?.sub;
      }
      if (account?.provider === "telegram-login") {
        token.telegramId = user.id;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        const user = await findUserByEmail(token.email);
        if (user) {
          session.user.id = user.id;
          session.user.email = user.email;
          session.user.provider = token.provider as string;
          session.user.providerId = token.providerId as string;
        }
      }
      if (token.telegramId) {
        session.user.telegramId = token.telegramId as string;
        session.user.name = token.name;
        session.user.image = token.image as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
};

export async function createUser(email: string, password: string) {
  try {
    const hashedPassword = await hash(password, 12);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          created_at: new Date(),
        }
      ])
      .select()
      .single();

    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function findUserByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

export async function validatePassword(user: User, password: string) {
  if (!user?.password) {
    throw new Error('User password is missing');
  }
  const isValid = await compare(password, user.password);
  return isValid;
}


// Add these new functions to handle Telegram users
async function createTelegramUser({
  telegramId,
  firstName,
  lastName,
  username,
  photoUrl,
}: {
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
  photoUrl: string;
}) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          telegramId: telegramId,
          first_name: firstName,
          last_name: lastName,
          username: username,
          photo_url: photoUrl,
          created_at: new Date(),
        }
      ])
      .select()
      .single();

    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data;
  } catch (error) {
    throw error;
  }
}

async function findUserByTelegramId(telegramId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegramId', telegramId)
      .single();

    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error finding user by Telegram ID:', error);
    return null;
  }
}


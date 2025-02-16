// lib/auth.ts
import { compare, hash } from 'bcryptjs';
import {supabase, User} from './supabase';
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { objectToAuthDataMap, AuthDataValidator } from "@telegram-auth/server";
import GoogleProvider from "next-auth/providers/google";
import {generateVerificationToken, hashToken} from "@/lib/token";
import {sendVerificationEmail, sendPasswordResetEmail} from "@/lib/email";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

        if (!user.email_verified) {
          throw new Error('Please verify your email address');
        }

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
      // Auto-verify Google users' email
      if (account?.provider === 'google') {
        const { data: existingUser } = await supabase
          .from('users')
          .select()
          .eq('email', user.email)
          .single();

        if (!existingUser) {
          const { error } = await supabase.from('users').insert({
            email: user.email,
            email_verified: true, // Google accounts are pre-verified
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
    const verificationToken = generateVerificationToken();
    const hashedToken = hashToken(verificationToken);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          verification_token: hashedToken,
          verification_token_expires: tokenExpiry,
          email_verified: false,
          created_at: new Date(),
        }
      ])
      .select()
      .single();

    if (error) {
      // Handle other potential Supabase errors
      if (error.code === '23505') { // Unique constraint error
        throw new Error('This email is already registered. Please sign in instead.');
      }
      throw new Error(`Failed to create account. Please try again.`);
    }

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

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

export async function verifyEmail(token: string) {
  try {
    const hashedToken = hashToken(token);

    // Find user with matching token that hasn't expired
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('verification_token', hashedToken)
      .gt('verification_token_expires', new Date())
      .single();

    if (error || !user) {
      throw new Error('Invalid or expired verification token');
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires: null,
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
}

export async function generatePasswordResetToken(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("No user found with this email");
  }

  // Generate reset token
  const resetToken = generateVerificationToken();
  const hashedToken = hashToken(resetToken);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Save token to database
  const { error } = await supabase
    .from('users')
    .update({
      reset_token: hashedToken,
      reset_token_expires: expires,
    })
    .eq('id', user.id);

  if (error) {
    throw new Error("Error generating reset token");
  }

  // Send reset email
  await sendPasswordResetEmail(email, resetToken);

  return true;
}

export async function resetPassword(token: string, newPassword: string) {
  const hashedToken = hashToken(token);

  // Find user with valid token
  const { data: user, error } = await supabase
    .from('users')
    .select()
    .eq('reset_token', hashedToken)
    .gt('reset_token_expires', new Date())
    .single();

  if (error || !user) {
    throw new Error("Invalid or expired reset token");
  }

  // Hash new password
  const hashedPassword = await hash(newPassword, 12);

  // Update user password and remove reset token
  const { error: updateError } = await supabase
    .from('users')
    .update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    })
    .eq('id', user.id);

  if (updateError) {
    throw new Error("Error resetting password");
  }

  return true;
}

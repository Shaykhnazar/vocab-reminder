import { compare, hash } from 'bcryptjs';
import {supabase, User} from './supabase';
import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
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
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Add user ID to the token
        token.email = user.email; // Add email to the token
      }
      return token;
    },
    async session({ session, token }) {
      // Fetch user role from the token if available, else fetch from DB
      if (token?.email) {
        const user = await findUserByEmail(token.email);
        if (user) {
          session.user.id = user.id; // Add user ID to the session
          session.user.email = user.email; // Add email to the session
        }
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

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
        try {
          const validator = new AuthDataValidator({
            botToken: process.env.TELEGRAM_BOT_TOKEN!,
          });

          const data = objectToAuthDataMap(req.query || {});
          console.log('Telegram auth data:', data); // Debug log

          const telegramUser = await validator.validate(data);
          console.log('Validated Telegram user:', telegramUser);

          if (telegramUser.id && telegramUser.first_name) {
            // Check if user exists
            let dbUser = await findUserByTelegramId(telegramUser.id.toString());

            if (dbUser) {
              console.log('Existing user found:', dbUser);
              // User exists - return existing user data
              return {
                id: dbUser.id,
                name: [dbUser.first_name, dbUser.last_name || ""].join(" "),
                image: dbUser.photo_url,
                telegram_id: dbUser.telegram_id,
              };
            } else {
              console.log('No existing user found, creating new user');
              // Create new user if doesn't exist
              dbUser = await createTelegramUser({
                telegram_id: telegramUser.id.toString(),
                firstName: telegramUser.first_name,
                lastName: telegramUser.last_name || "",
                username: telegramUser.username || "",
                photoUrl: telegramUser.photo_url || "",
              });

              if (!dbUser) {
                console.error('Failed to create Telegram user');
                return null;
              }

              return {
                id: dbUser.id,
                name: [telegramUser.first_name, telegramUser.last_name || ""].join(" "),
                image: telegramUser.photo_url,
                telegram_id: dbUser.telegram_id,
              };
            }
          }
          return null;
        } catch (error) {
          console.error('Error in Telegram authorize:', error);
          return null;
        }
      }
    }),
    CredentialsProvider({
      id: "telegram-webapp",
      name: "Telegram Web App",
      credentials: {},
      async authorize(credentials, req) {
        try {
          console.log('Telegram Web App auth attempt:', req.query);

          // Check if we have the new format with initData string
          const initDataString = req.query?.initData as string;
          let validationData: any;
          let telegramId: string;
          let firstName: string;
          let lastName: string = '';
          let username: string = '';
          let photoUrl: string = '';
          let decodedInitData: string = '';

          if (initDataString) {
            // New format: raw initData string
            console.log('Using raw initData string for validation');
            
            // Decode the URL-encoded initData string first
            decodedInitData = decodeURIComponent(initDataString);
            console.log('Decoded initData:', decodedInitData);
            
            // Parse the initData string to get individual parameters
            const params = new URLSearchParams(decodedInitData);
            validationData = Object.fromEntries(params.entries());
            
            // Extract user data from the parsed parameters
            const userString = params.get('user');
            if (userString) {
              const user = JSON.parse(userString);
              telegramId = user.id.toString();
              firstName = user.first_name;
              lastName = user.last_name || '';
              username = user.username || '';
              photoUrl = user.photo_url || '';
            } else {
              console.error('No user data in initData string');
              return null;
            }
          } else {
            // Fallback: old format with individual query parameters
            console.log('Using individual query parameters for validation');
            validationData = req.query || {};
            telegramId = req.query?.id as string;
            firstName = req.query?.first_name as string;
            lastName = req.query?.last_name as string || '';
            username = req.query?.username as string || '';
            photoUrl = req.query?.photo_url as string || '';
          }

          // Validate Web App data using server-side validation
          const rawDataForValidation = initDataString ? decodedInitData : 
            new URLSearchParams(validationData).toString();
          
          const isValid = await validateTelegramWebAppDataServer(rawDataForValidation);
          if (!isValid) {
            console.error('Invalid Telegram Web App data');
            return null;
          }

          if (!telegramId || !firstName) {
            console.error('Missing required Telegram Web App data');
            return null;
          }

          // Check if user exists
          let dbUser = await findUserByTelegramId(telegramId);

          if (dbUser) {
            console.log('Existing Telegram Web App user found:', dbUser.id);
            return {
              id: dbUser.id,
              name: [dbUser.first_name, dbUser.last_name || ""].join(" "),
              image: dbUser.photo_url,
              telegram_id: dbUser.telegram_id,
            };
          } else {
            console.log('Creating new Telegram Web App user');
            dbUser = await createTelegramUser({
              telegram_id: telegramId,
              firstName: firstName,
              lastName: lastName,
              username: username,
              photoUrl: photoUrl,
            });

            if (!dbUser) {
              console.error('Failed to create Telegram Web App user');
              return null;
            }

            return {
              id: dbUser.id,
              name: [firstName, lastName].join(" "),
              image: photoUrl,
              telegram_id: dbUser.telegram_id,
            };
          }
        } catch (error) {
          console.error('Error in Telegram Web App authorize:', error);
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Auto-verify Google users' email
        if (account?.provider === 'google') {
          // First check if user exists
          const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select()
            .eq('email', user.email)
            .single();

          if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error checking existing user:', findError);
            return false;
          }

          // If user doesn't exist, create new user
          if (!existingUser) {
            const { error: insertError } = await supabase.from('users').insert({
              email: user.email,
              email_verified: true, // Google accounts are pre-verified
              first_name: user.name,
              photo_url: user.image,
              provider: 'google',
              provider_id: profile?.sub,
              created_at: new Date().toISOString(), // Use ISO string format
            });

            if (insertError) {
              console.error('Error creating user:', insertError);
              return false;
            }
          }
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        token.provider = account.provider;
        token.providerId = profile?.sub;
      }
      if (account?.provider === "telegram-login") {
        token.telegram_id = user.telegram_id || user.id;
        token.name = user.name || "";
        token.image = user.image || "";
      }
      return token;
    },
    async session({ session, token }) {
      try {
        if (token?.email) {
          const user = await findUserByEmail(token.email);
          if (user) {
            session.user.id = user.id;
            session.user.email = user.email;
            session.user.provider = token.provider as string;
            session.user.providerId = token.providerId as string;
          }
        }
        if (token.telegram_id) {
          // Find user by telegram_id instead of creating a new one
          const user = await findUserByTelegramId(token.telegram_id);
          if (user) {
            session.user.id = user.id;
            session.user.telegram_id = user.telegram_id;
            session.user.name = token.name || '';
            session.user.image = token.image || '';
          }
        }
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session; // Return session even if there's an error
      }
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
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          verification_token: hashedToken,
          verification_token_expires: tokenExpiry,
          email_verified: false,
          created_at: new Date().toISOString(),
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
    console.log('Finding user by email:', email);

    if (!email) {
      console.log('No email provided');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1); // Add limit to handle multiple results

    if (error) {
      console.error('Supabase query error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    // Handle case where no user is found
    if (!data || data.length === 0) {
      console.log('No user found with email:', email);
      return null;
    }

    return data[0];
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
  telegram_id,
  firstName,
  lastName,
  username,
  photoUrl,
}: {
  telegram_id: string;
  firstName: string;
  lastName: string;
  username: string;
  photoUrl: string;
}) {
  try {
    console.log('Creating new Telegram user:', { telegram_id, firstName });

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          telegram_id: telegram_id,
          first_name: firstName,
          last_name: lastName,
          username: username,
          photo_url: photoUrl,
          // email_verified: true, // Telegram users are pre-verified
          created_at: new Date().toISOString(),
          provider: 'telegram',
          // password: await hash(generateVerificationToken(), 12), // Generate random password
          notification_preferences: {
            email: false,
            telegram: true
          }
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating Telegram user:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createTelegramUser:', error);
    throw error;
  }
}

async function findUserByTelegramId(telegram_id: string) {
  try {
    // Add a log to debug the telegram_id value
    console.log('Searching for Telegram user with ID:', telegram_id);

    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, username, email, telegram_id, photo_url, notification_preferences')
      .eq('telegram_id', telegram_id)
      .limit(1);

    if (error) {
      console.error('Supabase query error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    // Handle case where no user is found
    if (!data || data.length === 0) {
      console.log('No user found with Telegram ID:', telegram_id);
      return null;
    }

    // Return the first matching user
    return data[0];
  } catch (error) {
    console.error('Error finding user by Telegram ID:', error);
    return null;
  }
}

export async function verifyEmail(token: string) {
  try {
    const hashedToken = hashToken(token);
    const now = new Date().toISOString();

    // Find user with matching token that hasn't expired
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('verification_token', hashedToken)
      .gt('verification_token_expires', now)
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
  // Use UTC ISO string for the expiry date
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

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
  const now = new Date().toISOString();

  // Find user with valid token using ISO string for date comparison
  const { data: user, error } = await supabase
    .from('users')
    .select()
    .eq('reset_token', hashedToken)
    .gt('reset_token_expires', now)
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

/**
 * Server-side validation of Telegram Web App data
 * Based on official Telegram Mini Apps documentation
 */
export async function validateTelegramWebAppDataServer(rawInitData: string): Promise<boolean> {
  try {
    console.log('validateTelegramWebAppDataServer: Validating raw initData:', rawInitData);
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not set');
      return false;
    }

    // Parse the raw initData to get all parameters
    const params = new URLSearchParams(rawInitData);
    const hash = params.get('hash');
    const authDateStr = params.get('auth_date');
    
    if (!hash || !authDateStr) {
      console.error('Missing hash or auth_date in Telegram Web App data');
      return false;
    }

    // Check if auth_date is not too old (24 hours)
    const now = Math.floor(Date.now() / 1000);
    const authTimestamp = parseInt(authDateStr);
    const maxAge = 24 * 60 * 60; // 24 hours in seconds

    console.log('validateTelegramWebAppDataServer: Time validation:', {
      now,
      authTimestamp,
      age: now - authTimestamp,
      maxAge,
      isValid: (now - authTimestamp) <= maxAge
    });

    if (now - authTimestamp > maxAge) {
      console.error('Telegram Web App data is too old');
      return false;
    }

    // Create data-check-string according to Telegram docs:
    // 1. Create key=value pairs for all parameters except hash
    // 2. Sort them alphabetically by key
    // 3. Join with \n
    const dataCheckArray: string[] = [];
    
    for (const [key, value] of params.entries()) {
      if (key !== 'hash') {
        dataCheckArray.push(`${key}=${value}`);
      }
    }
    
    // Sort alphabetically by key
    dataCheckArray.sort();
    const dataCheckString = dataCheckArray.join('\n');

    console.log('validateTelegramWebAppDataServer: Data check string:', dataCheckString);

    // Create secret key using two-stage HMAC as per Telegram docs
    const crypto = require('crypto');
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Create hash using the secret key
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare hashes
    const isValid = calculatedHash === hash;
    
    console.log('validateTelegramWebAppDataServer: Hash validation:', {
      calculated: calculatedHash,
      received: hash,
      isValid
    });
    
    if (!isValid) {
      console.error('Telegram Web App hash validation failed');
      console.error('Expected:', calculatedHash);
      console.error('Received:', hash);
      console.error('Data check string:', dataCheckString);
    }

    return isValid;
  } catch (error) {
    console.error('Error validating Telegram Web App data:', error);
    return false;
  }
}

// lib/telegram-auth-handler.ts
"use client"

import { TelegramWebAppUser, TelegramWebAppInitData } from './telegram-webapp';
import { validateTelegramWebAppDataServer } from './auth';
import { supabase, User } from './supabase';

export interface TelegramAuthResult {
  success: boolean;
  user?: User;
  telegramUser?: TelegramWebAppUser;
  error?: string;
  isNewUser?: boolean;
}

/**
 * Handle Telegram Web App authentication similar to your Laravel TelegramUserHandler
 * This mimics your PHP middleware functionality
 */
export class TelegramAuthHandler {
  private isDev: boolean;

  constructor(isDev: boolean = false) {
    this.isDev = isDev;
  }

  /**
   * Main handler that processes Telegram authentication data
   * Similar to your handleRequest method in PHP
   */
  async handleTelegramAuth(
    initDataString: string,
    initData: TelegramWebAppInitData
  ): Promise<TelegramAuthResult> {
    try {
      console.log('🚀 TelegramAuthHandler: Starting authentication process');
      
      if (!initDataString) {
        console.warn('❌ No Telegram user data provided');
        return {
          success: false,
          error: 'No Telegram user data provided'
        };
      }

      if (!initData.user) {
        console.warn('❌ No user data in Telegram header');
        return {
          success: false,
          error: 'Invalid Telegram user data'
        };
      }

      const telegramUser = initData.user;
      const telegramId = telegramUser.id;

      if (!telegramId || telegramId <= 0) {
        console.warn('❌ Invalid Telegram ID:', telegramId);
        return {
          success: false,
          error: 'Invalid Telegram ID'
        };
      }

      // Validate the initData unless in dev mode
      if (!this.isDev) {
        const isValid = await validateTelegramWebAppDataServer(initDataString);
        if (!isValid) {
          console.error('❌ Telegram Web App data validation failed');
          return {
            success: false,
            error: 'Invalid Telegram authentication data'
          };
        }
      } else {
        console.log('⚠️ DEV MODE: Skipping Telegram data validation');
      }

      // Find or create user
      const existingUser = await this.findUserByTelegramId(telegramId.toString());
      let user: User;
      let isNewUser = false;

      if (!existingUser) {
        // Create new user
        console.log('📝 Creating new user for Telegram ID:', telegramId);
        user = await this.createTelegramUser(telegramUser);
        isNewUser = true;

        console.log('✅ Created new user:', {
          telegram_id: telegramId,
          user_id: user.id,
          name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`,
          dev_mode: this.isDev
        });
      } else {
        // Update existing user info if needed
        user = await this.updateExistingUser(existingUser, telegramUser);
        
        console.log('🔄 Updated existing user:', {
          telegram_id: telegramId,
          user_id: user.id,
          dev_mode: this.isDev
        });
      }

      console.log('✅ Telegram user processed successfully:', {
        telegram_id: telegramId,
        user_id: user.id,
        is_new_user: isNewUser,
        dev_mode: this.isDev
      });

      return {
        success: true,
        user,
        telegramUser,
        isNewUser
      };

    } catch (error: any) {
      console.error('❌ Error processing Telegram user data:', {
        error: error.message,
        stack: error.stack,
        dev_mode: this.isDev
      });

      return {
        success: false,
        error: this.isDev ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Find user by Telegram ID
   */
  private async findUserByTelegramId(telegramId: string): Promise<User | null> {
    try {
      console.log('🔍 Searching for Telegram user with ID:', telegramId);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .limit(1);

      if (error) {
        console.error('❌ Supabase query error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No user found with Telegram ID:', telegramId);
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('❌ Error finding user by Telegram ID:', error);
      throw error;
    }
  }

  /**
   * Create new Telegram user
   */
  private async createTelegramUser(telegramUser: TelegramWebAppUser): Promise<User> {
    try {
      const fullName = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
      
      console.log('📝 Creating new Telegram user:', {
        telegram_id: telegramUser.id,
        name: fullName
      });

      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            telegram_id: telegramUser.id.toString(),
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name || '',
            username: telegramUser.username || null,
            photo_url: telegramUser.photo_url || null,
            created_at: new Date().toISOString(),
            provider: 'telegram',
            notification_preferences: {
              email: false,
              telegram: true
            }
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Telegram user:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Error in createTelegramUser:', error);
      throw error;
    }
  }

  /**
   * Update existing user with new Telegram data if needed
   */
  private async updateExistingUser(existingUser: User, telegramUser: TelegramWebAppUser): Promise<User> {
    try {
      const needsUpdate = this.checkIfUserNeedsUpdate(existingUser, telegramUser);
      
      if (!needsUpdate.hasChanges) {
        console.log('ℹ️ No updates needed for existing user');
        return existingUser;
      }

      console.log('🔄 Updating existing user info:', needsUpdate.updates);

      const { data, error } = await supabase
        .from('users')
        .update(needsUpdate.updates)
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Error updating existing user:', error);
      throw error;
    }
  }

  /**
   * Check if user needs updating and return the updates needed
   */
  private checkIfUserNeedsUpdate(existingUser: User, telegramUser: TelegramWebAppUser): {
    hasChanges: boolean;
    updates: Partial<User>;
  } {
    const updates: Partial<User> = {};
    let hasChanges = false;

    // Update username if changed
    if (telegramUser.username && existingUser.username !== telegramUser.username) {
      updates.username = telegramUser.username;
      hasChanges = true;
    }

    // Update photo if changed
    if (telegramUser.photo_url && existingUser.photo_url !== telegramUser.photo_url) {
      updates.photo_url = telegramUser.photo_url;
      hasChanges = true;
    }

    // Update name if changed
    const newFirstName = telegramUser.first_name;
    const newLastName = telegramUser.last_name || '';
    
    if (existingUser.first_name !== newFirstName) {
      updates.first_name = newFirstName;
      hasChanges = true;
    }
    
    if (existingUser.last_name !== newLastName) {
      updates.last_name = newLastName;
      hasChanges = true;
    }

    return { hasChanges, updates };
  }
}

// Create instances for production and development
export const telegramAuthHandler = new TelegramAuthHandler(false);
export const telegramAuthHandlerDev = new TelegramAuthHandler(true);

/**
 * Convenience function to handle Telegram authentication
 */
export async function handleTelegramWebAppAuth(
  initDataString: string,
  initData: TelegramWebAppInitData,
  isDev: boolean = false
): Promise<TelegramAuthResult> {
  const handler = isDev ? telegramAuthHandlerDev : telegramAuthHandler;
  return handler.handleTelegramAuth(initDataString, initData);
}
import { compare, hash } from 'bcryptjs';
import {supabase, User} from './supabase';

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

import { supabase } from './supabase';
import { User } from '../types';

export interface AuthError extends Error {
  status?: number;
  code?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Enhanced sign up with better error handling
export const signUpUser = async ({ email, password, name, phone }: SignUpData) => {
  try {
    // Validate input
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    if (name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      throw new Error('Phone number must be exactly 10 digits');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          phone: phone?.trim() || null
        }
      }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Enhanced sign in with better error handling
export const signInUser = async ({ email, password }: SignInData) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current authenticated user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    return null;
  }
};

// Check if user is admin
export const checkIsAdmin = async (userId?: string): Promise<boolean> => {
  try {
    let targetUserId = userId;
    
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', targetUserId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin === true;
  } catch (error) {
    console.error('Error in checkIsAdmin:', error);
    return false;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Update password
export const updatePassword = async (newPassword: string) => {
  try {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  } catch (error: any) {
    console.error('Error updating password:', error);
    throw error;
  }
};
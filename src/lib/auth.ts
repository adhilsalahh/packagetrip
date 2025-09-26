import { supabase } from './supabase';
import { User } from '../types';
import { logUserActivity } from './userActivity';

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

// Helper function to safely get session
const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Session retrieval error:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.warn('Failed to get session:', error);
    return null;
  }
};

// Helper function to safely get user
const getUser = async () => {
  try {
    // First check if we have a session
    const session = await getSession();
    if (!session) {
      return null;
    }

    // Then get user data
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.warn('User retrieval error:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.warn('Failed to get user:', error);
    return null;
  }
};

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

    // Log successful registration attempt
    if (data.user) {
      try {
        await logUserActivity(data.user.id, 'registration_attempt', 'User completed registration form', {
          email: email.toLowerCase().trim(),
          has_phone: !!phone
        });
      } catch (logError) {
        console.warn('Failed to log registration activity:', logError);
      }
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

    // Log successful sign in
    if (data.user) {
      try {
        await logUserActivity(data.user.id, 'sign_in', 'User signed in successfully', {
          email: email.toLowerCase().trim(),
          sign_in_method: 'email_password'
        });
      } catch (logError) {
        console.warn('Failed to log sign in activity:', logError);
      }
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
    // Get current user before signing out
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Log sign out activity
    if (user) {
      try {
        await logUserActivity(user.id, 'sign_out', 'User signed out');
      } catch (logError) {
        console.warn('Failed to log sign out activity:', logError);
      }
    }
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current authenticated user with proper session handling
export const getCurrentUser = async () => {
  return await getUser();
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<User | null> => {
  try {
    const user = await getUser();
    
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
      const user = await getUser();
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
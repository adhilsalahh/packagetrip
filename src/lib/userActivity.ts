import { supabase } from './supabase';

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserProfileWithStats {
  profile: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar_url?: string;
    bio?: string;
    date_of_birth?: string;
    emergency_contact?: string;
    preferences?: Record<string, any>;
    is_admin?: boolean;
    created_at: string;
    updated_at: string;
  };
  booking_stats: {
    total_bookings: number;
    confirmed_bookings: number;
    completed_bookings: number;
    pending_bookings: number;
    total_spent: number;
    last_booking_date?: string;
  };
  activity_stats: {
    total_activities: number;
    last_activity?: string;
    registration_date?: string;
  };
}

// Log user activity
export const logUserActivity = async (
  userId: string,
  activityType: string,
  description?: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_user_activity', {
      p_user_id: userId,
      p_activity_type: activityType,
      p_description: description,
      p_metadata: metadata || {}
    });

    if (error) {
      console.error('Error logging user activity:', error);
    }
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
};

// Get user activity history
export const getUserActivityHistory = async (
  userId: string,
  limit: number = 50
): Promise<UserActivity[]> => {
  try {
    const { data, error } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
};

// Get user profile with comprehensive stats
export const getUserProfileWithStats = async (userId: string): Promise<UserProfileWithStats | null> => {
  try {
    const { data, error } = await supabase.rpc('get_user_profile_with_stats', {
      p_user_id: userId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile with stats:', error);
    return null;
  }
};

// Update user profile with activity logging
export const updateUserProfileWithLogging = async (
  userId: string,
  updates: Partial<{
    name: string;
    phone: string;
    avatar_url: string;
    bio: string;
    date_of_birth: string;
    emergency_contact: string;
    preferences: Record<string, any>;
  }>
): Promise<any> => {
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

    // Log profile update activity
    await logUserActivity(
      userId,
      'profile_update',
      'User updated their profile',
      {
        updated_fields: Object.keys(updates),
        update_count: Object.keys(updates).length
      }
    );

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Track user session activity
export const trackUserSession = async (userId: string): Promise<void> => {
  try {
    await logUserActivity(
      userId,
      'session_activity',
      'User session activity tracked',
      {
        timestamp: new Date().toISOString(),
        page: window.location.pathname
      }
    );
  } catch (error) {
    console.error('Error tracking user session:', error);
  }
};

// Get user dashboard stats
export const getUserDashboardStats = async (userId: string) => {
  try {
    const profileWithStats = await getUserProfileWithStats(userId);
    if (!profileWithStats) return null;

    const recentActivity = await getUserActivityHistory(userId, 10);

    return {
      ...profileWithStats,
      recent_activity: recentActivity
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
};
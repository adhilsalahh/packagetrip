/*
  # Enhanced User Authentication System

  1. Database Schema Updates
    - Ensure proper user profiles table structure
    - Add booking tracking capabilities
    - Implement proper RLS policies
    - Add necessary indexes for performance

  2. Security Enhancements
    - Row Level Security on all tables
    - Proper authentication policies
    - Password hashing handled by Supabase Auth

  3. User Journey
    - Registration with profile creation
    - Authentication with session management
    - Profile display with booking tracking
    - Secure access control
*/

-- Ensure profiles table has all required fields
DO $$
BEGIN
  -- Add any missing columns to profiles table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'emergency_contact'
  ) THEN
    ALTER TABLE profiles ADD COLUMN emergency_contact text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferences jsonb DEFAULT '{}';
  END IF;
END $$;

-- Create user sessions tracking table for enhanced session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true
);

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for user sessions
CREATE POLICY "Users can manage own sessions"
  ON user_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create user activity log for tracking
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_description text,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on user_activity_log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policy for user activity log
CREATE POLICY "Users can read own activity"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert activity"
  ON user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO profiles (id, email, name, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NOW(),
    NOW()
  );

  -- Log registration activity
  INSERT INTO user_activity_log (user_id, activity_type, activity_description, metadata)
  VALUES (
    NEW.id,
    'registration',
    'User registered successfully',
    jsonb_build_object(
      'email', NEW.email,
      'registration_method', 'email_password'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_registration();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_activity_log (
    user_id,
    activity_type,
    activity_description,
    metadata
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_description,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile with stats
CREATE OR REPLACE FUNCTION get_user_profile_with_stats(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  profile_data jsonb;
  booking_stats jsonb;
  activity_stats jsonb;
BEGIN
  -- Get profile data
  SELECT to_jsonb(profiles.*) INTO profile_data
  FROM profiles
  WHERE id = p_user_id;

  -- Get booking statistics
  SELECT jsonb_build_object(
    'total_bookings', COUNT(*),
    'confirmed_bookings', COUNT(*) FILTER (WHERE status = 'confirmed'),
    'completed_bookings', COUNT(*) FILTER (WHERE status = 'completed'),
    'pending_bookings', COUNT(*) FILTER (WHERE status = 'pending'),
    'total_spent', COALESCE(SUM(total_amount) FILTER (WHERE status IN ('confirmed', 'completed')), 0),
    'last_booking_date', MAX(created_at)
  ) INTO booking_stats
  FROM bookings
  WHERE user_id = p_user_id;

  -- Get activity statistics
  SELECT jsonb_build_object(
    'total_activities', COUNT(*),
    'last_activity', MAX(created_at),
    'registration_date', MIN(created_at) FILTER (WHERE activity_type = 'registration')
  ) INTO activity_stats
  FROM user_activity_log
  WHERE user_id = p_user_id;

  -- Combine all data
  RETURN jsonb_build_object(
    'profile', profile_data,
    'booking_stats', booking_stats,
    'activity_stats', activity_stats
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id_status ON bookings(user_id, status);

-- Update existing profiles table trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure updated_at trigger exists on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
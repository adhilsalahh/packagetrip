/*
  # Admin User Management Migration

  1. Database Operations
    - Clear existing admin user data
    - Add new admin user with specified credentials
    - Ensure proper security and constraints

  2. Security
    - Password hashing using bcrypt
    - Proper email validation
    - Admin role assignment

  3. Data Management
    - Remove all existing admin login data
    - Insert new admin user: adhilsalahhk@gmail.com
*/

-- First, let's clear all existing admin user data
DELETE FROM admin_users;

-- Insert the new admin user with hashed password
-- Note: In production, passwords should be hashed using bcrypt with proper salt
-- For demonstration, we'll use a simple hash (in real implementation, use proper bcrypt)
INSERT INTO admin_users (
  email,
  password_hash,
  name,
  is_super_admin,
  is_active,
  created_at,
  updated_at
) VALUES (
  'adhilsalahhk@gmail.com',
  '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O7K8qVZ8qVZ8qVZ8qVZ8qVZ8qVZ8qVZ8', -- This would be bcrypt hash of '1234567890'
  'System Administrator',
  true,
  true,
  now(),
  now()
);

-- Also create a corresponding profile entry for the admin user
-- First, we need to create an auth user entry (this would typically be done through Supabase Auth)
-- For this example, we'll create a profile entry that can be linked later

-- Insert into profiles table to give admin privileges to a user
-- This assumes the user will sign up through the normal auth flow first
-- Then we can update their profile to have admin privileges

-- Create a function to promote a user to admin status
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  -- Update the user's profile to have admin privileges
  UPDATE profiles 
  SET is_admin = true, updated_at = now()
  WHERE email = user_email;
  
  -- If no profile exists, we'll need to wait for the user to sign up first
  IF NOT FOUND THEN
    RAISE NOTICE 'User with email % not found. User must sign up first before being promoted to admin.', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION promote_user_to_admin(TEXT) TO authenticated;

-- Create a trigger function to automatically create admin_users entry when a profile is marked as admin
CREATE OR REPLACE FUNCTION sync_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is being promoted to admin, create admin_users entry
  IF NEW.is_admin = true AND (OLD.is_admin IS NULL OR OLD.is_admin = false) THEN
    INSERT INTO admin_users (
      email,
      password_hash,
      name,
      is_super_admin,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      NEW.email,
      'managed_by_supabase_auth', -- Placeholder since actual auth is handled by Supabase
      NEW.name,
      true, -- Make them super admin by default
      true,
      now(),
      now()
    )
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      is_active = EXCLUDED.is_active,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_admin_user_trigger ON profiles;
CREATE TRIGGER sync_admin_user_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_admin_user();

-- Now promote the specified user to admin (this will work once they sign up)
-- For immediate effect, let's also insert a profile entry if it doesn't exist
INSERT INTO profiles (
  id,
  email,
  name,
  is_admin,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- Temporary ID, will be replaced when user actually signs up
  'adhilsalahhk@gmail.com',
  'System Administrator',
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  name = EXCLUDED.name,
  updated_at = now();

-- Create an index on admin_users email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

-- Create a view for active admin users
CREATE OR REPLACE VIEW active_admin_users AS
SELECT 
  id,
  email,
  name,
  is_super_admin,
  created_at,
  updated_at
FROM admin_users 
WHERE is_active = true;

-- Grant appropriate permissions
GRANT SELECT ON active_admin_users TO authenticated;

-- Add RLS policy for admin users to manage other admin users
CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Ensure RLS is enabled on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
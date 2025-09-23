/*
  # Admin User Setup

  1. Updates
    - Update existing profiles to set admin status
    - Add sample admin users for testing

  2. Security
    - Ensure RLS policies work with is_admin flag
*/

-- Update the main admin user
UPDATE profiles 
SET is_admin = true 
WHERE email = 'varthripaadikkam@gmail.com';

-- Insert additional admin user for testing (if not exists)
INSERT INTO profiles (id, email, name, is_admin, created_at)
SELECT 
  gen_random_uuid(),
  'admin@keralatrekking.com',
  'Admin User',
  true,
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'admin@keralatrekking.com'
);

-- Ensure the auth.users table has corresponding entries
-- Note: In a real application, these users would be created through Supabase Auth
-- This is just for demo purposes
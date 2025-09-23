/*
  # Setup Admin Users

  1. Updates
    - Set specific users as admins in the profiles table
    - Ensures admin users have proper permissions

  2. Security
    - Only specific email addresses are granted admin access
    - Admin status is controlled at the database level
*/

-- Update specific users to be admins
UPDATE profiles 
SET is_admin = true 
WHERE email IN (
  'varthripaadikkam@gmail.com',
  'admin@keralatrekking.com'
);

-- Insert admin profiles if they don't exist (for testing)
INSERT INTO profiles (id, email, name, is_admin)
SELECT 
  gen_random_uuid(),
  email,
  name,
  true
FROM (
  VALUES 
    ('varthripaadikkam@gmail.com', 'Admin User'),
    ('admin@keralatrekking.com', 'Kerala Trekking Admin')
) AS admin_data(email, name)
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.email = admin_data.email
);
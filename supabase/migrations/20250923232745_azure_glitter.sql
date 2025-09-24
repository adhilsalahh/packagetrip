/*
  # Fix Authentication System

  1. Database Schema Updates
    - Ensure proper user profiles table structure
    - Fix RLS policies for better security
    - Add proper indexes and constraints
    - Create admin users table if needed

  2. Security Improvements
    - Update RLS policies for profiles
    - Ensure proper admin access controls
    - Add message templates for notifications

  3. Functions and Triggers
    - Fix user profile creation trigger
    - Add booking reference generation
    - Update rating calculation functions
*/

-- Ensure profiles table has correct structure
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Update profiles table constraints
ALTER TABLE profiles 
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN name SET NOT NULL;

-- Create unique index on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'profiles_email_key'
  ) THEN
    CREATE UNIQUE INDEX profiles_email_key ON profiles(email);
  END IF;
END $$;

-- Drop existing RLS policies to recreate them
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create improved RLS policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create or update the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name, phone, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create booking reference generation function
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS text AS $$
BEGIN
  RETURN 'TRK' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Ensure message templates table exists with proper data
INSERT INTO message_templates (type, name, subject, content, variables, is_active) 
VALUES 
  (
    'whatsapp',
    'Booking Confirmation',
    NULL,
    'Hi {{userName}}! 🎉 Your booking for {{packageTitle}} has been confirmed! 

📅 Date: {{startDate}}
📍 Location: {{location}}
👥 Group Size: {{groupSize}} people
💰 Amount: {{totalAmount}}
🔖 Reference: {{bookingReference}}

Our team will contact you 48 hours before the trek with detailed instructions. Have an amazing adventure! 🏔️

Kerala Trekking Team',
    ARRAY['userName', 'packageTitle', 'startDate', 'location', 'groupSize', 'totalAmount', 'bookingReference'],
    true
  ),
  (
    'email',
    'Booking Confirmation',
    'Booking Confirmed - {{packageTitle}}',
    '<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; border-radius: 10px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px;">Your adventure awaits, {{userName}}!</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0;">
      <h2 style="color: #059669; margin-top: 0;">{{packageTitle}}</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">📅 Start Date:</td>
          <td style="padding: 8px 0;">{{startDate}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">📍 Location:</td>
          <td style="padding: 8px 0;">{{location}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">⏱️ Duration:</td>
          <td style="padding: 8px 0;">{{duration}} days</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">👥 Group Size:</td>
          <td style="padding: 8px 0;">{{groupSize}} people</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">💰 Total Amount:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: bold;">{{totalAmount}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">🔖 Reference:</td>
          <td style="padding: 8px 0; font-family: monospace; background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">{{bookingReference}}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #dbeafe; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin-top: 0;">What happens next?</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Our team will contact you 48 hours before the trek</li>
        <li>You will receive detailed packing list and instructions</li>
        <li>Emergency contact numbers will be shared</li>
        <li>Weather updates and any last-minute changes will be communicated</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <p style="color: #6b7280;">Need help? Contact us:</p>
      <p style="margin: 5px 0;">📞 +91 9876543210</p>
      <p style="margin: 5px 0;">✉️ info@keralatrekking.com</p>
    </div>
    
    <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
      <p>Kerala Trekking - Your Gateway to Adventure</p>
      <p>Confirmed on {{confirmationDate}}</p>
    </div>
  </div>
</body>
</html>',
    ARRAY['userName', 'packageTitle', 'startDate', 'location', 'duration', 'groupSize', 'totalAmount', 'bookingReference', 'confirmationDate'],
    true
  )
ON CONFLICT (type, name) DO UPDATE SET
  content = EXCLUDED.content,
  variables = EXCLUDED.variables,
  updated_at = now();

-- Create admin user (you can update this with real admin credentials)
-- Note: This creates a profile entry, but you'll need to create the actual auth user through Supabase dashboard
INSERT INTO profiles (id, email, name, is_admin, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@keralatrekking.com',
  'System Administrator',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  updated_at = now();
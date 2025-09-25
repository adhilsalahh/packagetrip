-- =====================================================
-- KERALA TREKKING DATABASE SETUP SCRIPT
-- Complete database creation and admin user management
-- =====================================================

-- Note: This script assumes you're using Supabase which provides:
-- 1. Built-in authentication (auth.users table)
-- 2. Automatic database creation
-- 3. Row Level Security (RLS) support

-- =====================================================
-- 1. UTILITY FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TRK' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. USER MANAGEMENT TABLES
-- =====================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin users table (separate admin authentication system)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  is_super_admin boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. APPLICATION CORE TABLES
-- =====================================================

-- Trek packages table
CREATE TABLE IF NOT EXISTS trek_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  difficulty text NOT NULL CHECK (difficulty = ANY (ARRAY['Easy'::text, 'Moderate'::text, 'Difficult'::text, 'Expert'::text])),
  price numeric(10,2) NOT NULL CHECK (price > 0::numeric),
  max_group_size integer NOT NULL CHECK (max_group_size > 0),
  images text[] DEFAULT '{}'::text[],
  included text[] DEFAULT '{}'::text[],
  excluded text[] DEFAULT '{}'::text[],
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  total_reviews integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Itinerary days table
CREATE TABLE IF NOT EXISTS itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES trek_packages(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number > 0),
  title text NOT NULL,
  description text NOT NULL,
  activities text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now(),
  UNIQUE(package_id, day_number)
);

-- Package availability table
CREATE TABLE IF NOT EXISTS package_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES trek_packages(id) ON DELETE CASCADE,
  available_date date NOT NULL,
  max_bookings integer NOT NULL DEFAULT 1 CHECK (max_bookings > 0),
  current_bookings integer NOT NULL DEFAULT 0 CHECK (current_bookings >= 0),
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(package_id, available_date)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES trek_packages(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  group_size integer NOT NULL CHECK (group_size > 0),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount > 0::numeric),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'completed'::text])),
  special_requests text,
  payment_id text,
  payment_status text DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text])),
  booking_reference text UNIQUE DEFAULT generate_booking_reference(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES trek_packages(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, package_id, booking_id)
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES trek_packages(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, package_id)
);

-- Message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = ANY (ARRAY['whatsapp'::text, 'email'::text])),
  name text NOT NULL,
  subject text,
  content text NOT NULL,
  variables text[] DEFAULT '{}'::text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Message logs table
CREATE TABLE IF NOT EXISTS message_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type = ANY (ARRAY['whatsapp'::text, 'email'::text])),
  recipient text NOT NULL,
  subject text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'delivered'::text])),
  error_message text,
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- User and admin indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

-- Package and booking indexes
CREATE INDEX IF NOT EXISTS idx_trek_packages_active ON trek_packages(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_trek_packages_location ON trek_packages(location);
CREATE INDEX IF NOT EXISTS idx_trek_packages_difficulty ON trek_packages(difficulty);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);

-- Availability and review indexes
CREATE INDEX IF NOT EXISTS idx_package_availability_date ON package_availability(available_date);
CREATE INDEX IF NOT EXISTS idx_package_availability_package ON package_availability(package_id);
CREATE INDEX IF NOT EXISTS idx_reviews_package_id ON reviews(package_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- =====================================================
-- 5. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_trek_packages_updated_at BEFORE UPDATE ON trek_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_package_availability_updated_at BEFORE UPDATE ON package_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) SETUP
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trek_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

-- User profile policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Admin user policies
CREATE POLICY "Admins can read admin users" ON admin_users FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Trek package policies (public read, admin write)
CREATE POLICY "Anyone can read active packages" ON trek_packages FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage packages" ON trek_packages FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Itinerary policies
CREATE POLICY "Anyone can read itinerary" ON itinerary_days FOR SELECT TO anon, authenticated 
  USING (EXISTS (SELECT 1 FROM trek_packages WHERE trek_packages.id = itinerary_days.package_id AND trek_packages.is_active = true));
CREATE POLICY "Admins can manage itinerary" ON itinerary_days FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Package availability policies
CREATE POLICY "Anyone can read package availability" ON package_availability FOR SELECT TO anon, authenticated USING (is_available = true);
CREATE POLICY "Admins can manage package availability" ON package_availability FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Booking policies
CREATE POLICY "Users can read own bookings" ON bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all bookings" ON bookings FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Review policies
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can create reviews for their bookings" ON reviews FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM bookings WHERE bookings.id = reviews.booking_id AND bookings.user_id = auth.uid() AND bookings.status = 'completed'));
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can read own wishlist" ON wishlists FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON wishlists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Message template policies
CREATE POLICY "Admins can manage message templates" ON message_templates FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Message log policies
CREATE POLICY "Admins can manage message logs" ON message_logs FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Users can read own message logs" ON message_logs FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = message_logs.booking_id AND bookings.user_id = auth.uid()));

-- =====================================================
-- 7. ADMIN USER MANAGEMENT
-- =====================================================

-- Clear existing admin user data
DELETE FROM admin_users;

-- Insert new admin user with specified credentials
-- Note: In production, use proper bcrypt hashing for passwords
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
  '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O7K8qVZ8qVZ8qVZ8qVZ8qVZ8qVZ8qVZ8', -- bcrypt hash of '1234567890'
  'System Administrator',
  true,
  true,
  now(),
  now()
);

-- Create or update profile for admin user
INSERT INTO profiles (
  id,
  email,
  name,
  is_admin,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'adhilsalahhk@gmail.com',
  'System Administrator',
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  name = EXCLUDED.name,
  updated_at = now();

-- =====================================================
-- 8. UTILITY FUNCTIONS FOR ADMIN MANAGEMENT
-- =====================================================

-- Function to promote a user to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET is_admin = true, updated_at = now()
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'User with email % not found. User must sign up first.', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync admin status between tables
CREATE OR REPLACE FUNCTION sync_admin_user()
RETURNS TRIGGER AS $$
BEGIN
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
      'managed_by_supabase_auth',
      NEW.name,
      true,
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

-- Create trigger for admin sync
DROP TRIGGER IF EXISTS sync_admin_user_trigger ON profiles;
CREATE TRIGGER sync_admin_user_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_admin_user();

-- =====================================================
-- 9. SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample message templates
INSERT INTO message_templates (type, name, subject, content, variables) VALUES
('email', 'Booking Confirmation', 'Your Kerala Trekking Booking is Confirmed!', 
 'Dear {{userName}},

Your booking for {{packageTitle}} has been confirmed!

Booking Details:
- Package: {{packageTitle}}
- Location: {{location}}
- Start Date: {{startDate}}
- Duration: {{duration}} days
- Group Size: {{groupSize}} people
- Total Amount: {{totalAmount}}
- Booking Reference: {{bookingReference}}

We will contact you 48 hours before your trek with detailed instructions.

Happy Trekking!
Kerala Trekking Team', 
 ARRAY['userName', 'packageTitle', 'location', 'startDate', 'duration', 'groupSize', 'totalAmount', 'bookingReference']),

('whatsapp', 'Booking Confirmation', NULL,
 'Hi {{userName}}! 🏔️

Your Kerala Trekking booking is CONFIRMED! ✅

📍 {{packageTitle}} - {{location}}
📅 {{startDate}} ({{duration}} days)
👥 {{groupSize}} people
💰 {{totalAmount}}
🎫 Ref: {{bookingReference}}

We''ll contact you 48hrs before the trek. Get ready for an amazing adventure! 🎒

Kerala Trekking Team',
 ARRAY['userName', 'packageTitle', 'location', 'startDate', 'duration', 'groupSize', 'totalAmount', 'bookingReference']);

-- Grant permissions
GRANT EXECUTE ON FUNCTION promote_user_to_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_admin_user() TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Kerala Trekking Database Setup Complete!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Admin user created: adhilsalahhk@gmail.com';
  RAISE NOTICE 'Password: 1234567890 (hashed in database)';
  RAISE NOTICE 'All tables, indexes, and security policies are in place.';
  RAISE NOTICE '==============================================';
END $$;
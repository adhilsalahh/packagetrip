/*
  # Enhanced Booking Management System

  1. New Tables
    - `message_logs` - Track all sent messages (WhatsApp and email)
    - `package_availability` - Manage available dates for packages
    - `message_templates` - Store message templates
    - `admin_users` - Manage admin access

  2. Enhanced Tables
    - Update `profiles` table with additional fields
    - Add booking reference number generation

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for admin and user access
*/

-- Create message logs table
CREATE TABLE IF NOT EXISTS message_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('whatsapp', 'email')),
  recipient text NOT NULL,
  subject text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  error_message text,
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create package availability table
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

-- Create message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('whatsapp', 'email')),
  name text NOT NULL,
  subject text,
  content text NOT NULL,
  variables text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin users table
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

-- Add booking reference number function
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS text AS $$
BEGIN
  RETURN 'TRK' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Add booking reference column to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_reference text UNIQUE DEFAULT generate_booking_reference();
  END IF;
END $$;

-- Function to update package availability when booking is made
CREATE OR REPLACE FUNCTION update_package_availability()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increase current bookings
    UPDATE package_availability 
    SET current_bookings = current_bookings + 1,
        updated_at = now()
    WHERE package_id = NEW.package_id 
      AND available_date = NEW.start_date;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease current bookings
    UPDATE package_availability 
    SET current_bookings = GREATEST(0, current_bookings - 1),
        updated_at = now()
    WHERE package_id = OLD.package_id 
      AND available_date = OLD.start_date;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for package availability updates
DROP TRIGGER IF EXISTS booking_availability_trigger ON bookings;
CREATE TRIGGER booking_availability_trigger
  AFTER INSERT OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_package_availability();

-- Function to book package date
CREATE OR REPLACE FUNCTION book_package_date(p_package_id uuid, p_date date)
RETURNS void AS $$
BEGIN
  UPDATE package_availability 
  SET current_bookings = current_bookings + 1,
      updated_at = now()
  WHERE package_id = p_package_id 
    AND available_date = p_date
    AND current_bookings < max_bookings
    AND is_available = true;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No availability for this date or package is full';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_logs
CREATE POLICY "Admins can manage message logs"
  ON message_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can read own message logs"
  ON message_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = message_logs.booking_id 
        AND bookings.user_id = auth.uid()
    )
  );

-- RLS Policies for package_availability
CREATE POLICY "Anyone can read package availability"
  ON package_availability
  FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

CREATE POLICY "Admins can manage package availability"
  ON package_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
  );

-- RLS Policies for message_templates
CREATE POLICY "Admins can manage message templates"
  ON message_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
  );

-- RLS Policies for admin_users
CREATE POLICY "Admins can read admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
  );

-- Insert default message templates
INSERT INTO message_templates (type, name, subject, content, variables) VALUES
(
  'whatsapp',
  'Booking Confirmation',
  NULL,
  '🎉 *Booking Confirmed!*

Hello {{userName}},

Your booking for *{{packageTitle}}* has been confirmed!

📅 *Date:* {{startDate}}
📍 *Location:* {{location}}
⏱️ *Duration:* {{duration}} days
👥 *Group Size:* {{groupSize}} people
💰 *Total Amount:* {{totalAmount}}
🔖 *Reference:* {{bookingReference}}

We''re excited to have you join us for this amazing trekking adventure! You''ll receive detailed preparation guidelines and itinerary via email shortly.

For any queries, feel free to contact us.

Happy Trekking! 🏔️
Kerala Trekking Team',
  ARRAY['userName', 'packageTitle', 'startDate', 'location', 'duration', 'groupSize', 'totalAmount', 'bookingReference']
),
(
  'email',
  'Booking Confirmation',
  'Booking Confirmed - {{packageTitle}}',
  '<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
        </div>
        <div class="content">
            <p>Dear {{userName}},</p>
            
            <p>We''re thrilled to confirm your booking for <strong>{{packageTitle}}</strong>! Your adventure awaits.</p>
            
            <div class="booking-details">
                <h3>Booking Details</h3>
                <div class="detail-row">
                    <span><strong>Package:</strong></span>
                    <span>{{packageTitle}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Location:</strong></span>
                    <span>{{location}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Start Date:</strong></span>
                    <span>{{startDate}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Duration:</strong></span>
                    <span>{{duration}} days</span>
                </div>
                <div class="detail-row">
                    <span><strong>Group Size:</strong></span>
                    <span>{{groupSize}} people</span>
                </div>
                <div class="detail-row">
                    <span><strong>Total Amount:</strong></span>
                    <span>{{totalAmount}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Booking Reference:</strong></span>
                    <span>{{bookingReference}}</span>
                </div>
            </div>
            
            <p><strong>What''s Next?</strong></p>
            <ul>
                <li>You''ll receive a detailed itinerary and preparation checklist within 24 hours</li>
                <li>Our team will contact you 48 hours before the trek with final instructions</li>
                <li>Please ensure you have all required documents and gear ready</li>
            </ul>
            
            <p>If you have any questions or need to make changes, please contact us immediately.</p>
            
            <p>We can''t wait to share this incredible experience with you!</p>
            
            <p>Best regards,<br>
            Kerala Trekking Team<br>
            📞 +91 9876543210<br>
            📧 info@keralatrekking.com</p>
        </div>
        <div class="footer">
            <p>This is an automated confirmation. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>',
  ARRAY['userName', 'packageTitle', 'startDate', 'location', 'duration', 'groupSize', 'totalAmount', 'bookingReference']
);

-- Create admin user
INSERT INTO admin_users (email, password_hash, name, is_super_admin) VALUES
('adhilsalahhk@gmail.com', crypt('As12345', gen_salt('bf')), 'Admin User', true)
ON CONFLICT (email) DO NOTHING;

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_package_availability_updated_at
  BEFORE UPDATE ON package_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
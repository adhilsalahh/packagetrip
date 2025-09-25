# Kerala Trekking Database Schema

## Overview
This document outlines the complete database schema for the Kerala Trekking web application, including user authentication, admin management, and application-specific tables.

## Authentication & User Management

### 1. User Authentication (Supabase Auth)
Supabase handles the core authentication with the built-in `auth.users` table.

### 2. User Profiles Table (`profiles`)
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Purpose**: Extended user information and admin role management
**Key Features**:
- Links to Supabase auth users
- Admin role flag for access control
- User profile information

### 3. Admin Users Table (`admin_users`)
```sql
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  is_super_admin boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Purpose**: Administrative user management with enhanced permissions
**Key Features**:
- Separate admin authentication system
- Super admin privileges
- Account activation/deactivation
- Password hashing for security

## Application Tables

### 4. Trek Packages (`trek_packages`)
```sql
CREATE TABLE trek_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Difficult', 'Expert')),
  price numeric(10,2) NOT NULL CHECK (price > 0),
  max_group_size integer NOT NULL CHECK (max_group_size > 0),
  images text[] DEFAULT '{}',
  included text[] DEFAULT '{}',
  excluded text[] DEFAULT '{}',
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 5. Itinerary Days (`itinerary_days`)
```sql
CREATE TABLE itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES trek_packages(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number > 0),
  title text NOT NULL,
  description text NOT NULL,
  activities text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(package_id, day_number)
);
```

### 6. Bookings (`bookings`)
```sql
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES trek_packages(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  group_size integer NOT NULL CHECK (group_size > 0),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests text,
  payment_id text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  booking_reference text UNIQUE DEFAULT generate_booking_reference(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 7. Package Availability (`package_availability`)
```sql
CREATE TABLE package_availability (
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
```

### 8. Reviews (`reviews`)
```sql
CREATE TABLE reviews (
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
```

### 9. Wishlists (`wishlists`)
```sql
CREATE TABLE wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES trek_packages(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, package_id)
);
```

### 10. Message Templates (`message_templates`)
```sql
CREATE TABLE message_templates (
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
```

### 11. Message Logs (`message_logs`)
```sql
CREATE TABLE message_logs (
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
```

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

1. **User Data**: Users can only access their own data
2. **Admin Data**: Only admins can access admin-specific tables
3. **Public Data**: Trek packages and reviews are publicly readable
4. **Booking Data**: Users can manage their own bookings, admins can manage all

### Password Security
- Admin passwords are hashed using bcrypt
- Supabase handles regular user authentication securely
- No plain text passwords stored anywhere

### Access Control
- Role-based access control through `is_admin` flag
- Super admin privileges for enhanced administrative functions
- API-level security through Supabase RLS policies

## Indexes and Performance

Key indexes for optimal performance:
- Email indexes on user tables
- Date indexes on bookings and availability
- Foreign key indexes for joins
- Composite indexes for common query patterns

## Triggers and Functions

### Automated Functions
1. `update_updated_at()`: Automatically updates timestamp fields
2. `generate_booking_reference()`: Creates unique booking references
3. `update_package_rating()`: Recalculates package ratings from reviews
4. `update_package_availability()`: Manages booking availability
5. `promote_user_to_admin()`: Promotes users to admin status
6. `sync_admin_user()`: Syncs admin status between tables

## Data Relationships

```
auth.users (Supabase)
    ↓
profiles (1:1)
    ↓
bookings (1:many) → trek_packages (many:1)
    ↓                      ↓
reviews (1:many)    itinerary_days (1:many)
                           ↓
                    package_availability (1:many)

profiles → wishlists → trek_packages
admin_users (independent admin system)
message_templates → message_logs → bookings
```

This schema provides a robust foundation for the Kerala Trekking application with proper security, scalability, and data integrity.
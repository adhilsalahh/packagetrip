export interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  totalPackages: number;
  totalUsers: number;
  monthlyBookings: number;
  pendingBookings: number;
}

export interface BookingWithDetails extends Booking {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  package: {
    id: string;
    title: string;
    location: string;
    duration: number;
    difficulty: string;
    price: number;
  };
}

export interface PackageAvailability {
  id: string;
  package_id: string;
  available_date: string;
  max_bookings: number;
  current_bookings: number;
  is_available: boolean;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  type: 'email' | 'whatsapp';
  name: string;
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
}
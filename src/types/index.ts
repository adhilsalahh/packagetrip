export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
  is_admin?: boolean;
}

export interface TrekPackage {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: number; // in days
  difficulty: 'Easy' | 'Moderate' | 'Difficult' | 'Expert';
  price: number;
  max_group_size: number;
  images: string[];
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  created_at: string;
  rating?: number;
  total_reviews?: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface Booking {
  id: string;
  user_id: string;
  package_id: string;
  start_date: string;
  group_size: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  package?: TrekPackage;
  user?: User;
}

export interface Review {
  id: string;
  user_id: string;
  package_id: string;
  booking_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: User;
}

export interface Wishlist {
  id: string;
  user_id: string;
  package_id: string;
  created_at: string;
  package?: TrekPackage;
}
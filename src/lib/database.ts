import { supabase } from './supabase';
import { TrekPackage, Booking, Review, Wishlist, User } from '../types';

// Trek Packages
export const getTrekPackages = async (): Promise<TrekPackage[]> => {
  const { data, error } = await supabase
    .from('trek_packages')
    .select(`
      *,
      itinerary_days (
        day_number,
        title,
        description,
        activities
      )
    `)
    .eq('is_active', true)
    .order('rating', { ascending: false });

  if (error) throw error;

  return data.map(pkg => ({
    ...pkg,
    itinerary: pkg.itinerary_days
      .sort((a: any, b: any) => a.day_number - b.day_number)
      .map((day: any) => ({
        day: day.day_number,
        title: day.title,
        description: day.description,
        activities: day.activities
      }))
  }));
};

export const getTrekPackageById = async (id: string): Promise<TrekPackage | null> => {
  const { data, error } = await supabase
    .from('trek_packages')
    .select(`
      *,
      itinerary_days (
        day_number,
        title,
        description,
        activities
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    ...data,
    itinerary: data.itinerary_days
      .sort((a: any, b: any) => a.day_number - b.day_number)
      .map((day: any) => ({
        day: day.day_number,
        title: day.title,
        description: day.description,
        activities: day.activities
      }))
  };
};

// User Profile
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Bookings
export const createBooking = async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select(`
      *,
      trek_packages (
        title,
        location,
        duration,
        difficulty,
        images
      ),
      profiles (
        name,
        email,
        phone
      )
    `)
    .single();

  if (error) throw error;
  return data;
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trek_packages (
        title,
        location,
        duration,
        difficulty,
        images
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateBookingStatus = async (bookingId: string, status: string, paymentId?: string): Promise<Booking> => {
  const updates: any = { status };
  if (paymentId) {
    updates.payment_id = paymentId;
    updates.payment_status = 'completed';
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Reviews
export const getPackageReviews = async (packageId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles (
        name,
        avatar_url
      )
    `)
    .eq('package_id', packageId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createReview = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select(`
      *,
      profiles (
        name,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return data;
};

export const updateReview = async (reviewId: string, updates: Partial<Review>): Promise<Review> => {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Wishlist
export const getUserWishlist = async (userId: string): Promise<Wishlist[]> => {
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      *,
      trek_packages (
        title,
        location,
        duration,
        difficulty,
        price,
        images,
        rating,
        total_reviews
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const addToWishlist = async (userId: string, packageId: string): Promise<Wishlist> => {
  const { data, error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId, package_id: packageId })
    .select(`
      *,
      trek_packages (
        title,
        location,
        duration,
        difficulty,
        price,
        images,
        rating,
        total_reviews
      )
    `)
    .single();

  if (error) throw error;
  return data;
};

export const removeFromWishlist = async (userId: string, packageId: string): Promise<void> => {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('package_id', packageId);

  if (error) throw error;
};

export const isInWishlist = async (userId: string, packageId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('package_id', packageId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

// Admin functions
export const getAllBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trek_packages (
        title,
        location,
        duration,
        difficulty
      ),
      profiles (
        name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getBookingStats = async () => {
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('status, total_amount, created_at');

  if (bookingsError) throw bookingsError;

  const { data: packages, error: packagesError } = await supabase
    .from('trek_packages')
    .select('id')
    .eq('is_active', true);

  if (packagesError) throw packagesError;

  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id');

  if (usersError) throw usersError;

  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  
  const monthlyBookings = bookings.filter(b => 
    new Date(b.created_at) >= thisMonth
  ).length;

  return {
    totalBookings: bookings.length,
    totalRevenue,
    totalPackages: packages.length,
    totalUsers: users.length,
    monthlyBookings,
    pendingBookings: bookings.filter(b => b.status === 'pending').length
  };
};

// Package Management Functions
export const createTrekPackage = async (packageData: {
  title: string;
  description: string;
  location: string;
  duration: number;
  difficulty: 'Easy' | 'Moderate' | 'Difficult' | 'Expert';
  price: number;
  max_group_size: number;
  images: string[];
  included: string[];
  excluded: string[];
  itinerary: Array<{
    day_number: number;
    title: string;
    description: string;
    activities: string[];
  }>;
}): Promise<TrekPackage> => {
  // Insert the main package
  const { data: packageResult, error: packageError } = await supabase
    .from('trek_packages')
    .insert({
      title: packageData.title,
      description: packageData.description,
      location: packageData.location,
      duration: packageData.duration,
      difficulty: packageData.difficulty,
      price: packageData.price,
      max_group_size: packageData.max_group_size,
      images: packageData.images,
      included: packageData.included,
      excluded: packageData.excluded,
      is_active: true
    })
    .select()
    .single();

  if (packageError) throw packageError;

  // Insert itinerary days
  if (packageData.itinerary.length > 0) {
    const itineraryData = packageData.itinerary.map(day => ({
      package_id: packageResult.id,
      day_number: day.day_number,
      title: day.title,
      description: day.description,
      activities: day.activities
    }));

    const { error: itineraryError } = await supabase
      .from('itinerary_days')
      .insert(itineraryData);

    if (itineraryError) throw itineraryError;
  }

  // Return the complete package with itinerary
  return getTrekPackageById(packageResult.id) as Promise<TrekPackage>;
};

export const updateTrekPackage = async (
  packageId: string,
  packageData: {
    title: string;
    description: string;
    location: string;
    duration: number;
    difficulty: 'Easy' | 'Moderate' | 'Difficult' | 'Expert';
    price: number;
    max_group_size: number;
    images: string[];
    included: string[];
    excluded: string[];
    itinerary: Array<{
      day_number: number;
      title: string;
      description: string;
      activities: string[];
    }>;
  }
): Promise<TrekPackage> => {
  // Update the main package
  const { error: packageError } = await supabase
    .from('trek_packages')
    .update({
      title: packageData.title,
      description: packageData.description,
      location: packageData.location,
      duration: packageData.duration,
      difficulty: packageData.difficulty,
      price: packageData.price,
      max_group_size: packageData.max_group_size,
      images: packageData.images,
      included: packageData.included,
      excluded: packageData.excluded,
      updated_at: new Date().toISOString()
    })
    .eq('id', packageId);

  if (packageError) throw packageError;

  // Delete existing itinerary days
  const { error: deleteError } = await supabase
    .from('itinerary_days')
    .delete()
    .eq('package_id', packageId);

  if (deleteError) throw deleteError;

  // Insert new itinerary days
  if (packageData.itinerary.length > 0) {
    const itineraryData = packageData.itinerary.map(day => ({
      package_id: packageId,
      day_number: day.day_number,
      title: day.title,
      description: day.description,
      activities: day.activities
    }));

    const { error: itineraryError } = await supabase
      .from('itinerary_days')
      .insert(itineraryData);

    if (itineraryError) throw itineraryError;
  }

  // Return the updated package with itinerary
  return getTrekPackageById(packageId) as Promise<TrekPackage>;
};

export const deleteTrekPackage = async (packageId: string): Promise<void> => {
  // Check if package has any bookings
  const { data: bookings, error: bookingError } = await supabase
    .from('bookings')
    .select('id')
    .eq('package_id', packageId)
    .limit(1);

  if (bookingError) throw bookingError;

  if (bookings && bookings.length > 0) {
    throw new Error('Cannot delete package with existing bookings. Please cancel all bookings first.');
  }

  // Delete the package (cascade will handle itinerary_days)
  const { error } = await supabase
    .from('trek_packages')
    .delete()
    .eq('id', packageId);

  if (error) throw error;
};

export const togglePackageStatus = async (packageId: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase
    .from('trek_packages')
    .update({ 
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', packageId);

  if (error) throw error;
};

// Get all packages for admin (including inactive ones)
export const getAllTrekPackagesAdmin = async (): Promise<TrekPackage[]> => {
  const { data, error } = await supabase
    .from('trek_packages')
    .select(`
      *,
      itinerary_days (
        day_number,
        title,
        description,
        activities
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(pkg => ({
    ...pkg,
    itinerary: pkg.itinerary_days
      .sort((a: any, b: any) => a.day_number - b.day_number)
      .map((day: any) => ({
        day: day.day_number,
        title: day.title,
        description: day.description,
        activities: day.activities
      }))
  }));
};
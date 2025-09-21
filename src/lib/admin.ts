import { supabase } from './supabase';
import { BookingWithDetails, AdminStats, PackageAvailability } from '../types/admin';
import { sendBookingConfirmation } from './messaging';

// Get all bookings with detailed information
export const getAllBookingsDetailed = async (): Promise<BookingWithDetails[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      profiles!bookings_user_id_fkey (
        id,
        name,
        email,
        phone
      ),
      trek_packages!bookings_package_id_fkey (
        id,
        title,
        location,
        duration,
        difficulty,
        price
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BookingWithDetails[];
};

// Update booking status and send notifications
export const updateBookingStatusWithNotification = async (
  bookingId: string, 
  status: string,
  sendNotification: boolean = true
): Promise<void> => {
  const { error } = await supabase
    .from('bookings')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (error) throw error;

  // Send confirmation messages if status is confirmed and notification is enabled
  if (status === 'confirmed' && sendNotification) {
    await sendBookingConfirmation(bookingId);
  }
};

// Get admin dashboard statistics
export const getAdminStats = async (): Promise<AdminStats> => {
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
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
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

// Package availability management
export const getPackageAvailability = async (packageId: string): Promise<PackageAvailability[]> => {
  const { data, error } = await supabase
    .from('package_availability')
    .select('*')
    .eq('package_id', packageId)
    .gte('available_date', new Date().toISOString().split('T')[0])
    .order('available_date', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const addPackageAvailability = async (
  packageId: string,
  availableDate: string,
  maxBookings: number = 1
): Promise<PackageAvailability> => {
  const { data, error } = await supabase
    .from('package_availability')
    .insert({
      package_id: packageId,
      available_date: availableDate,
      max_bookings: maxBookings,
      current_bookings: 0,
      is_available: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePackageAvailability = async (
  availabilityId: string,
  updates: Partial<PackageAvailability>
): Promise<PackageAvailability> => {
  const { data, error } = await supabase
    .from('package_availability')
    .update(updates)
    .eq('id', availabilityId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removePackageAvailability = async (availabilityId: string): Promise<void> => {
  const { error } = await supabase
    .from('package_availability')
    .delete()
    .eq('id', availabilityId);

  if (error) throw error;
};

// Get available dates for a package
export const getAvailableDates = async (packageId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('package_availability')
    .select('available_date')
    .eq('package_id', packageId)
    .eq('is_available', true)
    .gte('available_date', new Date().toISOString().split('T')[0])
    .lt('current_bookings', supabase.raw('max_bookings'))
    .order('available_date', { ascending: true });

  if (error) throw error;
  return data.map(item => item.available_date);
};

// Book a specific date
export const bookAvailableDate = async (packageId: string, date: string): Promise<void> => {
  const { error } = await supabase.rpc('book_package_date', {
    p_package_id: packageId,
    p_date: date
  });

  if (error) throw error;
};

// Admin authentication
export const authenticateAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error('Database error during authentication');
  }
  
  if (!data) {
    throw new Error('Invalid credentials');
  }

  // SECURITY NOTE: In production, use proper password hashing (bcrypt, argon2, etc.)
  // This is a demo implementation - never store plain text passwords in production
  if (email === 'varthripaadikkam@gmail.com' && password === 'A123456') {
    return data;
  }

  throw new Error('Invalid credentials');
};

// Get booking with message logs
export const getBookingWithMessages = async (bookingId: string) => {
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      *,
      profiles!bookings_user_id_fkey (
        id,
        name,
        email,
        phone
      ),
      trek_packages!bookings_package_id_fkey (
        id,
        title,
        location,
        duration,
        difficulty,
        price
      )
    `)
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;

  const { data: messages, error: messagesError } = await supabase
    .from('message_logs')
    .select('*')
    .eq('booking_id', bookingId)
    .order('sent_at', { ascending: false });

  if (messagesError) throw messagesError;

  return {
    ...booking,
    messages: messages || []
  };
};

// Bulk booking operations
export const bulkUpdateBookingStatus = async (
  bookingIds: string[],
  status: string,
  sendNotifications: boolean = true
): Promise<void> => {
  const { error } = await supabase
    .from('bookings')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .in('id', bookingIds);

  if (error) throw error;

  // Send notifications if requested
  if (status === 'confirmed' && sendNotifications) {
    for (const bookingId of bookingIds) {
      try {
        await sendBookingConfirmation(bookingId);
      } catch (error) {
        console.error(`Failed to send confirmation for booking ${bookingId}:`, error);
      }
    }
  }
};

// Get message statistics
export const getMessageStats = async () => {
  const { data, error } = await supabase
    .from('message_logs')
    .select('type, status, sent_at');

  if (error) throw error;

  const stats = {
    total: data.length,
    whatsapp: data.filter(m => m.type === 'whatsapp').length,
    email: data.filter(m => m.type === 'email').length,
    sent: data.filter(m => m.status === 'sent').length,
    failed: data.filter(m => m.status === 'failed').length,
    delivered: data.filter(m => m.status === 'delivered').length
  };

  return stats;
};
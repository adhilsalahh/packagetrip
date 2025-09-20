import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { getUserBookings, createBooking, updateBookingStatus } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) {
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserBookings(user.id);
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const createNewBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const newBooking = await createBooking(bookingData);
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateStatus = async (bookingId: string, status: string, paymentId?: string) => {
    try {
      const updatedBooking = await updateBookingStatus(bookingId, status, paymentId);
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? updatedBooking : booking
        )
      );
      return updatedBooking;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    bookings,
    loading,
    error,
    createBooking: createNewBooking,
    updateStatus,
    refetch: fetchBookings
  };
};
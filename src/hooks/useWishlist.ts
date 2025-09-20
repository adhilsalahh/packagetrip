import { useState, useEffect } from 'react';
import { Wishlist } from '../types';
import { getUserWishlist, addToWishlist, removeFromWishlist, isInWishlist } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserWishlist(user.id);
      setWishlist(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addItem = async (packageId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const newItem = await addToWishlist(user.id, packageId);
      setWishlist(prev => [newItem, ...prev]);
      return newItem;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeItem = async (packageId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      await removeFromWishlist(user.id, packageId);
      setWishlist(prev => prev.filter(item => item.package_id !== packageId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const isInWishlistCheck = async (packageId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      return await isInWishlist(user.id, packageId);
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    wishlist,
    loading,
    error,
    addItem,
    removeItem,
    isInWishlistCheck,
    refetch: fetchWishlist
  };
};
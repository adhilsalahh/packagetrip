import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../contexts/AuthContext';

interface WishlistButtonProps {
  packageId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  packageId, 
  className = '',
  size = 'md'
}) => {
  const { user } = useAuth();
  const { addItem, removeItem, isInWishlistCheck } = useWishlist();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      isInWishlistCheck(packageId).then(setIsInWishlist);
    } else {
      setIsInWishlist(false);
    }
  }, [user, packageId, isInWishlistCheck]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || loading) return;

    setLoading(true);
    try {
      if (isInWishlist) {
        await removeItem(packageId);
        setIsInWishlist(false);
      } else {
        await addItem(packageId);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <button
      onClick={handleToggle}
      disabled={!user || loading}
      className={`transition-all disabled:opacity-50 ${className}`}
      title={!user ? 'Sign in to add to wishlist' : isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={`${sizeClasses[size]} transition-colors ${
          isInWishlist 
            ? 'text-red-500 fill-current' 
            : 'text-gray-600 hover:text-red-500'
        }`} 
      />
    </button>
  );
};

export default WishlistButton;
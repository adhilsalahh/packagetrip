import React from 'react';
import { MapPin, Clock, Star, IndianRupee, X } from 'lucide-react';
import { Wishlist } from '../../types';
import { useWishlist } from '../../hooks/useWishlist';

interface WishlistCardProps {
  item: Wishlist;
}

const WishlistCard: React.FC<WishlistCardProps> = ({ item }) => {
  const { removeItem } = useWishlist();
  const pkg = item.package;

  if (!pkg) return null;

  const handleRemove = async () => {
    try {
      await removeItem(pkg.id);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={pkg.images[0]}
          alt={pkg.title}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{pkg.title}</h3>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{pkg.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{pkg.duration} days</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm text-gray-600">{pkg.rating}</span>
            <span className="text-sm text-gray-500">({pkg.total_reviews})</span>
          </div>
          <div className="flex items-center space-x-1 text-green-600 font-semibold">
            <IndianRupee className="h-4 w-4" />
            <span>₹{pkg.price.toLocaleString()}</span>
          </div>
        </div>

        <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default WishlistCard;
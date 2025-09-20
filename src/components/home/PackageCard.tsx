import React from 'react';
import { MapPin, Clock, Users, Star, Heart, IndianRupee } from 'lucide-react';
import { TrekPackage } from '../../types';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../contexts/AuthContext';

interface PackageCardProps {
  package: TrekPackage;
  onViewDetails: (id: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, onViewDetails }) => {
  const { user } = useAuth();
  const { addItem, removeItem, isInWishlistCheck } = useWishlist();
  const [isInWishlist, setIsInWishlist] = React.useState(false);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      isInWishlistCheck(pkg.id).then(setIsInWishlist);
    }
  }, [user, pkg.id, isInWishlistCheck]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await removeItem(pkg.id);
        setIsInWishlist(false);
      } else {
        await addItem(pkg.id);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Difficult':
        return 'bg-orange-100 text-orange-800';
      case 'Expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <img
          src={pkg.images[0]}
          alt={pkg.title}
          className="w-full h-48 object-cover"
        />
        <button 
          onClick={handleWishlistToggle}
          disabled={!user || wishlistLoading}
          className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-all disabled:opacity-50"
        >
          <Heart 
            className={`h-5 w-5 transition-colors ${
              isInWishlist 
                ? 'text-red-500 fill-current' 
                : 'text-gray-600 hover:text-red-500'
            }`} 
          />
        </button>
        <div className="absolute bottom-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(pkg.difficulty)}`}>
            {pkg.difficulty}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{pkg.title}</h3>
          <div className="flex items-center space-x-1 text-yellow-500 ml-2">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium text-gray-700">{pkg.rating}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{pkg.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{pkg.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{pkg.duration} Days</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Max {pkg.max_group_size}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <span>{pkg.total_reviews} reviews</span>
          </div>
        </div>

        <div className="border-t pt-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1">
              <IndianRupee className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{pkg.price.toLocaleString()}</span>
            </div>
            <span className="text-sm text-gray-500">per person</span>
          </div>
          <button
            onClick={() => onViewDetails(pkg.id)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
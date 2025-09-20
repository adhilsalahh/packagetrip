import React, { useState } from 'react';
import { User, Calendar, Heart, Star, Settings, LogOut, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import { useWishlist } from '../../hooks/useWishlist';
import BookingCard from './BookingCard';
import WishlistCard from './WishlistCard';
import ProfileSettings from './ProfileSettings';
import BookingDetailsModal from './BookingDetailsModal';
import { Booking } from '../../types';

const EnhancedUserDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist' | 'profile'>('bookings');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: Calendar, count: bookings.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'Not provided';
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return phone;
  };

  const getNextBooking = () => {
    const upcomingBookings = bookings.filter(booking => 
      new Date(booking.start_date) > new Date() && 
      (booking.status === 'confirmed' || booking.status === 'pending')
    );
    
    return upcomingBookings.sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )[0];
  };

  const nextBooking = getNextBooking();

  const renderBookingsContent = () => (
    <div className="space-y-6">
      {/* Next Booking Highlight */}
      {nextBooking && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Your Next Adventure</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-green-100 text-sm">Package</p>
                  <p className="font-semibold text-lg">{nextBooking.package?.title}</p>
                </div>
                <div>
                  <p className="text-green-100 text-sm">Start Date</p>
                  <p className="font-semibold text-lg">{formatDate(nextBooking.start_date)}</p>
                </div>
                <div>
                  <p className="text-green-100 text-sm">Location</p>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <p className="font-semibold">{nextBooking.package?.location}</p>
                  </div>
                </div>
                <div>
                  <p className="text-green-100 text-sm">Reference Number</p>
                  <p className="font-mono font-bold text-lg">
                    {nextBooking.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
            <div className="ml-6">
              <button
                onClick={() => setSelectedBooking(nextBooking)}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Package Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {user?.user_metadata?.name || user?.email}'s Bookings
          </h3>
          <div className="text-sm text-gray-600">
            Total Bookings: {bookings.length}
          </div>
        </div>

        {bookingsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-4">Start exploring our amazing trekking packages!</p>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Book Next Booking
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="font-semibold text-gray-900">{booking.package?.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(booking.start_date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.package?.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{booking.package?.duration} days</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Reference:</span> {booking.id.slice(0, 8).toUpperCase()} • 
                      <span className="font-medium"> Amount:</span> ₹{booking.total_amount.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Book Next Booking Button */}
            <div className="text-center pt-6 border-t border-gray-200">
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                Book Next Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderWishlistContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
      {wishlistLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading wishlist...</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items in wishlist</h3>
          <p className="text-gray-600">Save your favorite packages for later!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <WishlistCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Enhanced Header with Contact Details */}
          <div className="bg-green-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {user?.user_metadata?.name || user?.email}
                  </h1>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center space-x-2 text-green-100">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email}</span>
                    </div>
                    {user?.user_metadata?.phone && (
                      <div className="flex items-center space-x-2 text-green-100">
                        <Phone className="h-4 w-4" />
                        <span className="font-mono">
                          {formatPhoneNumber(user.user_metadata.phone)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'bookings' && renderBookingsContent()}
            {activeTab === 'wishlist' && renderWishlistContent()}
            {activeTab === 'profile' && <ProfileSettings />}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default EnhancedUserDashboard;
import React, { useState } from 'react';
import { User, Calendar, Heart, Star, Settings, LogOut, Phone, Mail, MapPin, Clock, Package } from 'lucide-react';
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
    <div className="space-y-8">
      {/* User Profile Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">
              {user?.user_metadata?.name || user?.email}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span className="text-green-100">{user?.email}</span>
              </div>
              {user?.user_metadata?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span className="text-green-100 font-mono text-lg">
                    {formatPhoneNumber(user.user_metadata.phone)}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{bookings.length}</div>
                <div className="text-green-200 text-sm">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {bookings.filter(b => b.status === 'completed').length}
                </div>
                <div className="text-green-200 text-sm">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{wishlist.length}</div>
                <div className="text-green-200 text-sm">Wishlist Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Booking Highlight */}
      {nextBooking && (
        <div className="bg-white border-2 border-green-200 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-green-600" />
              Your Next Adventure
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              nextBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {nextBooking.status.charAt(0).toUpperCase() + nextBooking.status.slice(1)}
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-gray-600 text-sm font-medium">Package</p>
              <p className="font-bold text-lg text-gray-900">{nextBooking.package?.title}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Start Date</p>
              <p className="font-bold text-lg text-green-600">{formatDate(nextBooking.start_date)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Location</p>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                <p className="font-bold text-gray-900">{nextBooking.package?.location}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Reference</p>
              <p className="font-mono font-bold text-lg text-blue-600">
                {nextBooking.booking_reference || nextBooking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setSelectedBooking(nextBooking)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              View Details
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Book Next Booking
            </button>
          </div>
        </div>
      )}

      {/* User Package Section */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="h-6 w-6 mr-2 text-green-600" />
            {user?.user_metadata?.name || user?.email}'s Booking History
          </h3>
          <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
            Total Bookings: <span className="font-bold">{bookings.length}</span>
          </div>
        </div>

        {bookingsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-medium text-gray-900 mb-4">No bookings yet</h3>
            <p className="text-gray-600 mb-8 text-lg">Start exploring our amazing trekking packages!</p>
            <button className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg">
              Explore Packages
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-green-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-gray-900">{booking.package?.title}</h4>
                      <p className="text-gray-600">{booking.package?.location}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-gray-600 text-sm">Start Date</p>
                      <p className="font-semibold">{formatDate(booking.start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-gray-600 text-sm">Duration</p>
                      <p className="font-semibold">{booking.package?.duration} days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-gray-600 text-sm">Group Size</p>
                      <p className="font-semibold">{booking.group_size} people</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Amount</p>
                    <p className="font-bold text-xl text-green-600">₹{booking.total_amount.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Reference:</span> 
                    <span className="font-mono font-bold ml-2">
                      {booking.booking_reference || booking.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Booked on {formatDate(booking.created_at)}</span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            
            {/* Book Next Booking Button */}
            <div className="text-center pt-8 border-t-2 border-gray-200">
              <button className="bg-green-600 text-white px-10 py-4 rounded-xl hover:bg-green-700 transition-colors font-bold text-lg shadow-lg">
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
          {/* Header */}
          <div className="bg-green-600 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {user?.user_metadata?.name || 'Trekker'}!
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>View Profile</span>
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
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
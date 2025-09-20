import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Send,
  Package,
  IndianRupee
} from 'lucide-react';
import { BookingWithDetails } from '../../types/admin';
import BookingDetailsModal from './BookingDetailsModal';

interface BookingManagementProps {
  bookings: BookingWithDetails[];
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const BookingManagement: React.FC<BookingManagementProps> = ({ 
  bookings, 
  onStatusUpdate,
  onRefresh 
}) => {
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = 
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.package.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.booking_reference && booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    setLoading(bookingId);
    try {
      await onStatusUpdate(bookingId, status);
      await onRefresh();
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search bookings, names, or references..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'bg-blue-500' },
          { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'bg-yellow-500' },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'bg-green-500' },
          { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: 'bg-purple-500' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${stat.color} mr-2`}></div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No bookings have been made yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-green-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{booking.user.name}</h3>
                      <p className="text-gray-600 font-mono">
                        Ref: {booking.booking_reference || booking.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="capitalize">{booking.status}</span>
                  </span>
                </div>

                {/* Package Information */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <h4 className="font-bold text-lg text-gray-900">{booking.package.title}</h4>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{booking.package.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{formatDate(booking.start_date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{booking.package.duration} days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-600">₹{booking.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Contact Information */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Contact Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-semibold text-gray-900">{booking.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-mono font-bold text-lg text-gray-900">
                          {formatPhoneNumber(booking.user.phone)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Group Size:</span> {booking.group_size} people
                  </div>
                  <div>
                    <span className="font-medium">Booked on:</span> {formatDate(booking.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Payment Status:</span> 
                    <span className="capitalize ml-1">{booking.payment_status || 'Pending'}</span>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.special_requests && (
                  <div className="bg-yellow-50 p-3 rounded-lg mb-4 border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Special Requests:</strong> {booking.special_requests}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                      disabled={loading === booking.id}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{loading === booking.id ? 'Confirming...' : 'Confirm & Send Notifications'}</span>
                    </button>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                      disabled={loading === booking.id}
                      className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{loading === booking.id ? 'Updating...' : 'Mark Completed'}</span>
                    </button>
                  )}

                  <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusUpdate={onStatusUpdate}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};

export default BookingManagement;
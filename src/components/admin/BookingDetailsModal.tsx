import React, { useState } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  Users
} from 'lucide-react';
import { BookingWithDetails } from '../../types/admin';

interface BookingDetailsModalProps {
  booking: BookingWithDetails;
  onClose: () => void;
  onStatusUpdate: (bookingId: string, status: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
  onStatusUpdate,
  onRefresh
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleStatusUpdate = async (status: string) => {
    setLoading(true);
    try {
      await onStatusUpdate(booking.id, status);
      await onRefresh();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-lg font-semibold text-gray-900">{booking.user.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email Address</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{booking.user.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 font-mono text-lg">
                        {formatPhoneNumber(booking.user.phone)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Package Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Package Name</label>
                    <p className="text-lg font-semibold text-gray-900">{booking.package.title}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{booking.package.location}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Duration</label>
                      <p className="text-gray-900">{booking.package.duration} days</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Difficulty</label>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {booking.package.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Booking Reference</label>
                    <p className="text-lg font-mono font-semibold text-gray-900">
                      {booking.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 font-semibold">{formatDate(booking.start_date)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Group Size</label>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{booking.group_size} {booking.group_size === 1 ? 'person' : 'people'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Amount</label>
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="h-4 w-4 text-green-600" />
                        <p className="text-lg font-bold text-green-600">
                          {booking.total_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor(booking.status)}`}>
                        {booking.status === 'confirmed' && <CheckCircle className="h-4 w-4" />}
                        {booking.status === 'pending' && <Clock className="h-4 w-4" />}
                        {booking.status === 'cancelled' && <XCircle className="h-4 w-4" />}
                        {booking.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                        <span className="capitalize font-medium">{booking.status}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Booking Date</label>
                    <p className="text-gray-900">{formatDate(booking.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {booking.special_requests && (
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-800">Special Requests</h3>
                  <p className="text-yellow-700">{booking.special_requests}</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>{loading ? 'Confirming...' : 'Confirm Booking & Send Notifications'}</span>
                    </button>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>{loading ? 'Updating...' : 'Mark as Completed'}</span>
                    </button>
                  )}
                  
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                    >
                      <XCircle className="h-5 w-5" />
                      <span>{loading ? 'Cancelling...' : 'Cancel Booking'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
import React from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  IndianRupee,
  Phone,
  Mail,
  User,
  Package
} from 'lucide-react';
import { Booking } from '../../types';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-green-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <p className="text-green-600 font-mono font-semibold">
              Reference: {booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="space-y-8">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg border-2 ${getStatusColor(booking.status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Booking Status</h3>
                  <p className="capitalize text-2xl font-bold">{booking.status}</p>
                </div>
                {booking.status === 'confirmed' && (
                  <div className="text-right">
                    <p className="text-sm">Your booking is confirmed!</p>
                    <p className="text-sm">Check your email for details.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Package Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Package className="h-6 w-6 mr-2 text-green-600" />
                Package Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Package Name</label>
                    <p className="text-lg font-semibold text-gray-900">{booking.package?.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{booking.package?.location}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{booking.package?.duration} days</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-lg font-semibold text-gray-900">{formatDate(booking.start_date)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Group Size</label>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{booking.group_size} {booking.group_size === 1 ? 'person' : 'people'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Amount</label>
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-5 w-5 text-green-600" />
                      <p className="text-2xl font-bold text-green-600">
                        {booking.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Booking Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Booking Date</label>
                  <p className="text-gray-900">{formatDate(booking.created_at)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Status</label>
                  <p className="text-gray-900 capitalize">{booking.payment_status || 'Pending'}</p>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-2 text-blue-800">Special Requests</h3>
                <p className="text-blue-700">{booking.special_requests}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-4 text-green-800">Need Help?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Call Us</p>
                    <p className="text-green-700">+91 9876543210</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Email Us</p>
                    <p className="text-green-700">info@keralatrekking.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {booking.status === 'pending' && (
                <button className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium">
                  Cancel Booking
                </button>
              )}
              
              {booking.status === 'confirmed' && (
                <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Download Itinerary
                </button>
              )}
              
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
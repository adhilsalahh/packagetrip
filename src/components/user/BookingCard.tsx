import React from 'react';
import { Calendar, MapPin, Users, IndianRupee, Clock } from 'lucide-react';
import { Booking } from '../../types';

interface BookingCardProps {
  booking: Booking;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {booking.package?.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{booking.package?.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{booking.package?.duration} days</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{booking.group_size} {booking.group_size === 1 ? 'person' : 'people'}</span>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Calendar className="h-4 w-4" />
            <span>Start Date: {formatDate(booking.start_date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <IndianRupee className="h-4 w-4" />
            <span>Total: ₹{booking.total_amount.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <p>Booking ID: {booking.id.slice(0, 8)}...</p>
          <p>Booked on: {formatDate(booking.created_at)}</p>
        </div>
      </div>

      {booking.special_requests && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Special Requests:</strong> {booking.special_requests}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-4">
        {booking.status === 'pending' && (
          <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
            Cancel Booking
          </button>
        )}
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
          View Details
        </button>
      </div>
    </div>
  );
};

export default BookingCard;
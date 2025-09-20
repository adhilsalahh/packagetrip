import React, { useState } from 'react';
import { X, Calendar, Users, IndianRupee, CreditCard } from 'lucide-react';
import { TrekPackage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../hooks/useBookings';

interface BookingModalProps {
  package: TrekPackage;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ package: pkg, onClose }) => {
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const [bookingData, setBookingData] = useState({
    startDate: '',
    groupSize: 1,
    specialRequests: ''
  });
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [loading, setLoading] = useState(false);

  const totalAmount = bookingData.groupSize * pkg.price;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBookingData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBooking = async () => {
    setLoading(true);
    
    try {
      if (!user) throw new Error('User must be logged in');
      
      const booking = await createBooking({
        user_id: user.id,
        package_id: pkg.id,
        start_date: bookingData.startDate,
        group_size: bookingData.groupSize,
        total_amount: totalAmount,
        special_requests: bookingData.specialRequests || null,
        status: 'pending',
        payment_status: 'pending'
      });
      
      // In a real app, integrate with payment gateway here
      // For demo, we'll simulate successful payment
      setTimeout(async () => {
        setCurrentStep('confirmation');
        setLoading(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Booking error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Booking Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={bookingData.startDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Size
            </label>
            <select
              name="groupSize"
              value={bookingData.groupSize}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {Array.from({ length: pkg.max_group_size }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Special Requests (Optional)
        </label>
        <textarea
          name="specialRequests"
          value={bookingData.specialRequests}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Any dietary restrictions, medical conditions, or special requests..."
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Booking Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{pkg.title}</span>
            <span>₹{pkg.price.toLocaleString()} x {bookingData.groupSize}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total Amount</span>
            <span className="text-green-600">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setCurrentStep('payment')}
        disabled={!bookingData.startDate || !user}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {!user ? 'Please sign in to continue' : 'Proceed to Payment'}
      </button>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a demo implementation. In production, integrate with Stripe, Razorpay, or other payment gateways.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center font-semibold text-lg">
          <span>Amount to Pay</span>
          <span className="text-green-600">₹{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep('details')}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Back
        </button>
        <button
          onClick={handleBooking}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Processing...' : 'Complete Payment'}
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600">Your trekking adventure has been successfully booked.</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg text-left">
        <h4 className="font-semibold mb-2">Booking Details</h4>
        <div className="space-y-1 text-sm text-gray-700">
          <p><strong>Package:</strong> {pkg.title}</p>
          <p><strong>Date:</strong> {bookingData.startDate}</p>
          <p><strong>Group Size:</strong> {bookingData.groupSize} {bookingData.groupSize === 1 ? 'person' : 'people'}</p>
          <p><strong>Total Amount:</strong> ₹{totalAmount.toLocaleString()}</p>
          <p><strong>Booking ID:</strong> TRK{Date.now()}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        You will receive a confirmation email shortly with detailed instructions and preparation guidelines.
      </p>
      <button
        onClick={onClose}
        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {currentStep === 'details' && 'Book Your Trek'}
            {currentStep === 'payment' && 'Payment'}
            {currentStep === 'confirmation' && 'Booking Confirmation'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {currentStep === 'details' && renderDetailsStep()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'confirmation' && renderConfirmationStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
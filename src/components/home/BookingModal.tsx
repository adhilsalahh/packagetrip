import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, IndianRupee, CreditCard, MapPin, Clock, AlertCircle, CheckCircle, QrCode } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { TrekPackage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import { getAvailableDates } from '../../lib/admin';

interface BookingModalProps {
  package: TrekPackage;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ package: pkg, onClose }) => {
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    groupSize: 1,
    specialRequests: ''
  });
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string>('');
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    fetchAvailableDates();
  }, [pkg.id]);

  useEffect(() => {
    if (showPaymentConfirmation) {
      generateQRCode();
    }
  }, [showPaymentConfirmation, totalAmount]);
  const fetchAvailableDates = async () => {
    try {
      const dates = await getAvailableDates(pkg.id);
      setAvailableDates(dates);
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };

  const generateQRCode = async () => {
    try {
      const upiString = `upi://pay?pa=keralatrekking@paytm&pn=Kerala Trekking&am=${totalAmount}&cu=INR&tn=Booking for ${pkg.title}`;
      const qrUrl = await QRCodeLib.toDataURL(upiString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#059669',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };
  const totalAmount = bookingData.groupSize * pkg.price;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBookingData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBooking = async () => {
    if (!showPaymentConfirmation) {
      setShowPaymentConfirmation(true);
      return;
    }

    setLoading(true);
    setError(null);
    
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
      
      // Generate booking reference
      const reference = `TRK${Date.now().toString().slice(-8).toUpperCase()}`;
      setBookingReference(reference);
      
      // Simulate payment processing
      setTimeout(() => {
        setCurrentStep('confirmation');
        setLoading(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Booking error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Booking Details</h3>
        
        {/* Package Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center space-x-4">
            <img 
              src={pkg.images[0]} 
              alt={pkg.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-semibold text-gray-900">{pkg.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{pkg.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{pkg.duration} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Available Date
            </label>
            <select
              name="startDate"
              value={bookingData.startDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Choose a date...</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </select>
            {availableDates.length === 0 && (
              <p className="text-sm text-red-600 mt-1">No available dates currently</p>
            )}
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <button
        onClick={() => setCurrentStep('payment')}
        disabled={!bookingData.startDate || !user || availableDates.length === 0}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {!user ? 'Please sign in to continue' : 
         availableDates.length === 0 ? 'No available dates' :
         'Proceed to Payment'}
      </button>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Payment Details</h3>

        {!showPaymentConfirmation ? (
          <>
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
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handlePaymentInputChange}
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
                name="expiryDate"
                value={paymentData.expiryDate}
                onChange={handlePaymentInputChange}
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
                name="cvv"
                value={paymentData.cvv}
                onChange={handlePaymentInputChange}
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
              name="cardholderName"
              value={paymentData.cardholderName}
              onChange={handlePaymentInputChange}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Payment Confirmation */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-lg font-semibold text-yellow-800 mb-2">Confirm Your Payment</h4>
                  <p className="text-yellow-700 mb-4">
                    Please review your booking details and payment information before proceeding.
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border border-yellow-200">
                    <h5 className="font-semibold text-gray-900 mb-3">Payment Summary</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Package:</span>
                        <span className="font-medium">{pkg.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">{new Date(bookingData.startDate).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Group Size:</span>
                        <span className="font-medium">{bookingData.groupSize} people</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Card ending in:</span>
                        <span className="font-medium">****{paymentData.cardNumber.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total Amount:</span>
                        <span className="text-green-600">₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Payment Option */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="text-center">
                <QrCode className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-green-800 mb-2">Alternative: Pay with UPI</h4>
                <p className="text-green-700 mb-4">Scan the QR code below to pay via UPI</p>
                
                <div className="bg-white p-6 rounded-lg border-2 border-green-300 inline-block">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="UPI Payment QR Code" 
                      className="w-48 h-48 rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Generating QR Code...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-sm text-green-700">
                  <p><strong>UPI ID:</strong> keralatrekking@paytm</p>
                  <p><strong>Amount:</strong> ₹{totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center font-semibold text-lg">
          <span>Amount to Pay</span>
          <span className="text-green-600">₹{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => {
            if (showPaymentConfirmation) {
              setShowPaymentConfirmation(false);
            } else {
              setCurrentStep('details');
            }
          }}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Back
        </button>
        <button
          onClick={handleBooking}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Processing...' : 
           showPaymentConfirmation ? 'Confirm & Pay' : 'Review Payment'}
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
      <div className="bg-gray-50 p-6 rounded-lg text-left">
        <h4 className="font-semibold mb-4 text-center">Booking Details</h4>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="font-medium">Package:</span>
            <span>{pkg.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Date:</span>
            <span>{new Date(bookingData.startDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Group Size:</span>
            <span>{bookingData.groupSize} {bookingData.groupSize === 1 ? 'person' : 'people'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Amount:</span>
            <span className="font-bold text-green-600">₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Booking Reference:</span>
            <span className="font-mono font-bold text-blue-600">{bookingReference}</span>
          </div>
        </div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm text-green-800">
          <strong>What's Next?</strong><br/>
          • You will receive confirmation via WhatsApp and email shortly<br/>
          • Our team will contact you 48 hours before the trek<br/>
          • Check your dashboard for booking details and updates
        </p>
      </div>
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
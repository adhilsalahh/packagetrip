import React, { useState } from 'react';
import { X, MapPin, Clock, Users, Star, IndianRupee, Calendar, Check, Heart, Share2, Camera, Utensils, Mountain } from 'lucide-react';
import { TrekPackage } from '../../types';
import BookingModal from './BookingModal';

interface PackageModalProps {
  package: TrekPackage;
  onClose: () => void;
}

const PackageModal: React.FC<PackageModalProps> = ({ package: pkg, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'reviews'>('overview');

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

  if (showBooking) {
    return <BookingModal package={pkg} onClose={() => setShowBooking(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{pkg.title}</h2>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Heart className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Image Gallery */}
          <div className="relative h-64 md:h-80">
            <img
              src={pkg.images[currentImageIndex]}
              alt={pkg.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {pkg.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentImageIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Package Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center space-x-1">
                <MapPin className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">{pkg.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">{pkg.duration} Days</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">Max {pkg.max_group_size}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(pkg.difficulty)}`}>
                {pkg.difficulty}
              </span>
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-gray-700">{pkg.rating} ({pkg.total_reviews} reviews)</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 border-b mb-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'itinerary', label: 'Itinerary' },
                { id: 'reviews', label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">About This Trek</h3>
                  <p className="text-gray-700 leading-relaxed">{pkg.description}</p>
                </div>

                {/* Photo Gallery Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Camera className="h-6 w-6 mr-2 text-green-600" />
                    Photo Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {pkg.images.map((image, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img
                          src={image}
                          alt={`${pkg.title} ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                          onClick={() => setCurrentImageIndex(index)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Food & Dining Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Utensils className="h-6 w-6 mr-2 text-green-600" />
                    Food & Dining
                  </h3>
                  <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-orange-800 mb-3">Meal Schedule</h4>
                        <ul className="space-y-2 text-orange-700">
                          <li className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span><strong>Breakfast:</strong> 7:00 AM - 8:30 AM</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span><strong>Lunch:</strong> 12:30 PM - 1:30 PM</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span><strong>Dinner:</strong> 7:30 PM - 9:00 PM</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-800 mb-3">Local Cuisine</h4>
                        <ul className="space-y-1 text-orange-700">
                          <li>• Traditional Kerala meals</li>
                          <li>• Fresh local vegetables</li>
                          <li>• Spiced tea and coffee</li>
                          <li>• Regional specialties</li>
                          <li>• Vegetarian & non-veg options</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trek Highlights */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Mountain className="h-6 w-6 mr-2 text-green-600" />
                    Trek Highlights
                  </h3>
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-green-800 mb-3">Scenic Attractions</h4>
                        <ul className="space-y-1 text-green-700">
                          <li>• Panoramic mountain views</li>
                          <li>• Pristine waterfalls</li>
                          <li>• Dense forest trails</li>
                          <li>• Wildlife spotting opportunities</li>
                          <li>• Sunrise/sunset viewpoints</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800 mb-3">Best Times</h4>
                        <ul className="space-y-2 text-green-700">
                          <li className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span><strong>Start:</strong> 6:00 AM daily</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span><strong>Peak hours:</strong> 8:00 AM - 4:00 PM</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span><strong>Return:</strong> By 6:00 PM</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">What's Included</h4>
                    <ul className="space-y-2">
                      {pkg.included.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">What's Excluded</h4>
                    <ul className="space-y-2">
                      {pkg.excluded.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Day-by-Day Itinerary</h3>
                {pkg.itinerary.map((day) => (
                  <div key={day.day} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">
                      Day {day.day}: {day.title}
                    </h4>
                    <p className="text-gray-700 mb-3">{day.description}</p>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Activities:</span>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {day.activities.map((activity, index) => (
                          <li key={index}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-6 w-6 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{pkg.rating}/5</p>
                  <p className="text-gray-600">Based on {pkg.total_reviews} reviews</p>
                </div>
                <div className="text-center text-gray-600">
                  <p>Reviews will be loaded here in the full implementation</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Footer */}
        <div className="border-t p-6 bg-gray-50 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <IndianRupee className="h-6 w-6 text-green-600" />
              <span className="text-3xl font-bold text-green-600">₹{pkg.price.toLocaleString()}</span>
            </div>
            <span className="text-sm text-gray-600">per person</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowBooking(true)}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageModal;
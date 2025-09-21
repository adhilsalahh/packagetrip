import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { TrekPackage } from '../../types';

interface PackageFormModalProps {
  package?: TrekPackage | null;
  onClose: () => void;
  onSave: (packageData: any) => Promise<void>;
}

const PackageFormModal: React.FC<PackageFormModalProps> = ({ package: pkg, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration: 1,
    difficulty: 'Easy' as 'Easy' | 'Moderate' | 'Difficult' | 'Expert',
    price: 0,
    max_group_size: 1,
    images: '',
    included: '',
    excluded: '',
    itinerary: [
      {
        day_number: 1,
        title: '',
        description: '',
        activities: ''
      }
    ]
  });

  useEffect(() => {
    if (pkg) {
      setFormData({
        title: pkg.title,
        description: pkg.description,
        location: pkg.location,
        duration: pkg.duration,
        difficulty: pkg.difficulty,
        price: pkg.price,
        max_group_size: pkg.max_group_size,
        images: pkg.images.join(', '),
        included: pkg.included.join(', '),
        excluded: pkg.excluded.join(', '),
        itinerary: pkg.itinerary.map(day => ({
          day_number: day.day,
          title: day.title,
          description: day.description,
          activities: day.activities.join(', ')
        }))
      });
    }
  }, [pkg]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' || name === 'max_group_size' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleItineraryChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => 
        i === index 
          ? { ...day, [field]: field === 'day_number' ? parseInt(value) || 1 : value }
          : day
      )
    }));
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        {
          day_number: prev.itinerary.length + 1,
          title: '',
          description: '',
          activities: ''
        }
      ]
    }));
  };

  const removeItineraryDay = (index: number) => {
    if (formData.itinerary.length > 1) {
      setFormData(prev => ({
        ...prev,
        itinerary: prev.itinerary.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.location.trim()) return 'Location is required';
    if (formData.duration < 1) return 'Duration must be at least 1 day';
    if (formData.price <= 0) return 'Price must be greater than 0';
    if (formData.max_group_size < 1) return 'Max group size must be at least 1';
    if (!formData.images.trim()) return 'At least one image URL is required';
    
    // Validate itinerary
    for (let i = 0; i < formData.itinerary.length; i++) {
      const day = formData.itinerary[i];
      if (!day.title.trim()) return `Day ${i + 1} title is required`;
      if (!day.description.trim()) return `Day ${i + 1} description is required`;
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    
    try {
      const packageData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        duration: formData.duration,
        difficulty: formData.difficulty,
        price: formData.price,
        max_group_size: formData.max_group_size,
        images: formData.images.split(',').map(url => url.trim()).filter(url => url),
        included: formData.included.split(',').map(item => item.trim()).filter(item => item),
        excluded: formData.excluded.split(',').map(item => item.trim()).filter(item => item),
        itinerary: formData.itinerary.map(day => ({
          day_number: day.day_number,
          title: day.title.trim(),
          description: day.description.trim(),
          activities: day.activities.split(',').map(activity => activity.trim()).filter(activity => activity)
        }))
      };

      await onSave(packageData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {pkg ? 'Edit Package' : 'Create New Package'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Munnar Tea Garden Trek"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Munnar"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    max="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Difficult">Difficult</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 8500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Group Size *
                  </label>
                  <input
                    type="number"
                    name="max_group_size"
                    value={formData.max_group_size}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Detailed description of the trekking package..."
                  required
                />
              </div>
            </div>

            {/* Images and Lists */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Images and Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URLs * (comma-separated)
                  </label>
                  <textarea
                    name="images"
                    value={formData.images}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Enter valid image URLs separated by commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What's Included (comma-separated)
                  </label>
                  <textarea
                    name="included"
                    value={formData.included}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Professional guide, Accommodation, Meals, Transportation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What's Excluded (comma-separated)
                  </label>
                  <textarea
                    name="excluded"
                    value={formData.excluded}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Personal expenses, Travel insurance, Tips"
                  />
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Day-by-Day Itinerary</h3>
                <button
                  type="button"
                  onClick={addItineraryDay}
                  className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Day</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.itinerary.map((day, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Day {index + 1}</h4>
                      {formData.itinerary.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItineraryDay(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Day Title *
                        </label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., Arrival and Tea Museum Visit"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Activities (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={day.activities}
                          onChange={(e) => handleItineraryChange(index, 'activities', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Hotel check-in, Tea museum tour, Evening walk"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        value={day.description}
                        onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Detailed description of the day's activities..."
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6 bg-gray-50 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : pkg ? 'Update Package' : 'Create Package'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageFormModal;
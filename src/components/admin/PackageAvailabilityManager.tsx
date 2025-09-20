import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit, Package } from 'lucide-react';
import { TrekPackage } from '../../types';
import { PackageAvailability } from '../../types/admin';
import { getTrekPackages } from '../../lib/database';
import { 
  getPackageAvailability, 
  addPackageAvailability, 
  updatePackageAvailability,
  removePackageAvailability 
} from '../../lib/admin';

const PackageAvailabilityManager: React.FC = () => {
  const [packages, setPackages] = useState<TrekPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [availability, setAvailability] = useState<PackageAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    date: '',
    maxBookings: 1
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (selectedPackage) {
      fetchAvailability();
    }
  }, [selectedPackage]);

  const fetchPackages = async () => {
    try {
      const data = await getTrekPackages();
      setPackages(data);
      if (data.length > 0) {
        setSelectedPackage(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchAvailability = async () => {
    if (!selectedPackage) return;
    
    try {
      setLoading(true);
      const data = await getPackageAvailability(selectedPackage);
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !newAvailability.date) return;

    try {
      await addPackageAvailability(
        selectedPackage,
        newAvailability.date,
        newAvailability.maxBookings
      );
      
      setNewAvailability({ date: '', maxBookings: 1 });
      setShowAddForm(false);
      await fetchAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
    }
  };

  const handleRemoveAvailability = async (availabilityId: string) => {
    if (!confirm('Are you sure you want to remove this availability?')) return;

    try {
      await removePackageAvailability(availabilityId);
      await fetchAvailability();
    } catch (error) {
      console.error('Error removing availability:', error);
    }
  };

  const handleToggleAvailability = async (availabilityId: string, isAvailable: boolean) => {
    try {
      await updatePackageAvailability(availabilityId, { is_available: !isAvailable });
      await fetchAvailability();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const selectedPackageData = packages.find(p => p.id === selectedPackage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Package Availability Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Available Date</span>
        </button>
      </div>

      {/* Package Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-4">
          <Package className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold">Select Package</h3>
        </div>
        
        <select
          value={selectedPackage}
          onChange={(e) => setSelectedPackage(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select a package...</option>
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.title} - {pkg.location}
            </option>
          ))}
        </select>

        {selectedPackageData && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900">{selectedPackageData.title}</h4>
            <p className="text-gray-600">{selectedPackageData.location} • {selectedPackageData.duration} days</p>
            <p className="text-green-600 font-semibold">₹{selectedPackageData.price.toLocaleString()} per person</p>
          </div>
        )}
      </div>

      {/* Add Availability Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-green-200">
          <h3 className="text-lg font-semibold mb-4">Add New Available Date</h3>
          
          <form onSubmit={handleAddAvailability} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Date
                </label>
                <input
                  type="date"
                  value={newAvailability.date}
                  onChange={(e) => setNewAvailability(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Bookings
                </label>
                <input
                  type="number"
                  value={newAvailability.maxBookings}
                  onChange={(e) => setNewAvailability(prev => ({ ...prev, maxBookings: parseInt(e.target.value) }))}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Availability
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Availability List */}
      {selectedPackage && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Available Dates</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading availability...</p>
            </div>
          ) : availability.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No available dates</h3>
              <p className="text-gray-600">Add some available dates to start accepting bookings</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availability.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(item.available_date)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.current_bookings} / {item.max_bookings}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(item.current_bookings / item.max_bookings) * 100}%`
                            }}
                          ></div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.is_available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.is_available)}
                          className={`${
                            item.is_available 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {item.is_available ? 'Disable' : 'Enable'}
                        </button>
                        
                        <button
                          onClick={() => handleRemoveAvailability(item.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PackageAvailabilityManager;
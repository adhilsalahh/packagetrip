import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  IndianRupee,
  Star,
  AlertCircle
} from 'lucide-react';
import { TrekPackage } from '../../types';
import { 
  getAllTrekPackagesAdmin, 
  createTrekPackage, 
  updateTrekPackage, 
  deleteTrekPackage,
  togglePackageStatus 
} from '../../lib/database';
import PackageFormModal from './PackageFormModal';

const PackageListAdmin: React.FC = () => {
  const [packages, setPackages] = useState<TrekPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TrekPackage | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTrekPackagesAdmin();
      setPackages(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && pkg.is_active) ||
      (filterStatus === 'inactive' && !pkg.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreatePackage = async (packageData: any) => {
    try {
      await createTrekPackage(packageData);
      await fetchPackages();
      setShowModal(false);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create package');
    }
  };

  const handleUpdatePackage = async (packageData: any) => {
    if (!editingPackage) return;
    
    try {
      await updateTrekPackage(editingPackage.id, packageData);
      await fetchPackages();
      setShowModal(false);
      setEditingPackage(null);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update package');
    }
  };

  const handleDeletePackage = async (packageId: string, packageTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${packageTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(packageId);
      await deleteTrekPackage(packageId);
      await fetchPackages();
    } catch (err: any) {
      alert(err.message || 'Failed to delete package');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (packageId: string, currentStatus: boolean) => {
    try {
      setActionLoading(packageId);
      await togglePackageStatus(packageId, !currentStatus);
      await fetchPackages();
    } catch (err: any) {
      alert(err.message || 'Failed to update package status');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (pkg: TrekPackage) => {
    setEditingPackage(pkg);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingPackage(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPackage(null);
  };

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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Package Management</h2>
          <p className="text-gray-600">Create, edit, and manage trekking packages</p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Error loading packages</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchPackages}
              className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages by title, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Packages</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <p>Showing {filteredPackages.length} of {packages.length} packages</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Active ({packages.filter(p => p.is_active).length})</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Inactive ({packages.filter(p => !p.is_active).length})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Packages List */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No packages found' : 'No packages yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first trekking package to get started'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={openCreateModal}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create First Package
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{pkg.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(pkg.difficulty)}`}>
                        {pkg.difficulty}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${pkg.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{pkg.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{pkg.duration} days</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Max {pkg.max_group_size}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{pkg.rating || 'No rating'} ({pkg.total_reviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-green-600 font-bold text-xl">
                      <IndianRupee className="h-5 w-5" />
                      <span>{pkg.price.toLocaleString()}</span>
                    </div>
                    <span className="text-sm text-gray-500">per person</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4 line-clamp-2">{pkg.description}</p>

                {/* Images Preview */}
                <div className="flex space-x-2 mb-4 overflow-x-auto">
                  {pkg.images.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${pkg.title} ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                  {pkg.images.length > 4 && (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm flex-shrink-0">
                      +{pkg.images.length - 4}
                    </div>
                  )}
                </div>

                {/* Itinerary Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Itinerary ({pkg.itinerary.length} days)</h4>
                  <div className="text-sm text-gray-600">
                    {pkg.itinerary.slice(0, 2).map((day, index) => (
                      <p key={index} className="mb-1">
                        <strong>Day {day.day}:</strong> {day.title}
                      </p>
                    ))}
                    {pkg.itinerary.length > 2 && (
                      <p className="text-gray-500">... and {pkg.itinerary.length - 2} more days</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => handleToggleStatus(pkg.id, pkg.is_active)}
                    disabled={actionLoading === pkg.id}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      pkg.is_active
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } disabled:opacity-50`}
                  >
                    {pkg.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>
                      {actionLoading === pkg.id 
                        ? 'Updating...' 
                        : pkg.is_active ? 'Deactivate' : 'Activate'
                      }
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleDeletePackage(pkg.id, pkg.title)}
                    disabled={actionLoading === pkg.id}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{actionLoading === pkg.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Package Form Modal */}
      {showModal && (
        <PackageFormModal
          package={editingPackage}
          onClose={closeModal}
          onSave={editingPackage ? handleUpdatePackage : handleCreatePackage}
        />
      )}
    </div>
  );
};

export default PackageListAdmin;
import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import PackageCard from './PackageCard';
import PackageModal from './PackageModal';
import { TrekPackage } from '../../types';
import { usePackages } from '../../hooks/usePackages';

const PackagesList: React.FC = () => {
  const { packages, loading, error } = usePackages();
  const [selectedPackage, setSelectedPackage] = useState<TrekPackage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    difficulty: '',
    duration: '',
    priceRange: '',
    sortBy: 'rating'
  });

  const filteredPackages = useMemo(() => {
    let filtered = packages.filter(pkg => {
      const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pkg.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = !filters.location || pkg.location === filters.location;
      const matchesDifficulty = !filters.difficulty || pkg.difficulty === filters.difficulty;
      
      let matchesDuration = true;
      if (filters.duration) {
        switch (filters.duration) {
          case '1-2':
            matchesDuration = pkg.duration <= 2;
            break;
          case '3-4':
            matchesDuration = pkg.duration >= 3 && pkg.duration <= 4;
            break;
          case '5+':
            matchesDuration = pkg.duration >= 5;
            break;
        }
      }

      let matchesPrice = true;
      if (filters.priceRange) {
        switch (filters.priceRange) {
          case '0-7500':
            matchesPrice = pkg.price <= 7500;
            break;
          case '7500-12500':
            matchesPrice = pkg.price > 7500 && pkg.price <= 12500;
            break;
          case '12500+':
            matchesPrice = pkg.price > 12500;
            break;
        }
      }

      return matchesSearch && matchesLocation && matchesDifficulty && matchesDuration && matchesPrice;
    });

    // Sort packages
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'rating':
      default:
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [packages, searchTerm, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      difficulty: '',
      duration: '',
      priceRange: '',
      sortBy: 'rating'
    });
    setSearchTerm('');
  };

  return (
    <section id="packages" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Trekking Packages
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our carefully curated collection of trekking adventures across Kerala's most beautiful landscapes
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages, locations, or activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  <option value="Munnar">Munnar</option>
                  <option value="Wayanad">Wayanad</option>
                  <option value="Thekkady">Thekkady</option>
                  <option value="Idukki">Idukki</option>
                  <option value="Thrissur">Thrissur</option>
                  <option value="Palakkad">Palakkad</option>
                </select>

                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Difficult">Difficult</option>
                  <option value="Expert">Expert</option>
                </select>

                <select
                  value={filters.duration}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Any Duration</option>
                  <option value="1-2">1-2 Days</option>
                  <option value="3-4">3-4 Days</option>
                  <option value="5+">5+ Days</option>
                </select>

                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Any Price</option>
                  <option value="0-7500">Under ₹7,500</option>
                  <option value="7500-12500">₹7,500 - ₹12,500</option>
                  <option value="12500+">Above ₹12,500</option>
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-600">
              Showing {filteredPackages.length} of {packages.length} packages
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <p className="text-lg font-medium">Error loading packages</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Packages Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onViewDetails={(id) => {
                  const selected = packages.find(p => p.id === id);
                  setSelectedPackage(selected || null);
                }}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {selectedPackage && (
        <PackageModal
          package={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </section>
  );
};

export default PackagesList;
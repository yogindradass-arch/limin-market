import { useState, useEffect } from 'react';
import type { SearchFilters, SavedSearchFormData } from '../types/search';
import { countActiveFilters, getFilterSummary } from '../types/search';
import CategorySpecificFilters from './CategorySpecificFilters';
import { supabase } from '../lib/supabase';

interface AdvancedSearchModalProps {
  onClose: () => void;
  onApplyFilters: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  userId?: string;
}

const categories = [
  'Electronics',
  'Fashion',
  'Household',
  'Sports',
  'Vehicles',
  'Real Estate',
  'Jobs',
  'Services',
  'Books',
  'Furniture',
  'Tools',
  'Toys',
  'Other',
];

const locations = [
  // Guyana 🇬🇾
  'Georgetown, Guyana',
  'New Amsterdam, Guyana',
  'Linden, Guyana',
  'Anna Regina, Guyana',
  'Bartica, Guyana',
  'Skeldon, Guyana',
  'Rose Hall, Guyana',
  'Mahaica, Guyana',
  // New York 🇺🇸
  'Queens, NY',
  'Brooklyn, NY',
  'Bronx, NY',
  'Richmond Hill, NY',
  'Ozone Park, NY',
  'South Ozone Park, NY',
  'Jamaica, NY',
  'Schenectady, NY',
  'Albany, NY',
  // Florida
  'Miami, FL',
  'Fort Lauderdale, FL',
  'Orlando, FL',
  // Other
  'Toronto, Canada',
  'Other',
];

export default function AdvancedSearchModal({
  onClose,
  onApplyFilters,
  initialFilters,
  userId
}: AdvancedSearchModalProps) {
  const [filters, setFilters] = useState<SearchFilters>(
    initialFilters || {
      categories: [],
    }
  );

  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleClearFilters = () => {
    setFilters({ categories: [] });
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleSaveSearch = async () => {
    if (!userId) {
      alert('You must be signed in to save searches');
      return;
    }

    if (!searchName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from('saved_searches').insert({
        user_id: userId,
        name: searchName,
        filters: filters,
      });

      if (error) {
        console.error('Error saving search:', error);
        alert('Failed to save search. Please try again.');
        return;
      }

      alert('Search saved successfully!');
      setShowSaveSearch(false);
      setSearchName('');
    } catch (error) {
      console.error('Error saving search:', error);
      alert('Failed to save search. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const activeFiltersCount = countActiveFilters(filters);
  const filterSummary = getFilterSummary(filters);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-limin-dark">Advanced Search</h2>
            {activeFiltersCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filter Summary */}
        {activeFiltersCount > 0 && (
          <div className="px-6 py-4 bg-limin-primary/10 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-limin-dark">
                <span className="font-semibold">Active Filters:</span> {filterSummary}
              </p>
              <button
                onClick={handleClearFilters}
                className="text-sm text-limin-primary hover:text-orange-600 font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Filters Content */}
        <div className="p-6 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="font-bold text-limin-dark text-lg mb-3">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label
                  key={category}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    filters.categories.includes(category)
                      ? 'border-limin-primary bg-limin-primary/10'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-5 h-5 text-limin-primary rounded focus:ring-limin-primary"
                  />
                  <span className="font-medium text-limin-dark">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-bold text-limin-dark text-lg mb-3">Price Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin || ''}
                    onChange={(e) =>
                      handleFilterChange({
                        priceMin: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.priceMax || ''}
                    onChange={(e) =>
                      handleFilterChange({
                        priceMax: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-bold text-limin-dark text-lg mb-3">Location</h3>
            <select
              value={filters.location || ''}
              onChange={(e) =>
                handleFilterChange({ location: e.target.value || undefined })
              }
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Listing Type & Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-limin-dark text-lg mb-3">Listing Type</h3>
              <select
                value={filters.listingType || ''}
                onChange={(e) =>
                  handleFilterChange({
                    listingType: e.target.value as any || undefined,
                  })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any Type</option>
                <option value="standard">Standard</option>
                <option value="wholesale">Wholesale</option>
                <option value="local">Local</option>
              </select>
            </div>
            <div>
              <h3 className="font-bold text-limin-dark text-lg mb-3">Listing Mode</h3>
              <select
                value={filters.listingMode || ''}
                onChange={(e) =>
                  handleFilterChange({
                    listingMode: e.target.value as any || undefined,
                  })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any Mode</option>
                <option value="offering">Offering (Selling)</option>
                <option value="seeking">Seeking (Buying)</option>
              </select>
            </div>
          </div>

          {/* Category-Specific Filters */}
          <CategorySpecificFilters
            selectedCategories={filters.categories}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 space-y-3">
          {/* Save Search Section */}
          {userId && (
            <div>
              {!showSaveSearch ? (
                <button
                  onClick={() => setShowSaveSearch(true)}
                  disabled={activeFiltersCount === 0}
                  className="w-full py-3 border-2 border-limin-primary text-limin-primary rounded-xl font-semibold hover:bg-limin-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save This Search
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Name this search (e.g., '3BR Homes Georgetown')"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
                    maxLength={50}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSearch}
                      disabled={saving || !searchName.trim()}
                      className="flex-1 py-3 bg-limin-primary text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveSearch(false);
                        setSearchName('');
                      }}
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Apply Filters Button */}
          <button
            onClick={handleApplyFilters}
            className="w-full py-4 bg-limin-primary text-white rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
          >
            Apply Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}

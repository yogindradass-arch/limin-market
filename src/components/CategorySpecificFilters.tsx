import type { SearchFilters } from '../types/search';

interface CategorySpecificFiltersProps {
  selectedCategories: string[];
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
}

export default function CategorySpecificFilters({
  selectedCategories,
  filters,
  onFilterChange
}: CategorySpecificFiltersProps) {
  const hasRealEstate = selectedCategories.includes('Real Estate');
  const hasVehicles = selectedCategories.includes('Vehicles');
  const hasJobs = selectedCategories.includes('Jobs');
  const hasServices = selectedCategories.includes('Services');

  if (!hasRealEstate && !hasVehicles && !hasJobs && !hasServices) {
    return null;
  }

  return (
    <div className="space-y-6 pt-4 border-t-2 border-gray-200">
      <h3 className="font-bold text-limin-dark text-lg">Category-Specific Filters</h3>

      {/* Real Estate Filters */}
      {hasRealEstate && (
        <div className="space-y-4">
          <h4 className="font-semibold text-limin-dark">Real Estate</h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => onFilterChange({
                  bedrooms: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <select
                value={filters.bathrooms || ''}
                onChange={(e) => onFilterChange({
                  bathrooms: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={filters.propertyType || ''}
                onChange={(e) => onFilterChange({
                  propertyType: e.target.value || undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Land">Land</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Listing Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Listing Purpose
              </label>
              <select
                value={filters.listingPurpose || ''}
                onChange={(e) => onFilterChange({
                  listingPurpose: e.target.value || undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Filters */}
      {hasVehicles && (
        <div className="space-y-4">
          <h4 className="font-semibold text-limin-dark">Vehicles</h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Year Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Year
              </label>
              <input
                type="number"
                placeholder="e.g., 2015"
                value={filters.yearMin || ''}
                onChange={(e) => onFilterChange({
                  yearMin: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Year
              </label>
              <input
                type="number"
                placeholder="e.g., 2024"
                value={filters.yearMax || ''}
                onChange={(e) => onFilterChange({
                  yearMax: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            {/* Max Mileage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Mileage
              </label>
              <input
                type="number"
                placeholder="e.g., 50000"
                value={filters.mileageMax || ''}
                onChange={(e) => onFilterChange({
                  mileageMax: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
                min="0"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                value={filters.vehicleCondition || ''}
                onChange={(e) => onFilterChange({
                  vehicleCondition: e.target.value || undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="New">New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Used">Used</option>
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transmission
              </label>
              <select
                value={filters.transmission || ''}
                onChange={(e) => onFilterChange({
                  transmission: e.target.value || undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Type
              </label>
              <select
                value={filters.fuelType || ''}
                onChange={(e) => onFilterChange({
                  fuelType: e.target.value || undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="Gasoline">Gasoline</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Job Filters */}
      {hasJobs && (
        <div className="space-y-4">
          <h4 className="font-semibold text-limin-dark">Jobs</h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                value={filters.jobType || ''}
                onChange={(e) => onFilterChange({
                  jobType: e.target.value || undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={filters.experienceLevel || ''}
                onChange={(e) => onFilterChange({
                  experienceLevel: e.target.value || undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
              </select>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Salary
              </label>
              <input
                type="number"
                placeholder="e.g., 50000"
                value={filters.salaryMin || ''}
                onChange={(e) => onFilterChange({
                  salaryMin: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Salary
              </label>
              <input
                type="number"
                placeholder="e.g., 100000"
                value={filters.salaryMax || ''}
                onChange={(e) => onFilterChange({
                  salaryMax: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Service Filters */}
      {hasServices && (
        <div className="space-y-4">
          <h4 className="font-semibold text-limin-dark">Services</h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={filters.serviceType || ''}
                onChange={(e) => onFilterChange({
                  serviceType: e.target.value || undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="Delivery">Delivery</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Repairs">Repairs</option>
                <option value="Construction">Construction</option>
                <option value="Moving">Moving</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Price Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Type
              </label>
              <select
                value={filters.priceType || ''}
                onChange={(e) => onFilterChange({
                  priceType: e.target.value || undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="Hourly">Hourly</option>
                <option value="Per Job">Per Job</option>
                <option value="Per Item">Per Item</option>
                <option value="Per Mile">Per Mile</option>
              </select>
            </div>

            {/* Hourly Rate Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Hourly Rate
              </label>
              <input
                type="number"
                placeholder="e.g., 20"
                value={filters.hourlyRateMin || ''}
                onChange={(e) => onFilterChange({
                  hourlyRateMin: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Hourly Rate
              </label>
              <input
                type="number"
                placeholder="e.g., 50"
                value={filters.hourlyRateMax || ''}
                onChange={(e) => onFilterChange({
                  hourlyRateMax: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
                min="0"
              />
            </div>

            {/* Response Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Time
              </label>
              <select
                value={filters.responseTime || ''}
                onChange={(e) => onFilterChange({
                  responseTime: e.target.value || undefined
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-limin-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="Same Day">Same Day</option>
                <option value="24 Hours">24 Hours</option>
                <option value="48 Hours">48 Hours</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface SearchFilters {
  // Basic filters
  categories: string[];
  priceMin?: number;
  priceMax?: number;
  location?: string;
  listingType?: 'standard' | 'wholesale' | 'local';
  listingMode?: 'offering' | 'seeking';

  // Real Estate specific
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  propertyType?: string;  // House, Apartment, Land, Commercial
  listingPurpose?: string;  // For Sale, For Rent

  // Vehicle specific
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  yearMin?: number;
  yearMax?: number;
  mileage?: number;
  mileageMax?: number;
  vehicleCondition?: string;  // New, Used, Excellent, Good, Fair
  transmission?: string;  // Automatic, Manual
  fuelType?: string;  // Gasoline, Diesel, Electric, Hybrid

  // Job specific
  jobType?: string;  // Full-time, Part-time, Contract, Temporary
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;  // Entry Level, Mid Level, Senior Level

  // Service specific
  serviceType?: string;  // Delivery, Cleaning, Repairs, Construction, etc.
  serviceArea?: string;  // Areas served
  priceType?: string;  // Hourly, Per Job, Per Item, Per Mile
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  responseTime?: string;  // Same Day, 24 Hours, 48 Hours
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: SearchFilters;
  created_at: string;
}

export interface SavedSearchFormData {
  name: string;
  filters: SearchFilters;
}

// Helper function to check if any filters are active
export function hasActiveFilters(filters: SearchFilters): boolean {
  return (
    filters.categories.length > 0 ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.location !== undefined ||
    filters.listingType !== undefined ||
    filters.listingMode !== undefined ||
    filters.bedrooms !== undefined ||
    filters.bathrooms !== undefined ||
    filters.squareFeet !== undefined ||
    filters.propertyType !== undefined ||
    filters.listingPurpose !== undefined ||
    filters.vehicleMake !== undefined ||
    filters.vehicleModel !== undefined ||
    filters.vehicleYear !== undefined ||
    filters.yearMin !== undefined ||
    filters.yearMax !== undefined ||
    filters.mileage !== undefined ||
    filters.mileageMax !== undefined ||
    filters.vehicleCondition !== undefined ||
    filters.transmission !== undefined ||
    filters.fuelType !== undefined ||
    filters.jobType !== undefined ||
    filters.salaryMin !== undefined ||
    filters.salaryMax !== undefined ||
    filters.experienceLevel !== undefined ||
    filters.serviceType !== undefined ||
    filters.serviceArea !== undefined ||
    filters.priceType !== undefined ||
    filters.hourlyRateMin !== undefined ||
    filters.hourlyRateMax !== undefined ||
    filters.responseTime !== undefined
  );
}

// Helper function to count active filters
export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;

  if (filters.categories.length > 0) count++;
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) count++;
  if (filters.location) count++;
  if (filters.listingType) count++;
  if (filters.listingMode) count++;
  if (filters.bedrooms) count++;
  if (filters.bathrooms) count++;
  if (filters.squareFeet) count++;
  if (filters.propertyType) count++;
  if (filters.listingPurpose) count++;
  if (filters.vehicleMake) count++;
  if (filters.vehicleModel) count++;
  if (filters.vehicleYear || filters.yearMin || filters.yearMax) count++;
  if (filters.mileage || filters.mileageMax) count++;
  if (filters.vehicleCondition) count++;
  if (filters.transmission) count++;
  if (filters.fuelType) count++;
  if (filters.jobType) count++;
  if (filters.salaryMin || filters.salaryMax) count++;
  if (filters.experienceLevel) count++;
  if (filters.serviceType) count++;
  if (filters.serviceArea) count++;
  if (filters.priceType) count++;
  if (filters.hourlyRateMin || filters.hourlyRateMax) count++;
  if (filters.responseTime) count++;

  return count;
}

// Helper to get a summary of active filters
export function getFilterSummary(filters: SearchFilters): string {
  const parts: string[] = [];

  if (filters.categories.length > 0) {
    parts.push(`${filters.categories.length} ${filters.categories.length === 1 ? 'category' : 'categories'}`);
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    if (filters.priceMin && filters.priceMax) {
      parts.push(`$${filters.priceMin}-$${filters.priceMax}`);
    } else if (filters.priceMin) {
      parts.push(`Min $${filters.priceMin}`);
    } else if (filters.priceMax) {
      parts.push(`Max $${filters.priceMax}`);
    }
  }

  if (filters.location) {
    parts.push(filters.location);
  }

  if (filters.listingType) {
    parts.push(filters.listingType);
  }

  if (filters.listingMode) {
    parts.push(filters.listingMode);
  }

  // Real Estate
  if (filters.bedrooms) {
    parts.push(`${filters.bedrooms} bed`);
  }
  if (filters.bathrooms) {
    parts.push(`${filters.bathrooms} bath`);
  }

  // Vehicle
  if (filters.vehicleYear || filters.yearMin || filters.yearMax) {
    if (filters.vehicleYear) {
      parts.push(`${filters.vehicleYear}`);
    } else if (filters.yearMin && filters.yearMax) {
      parts.push(`${filters.yearMin}-${filters.yearMax}`);
    }
  }

  return parts.length > 0 ? parts.join(', ') : 'No filters';
}

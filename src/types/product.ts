export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  images?: string[];  // Array of all product images
  rating: number;
  seller: string;
  sellerId?: string;
  sellerPhone: string;
  location: string;
  timeAgo: string;
  listingType?: 'wholesale' | 'local' | 'standard';
  isFavorited?: boolean;
  category?: string;
  description?: string;
  status?: 'active' | 'sold' | 'expired';
  expiresAt?: string;
  createdAt?: string;
  // Real Estate fields
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  propertyType?: string;  // House, Apartment, Land, Commercial
  listingPurpose?: string;  // For Sale, For Rent
  // Vehicle fields
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  mileage?: number;
  vehicleCondition?: string;  // New, Used, Excellent, Good, Fair
  transmission?: string;  // Automatic, Manual
  fuelType?: string;  // Gasoline, Diesel, Electric, Hybrid
  // Job fields
  jobType?: string;  // Full-time, Part-time, Contract, Temporary
  salaryMin?: number;
  salaryMax?: number;
  company?: string;
  experienceLevel?: string;  // Entry Level, Mid Level, Senior Level
}

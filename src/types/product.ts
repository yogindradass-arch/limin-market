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
}

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  rating: number;
  seller: string;
  sellerId?: string;
  sellerPhone: string;
  location: string;
  timeAgo: string;
  listingType?: 'wholesale' | 'local';
  isFavorited?: boolean;
  category?: string;
  description?: string;
}

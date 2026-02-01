import type { Product } from './product';

export interface Review {
  id: string;
  reviewer_id: string;
  seller_id: string;
  product_id: string | null;
  rating: number; // 1-5
  comment: string | null;
  created_at: string;
  updated_at: string;
  // Enhanced fields from joins
  reviewer_name?: string;
  reviewer_email?: string;
  product?: Product;
}

export interface SellerRating {
  seller_id: string;
  review_count: number;
  average_rating: number; // Decimal(3,2) - e.g., 4.67
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

export interface ReviewSubmissionProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
  productId?: string;
  onReviewSubmitted?: () => void;
}

export interface ReviewsListProps {
  sellerId: string;
  limit?: number;
  showPagination?: boolean;
}

// Helper function to format rating display
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// Helper function to get rating category
export function getRatingCategory(rating: number): 'excellent' | 'good' | 'average' | 'poor' | 'very-poor' {
  if (rating >= 4.5) return 'excellent';
  if (rating >= 3.5) return 'good';
  if (rating >= 2.5) return 'average';
  if (rating >= 1.5) return 'poor';
  return 'very-poor';
}

// Helper function to generate star display (★★★★☆)
export function generateStarDisplay(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return '★'.repeat(fullStars) +
         (hasHalfStar ? '⯨' : '') +
         '☆'.repeat(emptyStars);
}

// Helper function to calculate rating percentage for progress bars
export function calculateRatingPercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

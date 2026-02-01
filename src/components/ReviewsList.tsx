import { useState, useEffect } from 'react';
import type { Review, SellerRating, ReviewsListProps } from '../types/review';
import { supabase } from '../lib/supabase';
import { calculateRatingPercentage } from '../types/review';

export default function ReviewsList({
  sellerId,
  limit = 10,
  showPagination = true
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sellerRating, setSellerRating] = useState<SellerRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  const totalPages = Math.ceil(totalReviews / limit);

  useEffect(() => {
    fetchReviews();
    fetchSellerRating();
  }, [sellerId, currentPage]);

  const fetchSellerRating = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_ratings')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching seller rating:', error);
        return;
      }

      setSellerRating(data || null);
    } catch (error) {
      console.error('Error fetching seller rating:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);

      // Get total count
      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId);

      setTotalReviews(count || 0);

      // Get paginated reviews
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      // Enhance reviews with reviewer names
      const enhancedReviews = await Promise.all(
        (data || []).map(async (review) => {
          // Fetch reviewer profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', review.reviewer_id)
            .single();

          return {
            ...review,
            reviewer_name: profile?.full_name || 'Anonymous'
          };
        })
      );

      setReviews(enhancedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-limin-primary' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-limin-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {sellerRating && sellerRating.review_count > 0 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-start gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-limin-dark mb-2">
                {sellerRating.average_rating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(sellerRating.average_rating))}
              </div>
              <p className="text-sm text-gray-600">
                {sellerRating.review_count} {sellerRating.review_count === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = sellerRating[`${['five', 'four', 'three', 'two', 'one'][5 - star]}_star_count` as keyof SellerRating] as number;
                const percentage = calculateRatingPercentage(count, sellerRating.review_count);

                return (
                  <div key={star} className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-700 w-12">
                      {star} star
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-limin-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
          <p className="text-gray-600">Be the first to review this seller!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border-2 border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
              {/* Reviewer Info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-limin-primary to-orange-600 flex items-center justify-center text-white font-bold">
                    {review.reviewer_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-limin-dark">{review.reviewer_name}</p>
                    <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-limin-primary text-white'
                      : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

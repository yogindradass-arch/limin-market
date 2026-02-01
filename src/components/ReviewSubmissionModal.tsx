import { useState } from 'react';
import type { ReviewSubmissionProps } from '../types/review';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function ReviewSubmissionModal({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  productId,
  onReviewSubmitted
}: ReviewSubmissionProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to submit a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (user.id === sellerId) {
      setError('You cannot review yourself');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Check if user has already reviewed this seller
      const { data: existingReview, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', user.id)
        .eq('seller_id', sellerId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected
        throw checkError;
      }

      if (existingReview) {
        setError('You have already reviewed this seller. Each buyer can only leave one review per seller.');
        setSubmitting(false);
        return;
      }

      // Insert review
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          seller_id: sellerId,
          product_id: productId || null,
          rating,
          comment: comment.trim() || null
        });

      if (insertError) {
        throw insertError;
      }

      // Success!
      setRating(0);
      setComment('');
      onReviewSubmitted?.();
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          className="focus:outline-none transition-transform hover:scale-110"
          aria-label={`Rate ${i} stars`}
        >
          <svg
            className={`w-12 h-12 ${
              i <= displayRating ? 'text-limin-primary' : 'text-gray-300'
            } transition-colors`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      );
    }

    return stars;
  };

  const getRatingLabel = (rating: number): string => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl transform transition-all">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-limin-dark">Leave a Review</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-limin-primary to-orange-600 flex items-center justify-center text-white font-bold text-2xl mb-3">
                {sellerName.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-semibold text-lg text-limin-dark">
                How was your experience with {sellerName}?
              </h3>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <div className="flex justify-center gap-2 mb-2">
                {renderStars()}
              </div>
              <p className="text-center text-lg font-medium text-limin-dark">
                {getRatingLabel(hoveredRating || rating)}
              </p>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Share your experience (optional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience with this seller..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-limin-primary transition-colors resize-none"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rating === 0 || submitting}
                className="flex-1 px-6 py-3 bg-limin-primary text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import type { Product } from '../types/product';
import { useAuth } from '../context/AuthContext';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onFavoriteToggle?: (productId: string) => void;
  onDelete?: (productId: string) => void;
}

export default function ProductDetailModal({ product, isOpen, onClose, onFavoriteToggle, onDelete }: ProductDetailModalProps) {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !product) return null;

  const isOwner = user && product.sellerId === user.id;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(product.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="max-h-[90vh] overflow-y-auto">
            {/* Image */}
            <div className="relative aspect-[4/3] bg-gray-200">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle?.(product.id);
                }}
                className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                aria-label={product.isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <svg
                  className="w-6 h-6"
                  fill={product.isFavorited ? "#FF6B35" : "none"}
                  stroke={product.isFavorited ? "#FF6B35" : "currentColor"}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Badges */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {product.listingType === 'wholesale' && (
                  <span className="px-2 py-1 bg-limin-secondary text-white text-xs font-semibold rounded">
                    WHOLESALE
                  </span>
                )}
                {product.listingType === 'local' && (
                  <span className="px-2 py-1 bg-limin-accent text-limin-dark text-xs font-semibold rounded">
                    LOCAL
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-6">
              {/* Price and Title */}
              <div>
                <div className="text-3xl font-bold text-limin-primary mb-2">
                  {product.price === 0 ? 'FREE' : `$${product.price}`}
                </div>
                <h2 className="text-2xl font-bold text-limin-dark mb-3">{product.title}</h2>

                {/* Rating and Location */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-limin-accent fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{product.location}</span>
                  </div>
                  <span>• {product.timeAgo} ago</span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-limin-dark mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                </div>
              )}

              {/* Seller Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-limin-dark mb-3">Seller Information</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-limin-primary flex items-center justify-center text-white font-bold text-lg">
                    {product.seller.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-limin-dark">{product.seller}</div>
                    <div className="text-sm text-gray-600">Member since 2024</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Contact Button */}
                <a
                  href={`tel:${product.sellerPhone}`}
                  className="w-full bg-limin-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call {product.sellerPhone}
                </a>

                {/* Delete Button (only for owner) */}
                {isOwner && !showDeleteConfirm && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full border-2 border-red-500 text-red-500 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Listing
                  </button>
                )}

                {/* Delete Confirmation */}
                {isOwner && showDeleteConfirm && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 space-y-3">
                    <p className="text-red-800 font-medium text-center">Are you sure you want to delete this listing?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

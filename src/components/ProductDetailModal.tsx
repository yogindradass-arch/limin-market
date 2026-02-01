import { useState, useEffect } from 'react';
import type { Product } from '../types/product';
import { useAuth } from '../context/AuthContext';
import ShareButton from './ShareButton';
import { supabase } from '../lib/supabase';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onFavoriteToggle?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  onEdit?: (productId: string) => void;
  onReport?: (productId: string, reason: string) => void;
  onMarkAsSold?: (productId: string) => void;
  onExtendListing?: (productId: string) => void;
  onViewSellerProfile?: (sellerId: string, sellerName: string) => void;
}

export default function ProductDetailModal({ product, isOpen, onClose, onFavoriteToggle, onDelete, onEdit, onReport, onMarkAsSold, onExtendListing, onViewSellerProfile }: ProductDetailModalProps) {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Track view when modal opens
  useEffect(() => {
    if (isOpen && product) {
      const incrementViews = async () => {
        try {
          const { error } = await supabase.rpc('increment_product_views', {
            product_id: product.id
          });

          if (error) {
            console.error('Error incrementing views:', error);
          }
        } catch (error) {
          console.error('Error incrementing views:', error);
        }
      };

      incrementViews();
    }
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  const isOwner = user && product.sellerId === user.id;

  // Get category-specific icon for listings without images
  const getCategoryIcon = () => {
    switch (product.category) {
      case 'Services':
        return '🤝';
      case 'Real Estate':
        return '🏠';
      case 'Vehicles':
        return '🚗';
      case 'Jobs':
        return '💼';
      case 'Electronics':
        return '📱';
      default:
        return '📦';
    }
  };

  // Check if product has a valid image
  const currentImage = (product.images && product.images.length > 0) ? product.images[currentImageIndex] : product.image;
  const hasImage = currentImage &&
    currentImage !== 'null' &&
    currentImage !== '' &&
    !currentImage.includes('unsplash.com');

  const handleDelete = () => {
    if (onDelete) {
      onDelete(product.id);
      onClose();
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(product.id);
      onClose();
    }
  };

  const handleReport = () => {
    if (onReport && reportReason.trim()) {
      onReport(product.id, reportReason);
      setShowReportModal(false);
      setReportReason('');
      alert('Thank you for your report. We will review it shortly.');
    }
  };

  const handleMarkAsSold = () => {
    if (onMarkAsSold) {
      onMarkAsSold(product.id);
    }
  };

  const handleExtendListing = () => {
    if (onExtendListing) {
      onExtendListing(product.id);
    }
  };

  // Calculate days until expiration
  const getDaysUntilExpiration = () => {
    if (!product.expiresAt) return null;
    const now = new Date();
    const expiresAt = new Date(product.expiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiration = getDaysUntilExpiration();
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration > 0;

  // Format phone number for WhatsApp (remove spaces, dashes, parentheses)
  const getWhatsAppNumber = (phone: string) => {
    return phone.replace(/[^0-9+]/g, '');
  };

  const getWhatsAppLink = () => {
    const formattedPhone = getWhatsAppNumber(product.sellerPhone);
    const message = encodeURIComponent(`Hi! I'm interested in your listing: ${product.title}`);
    return `https://wa.me/${formattedPhone}?text=${message}`;
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
            {/* Image Carousel */}
            <div className="relative aspect-[4/3] bg-gray-200">
              {hasImage ? (
                <img
                  src={currentImage}
                  alt={`${product.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-limin-primary/10 to-limin-secondary/10">
                  <div className="text-center">
                    <div className="text-9xl mb-4">{getCategoryIcon()}</div>
                    <div className="text-lg text-gray-600 font-medium px-4">{product.category || 'General'}</div>
                  </div>
                </div>
              )}

              {/* Navigation Arrows - only show if multiple images */}
              {product.images && product.images.length > 1 && (
                <>
                  {/* Previous Image Button */}
                  {currentImageIndex > 0 && (
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Next Image Button */}
                  {currentImageIndex < product.images.length - 1 && (
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>

                  {/* Image Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

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
                  <span className="px-2 py-1 bg-limin-primary text-white text-xs font-bold rounded shadow-md">
                    WHOLESALE
                  </span>
                )}
                {product.listingType === 'local' && (
                  <span className="px-2 py-1 bg-limin-secondary text-white text-xs font-bold rounded shadow-md">
                    LOCAL
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-6">
              {/* Price and Title */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-limin-primary mb-2">
                  {product.listingMode === 'seeking' ? (
                    product.price === 0 ? (
                      <span className="text-purple-600">Budget: Negotiable</span>
                    ) : (
                      <span className="text-purple-600">Budget: ${product.price.toFixed(2)}</span>
                    )
                  ) : (
                    product.price === 0 ? 'FREE' : `$${product.price.toFixed(2)}`
                  )}
                </div>
                <h2 className="text-2xl font-bold text-limin-dark mb-3">{product.title}</h2>

                {/* Rating and Location */}
                <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-limin-accent fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{product.location}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span>{product.timeAgo}</span>
                  {product.views !== undefined && product.views > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{product.views} {product.views === 1 ? 'view' : 'views'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="border-t pt-5 mt-5">
                  <h3 className="text-lg font-semibold text-limin-dark mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                </div>
              )}

              {/* Specs Grid - Category Specific Details */}
              {(product.category === 'Real Estate' || product.category === 'Vehicles' || product.category === 'Jobs' || product.category === 'Services') && (
                <div className="border-t pt-5 mt-5">
                  <h3 className="text-lg font-semibold text-limin-dark mb-3">Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Real Estate Specs */}
                    {product.category === 'Real Estate' && (
                      <>
                        {product.bedrooms && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Bedrooms</div>
                            <div className="text-base font-semibold text-limin-dark">{product.bedrooms}</div>
                          </div>
                        )}
                        {product.bathrooms && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Bathrooms</div>
                            <div className="text-base font-semibold text-limin-dark">{product.bathrooms}</div>
                          </div>
                        )}
                        {product.squareFeet && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Square Feet</div>
                            <div className="text-base font-semibold text-limin-dark">{product.squareFeet.toLocaleString()}</div>
                          </div>
                        )}
                        {product.propertyType && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Property Type</div>
                            <div className="text-base font-semibold text-limin-dark">{product.propertyType}</div>
                          </div>
                        )}
                        {product.listingPurpose && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Listing Purpose</div>
                            <div className="text-base font-semibold text-limin-dark">{product.listingPurpose}</div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Vehicle Specs */}
                    {product.category === 'Vehicles' && (
                      <>
                        {product.vehicleYear && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Year</div>
                            <div className="text-base font-semibold text-limin-dark">{product.vehicleYear}</div>
                          </div>
                        )}
                        {product.vehicleMake && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Make</div>
                            <div className="text-base font-semibold text-limin-dark">{product.vehicleMake}</div>
                          </div>
                        )}
                        {product.vehicleModel && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Model</div>
                            <div className="text-base font-semibold text-limin-dark">{product.vehicleModel}</div>
                          </div>
                        )}
                        {product.mileage && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Mileage</div>
                            <div className="text-base font-semibold text-limin-dark">{product.mileage.toLocaleString()} mi</div>
                          </div>
                        )}
                        {product.vehicleCondition && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Condition</div>
                            <div className="text-base font-semibold text-limin-dark">{product.vehicleCondition}</div>
                          </div>
                        )}
                        {product.transmission && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Transmission</div>
                            <div className="text-base font-semibold text-limin-dark">{product.transmission}</div>
                          </div>
                        )}
                        {product.fuelType && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Fuel Type</div>
                            <div className="text-base font-semibold text-limin-dark">{product.fuelType}</div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Job Specs */}
                    {product.category === 'Jobs' && (
                      <>
                        {product.jobType && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Job Type</div>
                            <div className="text-base font-semibold text-limin-dark">{product.jobType}</div>
                          </div>
                        )}
                        {product.experienceLevel && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Experience Level</div>
                            <div className="text-base font-semibold text-limin-dark">{product.experienceLevel}</div>
                          </div>
                        )}
                        {product.company && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Company</div>
                            <div className="text-base font-semibold text-limin-dark">{product.company}</div>
                          </div>
                        )}
                        {(product.salaryMin || product.salaryMax) && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Salary Range</div>
                            <div className="text-base font-semibold text-limin-dark">
                              ${product.salaryMin?.toLocaleString() || '0'} - ${product.salaryMax?.toLocaleString() || '0'}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Service Specs */}
                    {product.category === 'Services' && (
                      <>
                        {product.serviceType && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Service Type</div>
                            <div className="text-base font-semibold text-limin-dark">{product.serviceType}</div>
                          </div>
                        )}
                        {product.priceType && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Price Type</div>
                            <div className="text-base font-semibold text-limin-dark">{product.priceType}</div>
                          </div>
                        )}
                        {product.hourlyRate && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Hourly Rate</div>
                            <div className="text-base font-semibold text-limin-dark">${product.hourlyRate}</div>
                          </div>
                        )}
                        {product.responseTime && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Response Time</div>
                            <div className="text-base font-semibold text-limin-dark">{product.responseTime}</div>
                          </div>
                        )}
                        {product.serviceArea && (
                          <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                            <div className="text-xs text-gray-500 mb-1">Service Area</div>
                            <div className="text-base font-semibold text-limin-dark">{product.serviceArea}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              <div className="border-t pt-5 mt-5">
                <h3 className="text-lg font-semibold text-limin-dark mb-4">Seller Information</h3>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-limin-primary to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {product.seller.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        if (onViewSellerProfile && product.sellerId) {
                          onViewSellerProfile(product.sellerId, product.seller);
                        }
                      }}
                      className="font-semibold text-limin-dark text-lg hover:text-limin-primary transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {product.seller}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Verified Seller</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expiration Warning - only show to owner if expiring soon */}
              {isOwner && isExpiringSoon && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⏰</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-900 mb-1">Listing Expiring Soon</h4>
                      <p className="text-sm text-yellow-800">
                        This listing will expire in <strong>{daysUntilExpiration} {daysUntilExpiration === 1 ? 'day' : 'days'}</strong>.
                        Extend it to keep it active for another 30 days.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-5 mt-5">
                {/* Share Button - visible to everyone */}
                <div className="flex justify-center mb-4">
                  <ShareButton product={product} />
                </div>

                {/* Contact Button - only show if not owner */}
                {!isOwner && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Call Button */}
                      <a
                        href={`tel:${product.sellerPhone}`}
                        className="bg-limin-primary text-white py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call
                      </a>

                      {/* WhatsApp Button */}
                      <a
                        href={getWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white py-4 rounded-xl font-semibold hover:bg-green-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>
                    </div>

                    {/* Report Button */}
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Report Listing
                    </button>
                  </div>
                )}

                {/* Owner Actions */}
                {isOwner && !showDeleteConfirm && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Edit Button */}
                      <button
                        onClick={handleEdit}
                        className="border-2 border-limin-primary text-limin-primary py-3 rounded-xl font-semibold hover:bg-limin-primary hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="border-2 border-red-500 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>

                    {/* Mark as Sold Button */}
                    <button
                      onClick={handleMarkAsSold}
                      className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mark as Sold
                    </button>

                    {/* Extend Listing Button - show if expiring soon */}
                    {isExpiringSoon && (
                      <button
                        onClick={handleExtendListing}
                        className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Extend Listing (30 days)
                      </button>
                    )}
                  </div>
                )}

                {/* Delete Confirmation */}
                {isOwner && showDeleteConfirm && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 space-y-3">
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

                {/* Report Modal */}
                {showReportModal && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-gray-900">Report this listing</h4>
                    <p className="text-sm text-gray-600">Please tell us why you're reporting this listing:</p>
                    <div className="space-y-2">
                      {['Inappropriate content', 'Scam or fraud', 'Misleading information', 'Duplicate listing', 'Other'].map((reason) => (
                        <button
                          key={reason}
                          onClick={() => setReportReason(reason)}
                          className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-colors ${
                            reportReason === reason
                              ? 'border-limin-primary bg-limin-primary/10 text-limin-primary font-semibold'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => {
                          setShowReportModal(false);
                          setReportReason('');
                        }}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReport}
                        disabled={!reportReason}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Report
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

import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
  onFavoriteToggle?: (productId: string) => void;
}

export default function ProductCard({ product, onProductClick, onFavoriteToggle }: ProductCardProps) {
  const handleClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(product.id);
    }
  };

  // Calculate if listing is expiring soon
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

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer relative"
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.listingType && (
            <>
              {product.listingType === 'wholesale' && (
                <span className="bg-limin-primary text-white text-xs font-bold px-2 py-1 rounded">
                  WHOLESALE
                </span>
              )}
              {product.listingType === 'local' && (
                <span className="bg-limin-secondary text-white text-xs font-bold px-2 py-1 rounded">
                  LOCAL
                </span>
              )}
            </>
          )}
          {isExpiringSoon && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              ⏰ {daysUntilExpiration}d left
            </span>
          )}
        </div>

        {/* Heart/Favorite Icon */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <svg
            className={`w-5 h-5 ${product.isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'}`}
            fill={product.isFavorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className="p-3">
        {/* Price */}
        <p className="text-lg font-bold text-limin-dark mb-1">
          {product.price === 0 ? 'FREE' : `$${product.price.toFixed(2)}`}
        </p>

        {/* Title */}
        <h3 className="text-sm text-gray-700 mb-2 line-clamp-2 leading-snug">
          {product.title}
        </h3>

        {/* Specialized Details */}
        {product.category === 'Real Estate' && (product.bedrooms || product.bathrooms || product.squareFeet) && (
          <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
            {product.bedrooms && <span>{product.bedrooms} bed</span>}
            {product.bedrooms && product.bathrooms && <span>•</span>}
            {product.bathrooms && <span>{product.bathrooms} bath</span>}
            {(product.bedrooms || product.bathrooms) && product.squareFeet && <span>•</span>}
            {product.squareFeet && <span>{product.squareFeet.toLocaleString()} sq ft</span>}
          </div>
        )}

        {product.category === 'Vehicles' && (product.vehicleYear || product.vehicleMake || product.mileage) && (
          <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
            {product.vehicleYear && <span>{product.vehicleYear}</span>}
            {product.vehicleYear && product.vehicleMake && <span></span>}
            {product.vehicleMake && <span>{product.vehicleMake}</span>}
            {product.vehicleModel && <span>{product.vehicleModel}</span>}
            {(product.vehicleYear || product.vehicleMake) && product.mileage && <span>•</span>}
            {product.mileage && <span>{product.mileage.toLocaleString()} mi</span>}
          </div>
        )}

        {product.category === 'Jobs' && (product.jobType || product.experienceLevel || product.salaryMin) && (
          <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
            {product.jobType && <span>{product.jobType}</span>}
            {product.jobType && product.experienceLevel && <span>•</span>}
            {product.experienceLevel && <span>{product.experienceLevel}</span>}
            {(product.jobType || product.experienceLevel) && (product.salaryMin || product.salaryMax) && <span>•</span>}
            {(product.salaryMin || product.salaryMax) && (
              <span>
                ${product.salaryMin?.toLocaleString() || '0'}-{product.salaryMax?.toLocaleString() || '0'}
              </span>
            )}
          </div>
        )}

        {/* Location and Time */}
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate">{product.location}</span>
          <span className="mx-1">•</span>
          <span>{product.timeAgo}</span>
        </div>

        {/* Contact Seller Indicator */}
        <div className="flex items-center text-xs text-limin-primary">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-medium">Contact Seller</span>
        </div>
      </div>
    </div>
  );
}

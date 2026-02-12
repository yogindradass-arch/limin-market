import { useState } from 'react';
import type { Product } from '../types/product';

interface FeedProductCardProps {
  product: Product;
  isFavorited: boolean;
  onFavorite: () => void;
  onSkip: () => void;
  onContactSeller: () => void;
}

export default function FeedProductCard({
  product,
  isFavorited,
  onFavorite,
  onSkip,
  onContactSeller
}: FeedProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Vehicles': '🚗',
      'Real Estate': '🏠',
      'Electronics': '📱',
      'Fashion': '👕',
      'Home & Garden': '🏡',
      'Jobs': '💼',
      'Services': '🔧',
      'Food & Dining': '🍔',
      'Sports & Outdoors': '⚽',
      'Books & Media': '📚',
      'Pets': '🐾',
      'Baby & Kids': '👶',
      'Health & Beauty': '💄',
      'Arts & Crafts': '🎨',
      'Toys & Games': '🎮',
      'Musical Instruments': '🎸',
      'Events & Tickets': '🎫',
      'Business & Industrial': '🏭',
      'Collectibles & Antiques': '🏺',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Product Image/Video - Full screen background */}
      <div className="absolute inset-0">
        {!imageLoaded && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-limin-primary/20 to-limin-secondary/20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
          </div>
        )}

        <img
          src={product.image || 'https://via.placeholder.com/800x1200?text=No+Image'}
          alt={product.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
      </div>

      {/* Content overlay */}
      <div className="relative h-full flex flex-col justify-between p-6 text-white">
        {/* Top section - Category badge */}
        <div className="flex justify-between items-start pt-12">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full">
            <span className="text-lg">{getCategoryIcon(product.category)}</span>
            <span className="text-sm font-medium">{product.category}</span>
          </div>

          {product.listing_type && (
            <div className="px-3 py-1.5 bg-limin-primary/90 backdrop-blur-md rounded-full">
              <span className="text-xs font-bold uppercase">
                {product.listing_type === 'wholesale' ? '📦 Wholesale' :
                 product.listing_type === 'local' ? '📍 Local Only' : '✨ Standard'}
              </span>
            </div>
          )}
        </div>

        {/* Bottom section - Product details */}
        <div className="space-y-4 pb-4">
          {/* Price - Prominent */}
          <div className="text-5xl font-bold tracking-tight">
            {formatPrice(product.price)}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold line-clamp-2">
            {product.title}
          </h2>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-white/80 line-clamp-3 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-4 text-sm text-white/70">
            {product.location && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{product.location}</span>
              </div>
            )}

            {product.condition && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{product.condition}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{new Date(product.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Seller info */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 bg-gradient-to-br from-limin-primary to-limin-secondary rounded-full flex items-center justify-center text-white font-bold">
              {product.seller_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold">{product.seller_name || 'Anonymous'}</p>
              <p className="text-xs text-white/60">Seller</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons - Right side (TikTok style) */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6">
        {/* Favorite button */}
        <button
          onClick={onFavorite}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isFavorited
              ? 'bg-red-500 scale-110'
              : 'bg-black/50 backdrop-blur-md hover:bg-black/70 group-hover:scale-110'
          }`}>
            <svg
              className="w-7 h-7"
              fill={isFavorited ? 'currentColor' : 'none'}
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
          </div>
          <span className="text-xs font-semibold text-white/90">
            {isFavorited ? 'Saved' : 'Save'}
          </span>
        </button>

        {/* Contact seller button */}
        <button
          onClick={onContactSeller}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-14 h-14 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-limin-primary transition-all group-hover:scale-110">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-white/90">Chat</span>
        </button>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-14 h-14 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/70 transition-all group-hover:scale-110">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-white/90">Skip</span>
        </button>
      </div>
    </div>
  );
}

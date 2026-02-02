import type { Product } from '../types/product';
import { convertPrice } from '../lib/currency';

interface TrendingSectionProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  currency?: 'GYD' | 'USD';
}

export default function TrendingSection({ products, onProductClick, currency = 'GYD' }: TrendingSectionProps) {
  if (products.length === 0) return null;

  // Get category-specific icon for listings without images
  const getCategoryIcon = (category?: string) => {
    switch (category) {
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

  return (
    <div className="px-4 py-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-limin-dark flex items-center gap-2">
            🔥 Trending This Week
          </h2>
          <p className="text-sm text-gray-600">Most viewed items</p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-limin-primary animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {products.slice(0, 10).map((product, index) => (
          <button
            key={product.id}
            onClick={() => onProductClick(product)}
            className="relative flex-shrink-0 w-32 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            {/* Trending badge */}
            {index < 3 && (
              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                #{index + 1}
              </div>
            )}

            {/* Image */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
              {product.image &&
               product.image !== 'null' &&
               product.image !== '' &&
               !product.image.includes('unsplash.com') ? (
                <img
                  src={product.imageVariants?.thumb || product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-limin-primary/10 to-limin-secondary/10">
                  <span className="text-4xl">{getCategoryIcon(product.category)}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-900 truncate mb-1">
                {product.title}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-limin-primary whitespace-nowrap">
                  {product.price === 0 ? 'FREE' : <>${convertPrice(product.price, currency).toFixed(2)} <span className="text-[10px] opacity-70">{currency}</span></>}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {product.views || 0}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

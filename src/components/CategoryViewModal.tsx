import type { Product } from '../types/product';
import ProductCard from './ProductCard';

interface CategoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  products: Product[];
  onProductClick: (product: Product) => void;
  onFavoriteToggle: (productId: string) => void;
}

export default function CategoryViewModal({
  isOpen,
  onClose,
  category,
  products,
  onProductClick,
  onFavoriteToggle
}: CategoryViewModalProps) {
  if (!isOpen) return null;

  // Get category-specific info
  const getCategoryInfo = () => {
    switch (category) {
      case 'Jobs':
        return { icon: '💼', title: 'Jobs', subtitle: 'Find your next opportunity' };
      case 'Vehicles':
        return { icon: '🚗', title: 'Vehicles', subtitle: 'Cars, trucks & more' };
      case 'Services':
        return { icon: '🤝', title: 'Services', subtitle: 'Professional services' };
      default:
        return { icon: '📦', title: category, subtitle: 'Browse listings' };
    }
  };

  const categoryInfo = getCategoryInfo();

  const filteredProducts = products.filter(p => p.category === category);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-limin-primary to-orange-600 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Browse {categoryInfo.title}</h1>
            <div className="w-10"></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-4xl">{categoryInfo.icon}</div>
            <div>
              <h2 className="text-2xl font-bold">{categoryInfo.title}</h2>
              <p className="text-sm opacity-90">{categoryInfo.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Stats */}
        <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Listings</p>
              <p className="text-2xl font-bold text-limin-primary">{filteredProducts.length}</p>
            </div>
            <div className="text-4xl opacity-50">{categoryInfo.icon}</div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <h3 className="text-lg font-bold text-limin-dark mb-4">All {categoryInfo.title}</h3>
            <div className="grid grid-cols-2 gap-3 pb-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={onProductClick}
                  onFavoriteToggle={onFavoriteToggle}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">{categoryInfo.icon}</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No {categoryInfo.title} Yet</h3>
            <p className="text-gray-500">Be the first to post in this category!</p>
          </div>
        )}
      </div>
    </div>
  );
}

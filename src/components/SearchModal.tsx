import { useState } from 'react';
import type { Product } from '../types/product';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function SearchModal({ isOpen, onClose, products, onProductClick }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 });

  if (!isOpen) return null;

  // Filter products based on search criteria
  const filteredProducts = products.filter(product => {
    const matchesQuery = searchQuery === '' ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    const matchesLocation = selectedLocation === '' || product.location === selectedLocation;
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;

    return matchesQuery && matchesCategory && matchesLocation && matchesPrice;
  });

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const locations = Array.from(new Set(products.map(p => p.location)));

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setPriceRange({ min: 0, max: 1000000 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close search"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-limin-primary"
              autoFocus
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 space-y-3">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-limin-primary font-medium whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Price:</span>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
              placeholder="Min"
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
              placeholder="Max"
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 text-sm text-gray-600 border-b">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
            </div>
            <div className="divide-y">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => {
                    onProductClick(product);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-limin-dark line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-lg font-bold text-limin-primary">
                        {product.price === 0 ? 'FREE' : `$${product.price}`}
                      </span>
                      <span className="text-sm text-gray-500">{product.location}</span>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

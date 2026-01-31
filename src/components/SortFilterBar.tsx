interface SortFilterBarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  showFreeOnly: boolean;
  onFreeOnlyChange: (value: boolean) => void;
  onClearFilters: () => void;
}

export default function SortFilterBar({
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  showFreeOnly,
  onFreeOnlyChange,
  onClearFilters,
}: SortFilterBarProps) {
  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 10000 || showFreeOnly;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex flex-col gap-4">
        {/* Sort and Free Toggle Row */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex-1">
            <label className="text-xs text-gray-600 mb-1 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-limin-primary focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>

          {/* Free Items Toggle */}
          <div className="flex items-center gap-2 pt-5">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={(e) => onFreeOnlyChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-limin-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-limin-primary"></div>
              <span className="ml-2 text-sm text-gray-700 whitespace-nowrap">Free Only</span>
            </label>
          </div>
        </div>

        {/* Price Range Filter */}
        {!showFreeOnly && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-600">Price Range</label>
              <span className="text-xs text-gray-700 font-medium">
                ${priceRange[0]} - ${priceRange[1] === 10000 ? '10,000+' : priceRange[1]}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
                placeholder="Min"
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-limin-primary focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                value={priceRange[1] === 10000 ? '' : priceRange[1]}
                onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value) || 10000])}
                placeholder="Max"
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-limin-primary focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-limin-primary font-medium hover:text-limin-primary/80 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

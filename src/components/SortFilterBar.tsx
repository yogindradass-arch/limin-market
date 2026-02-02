import PriceRangeSlider from './PriceRangeSlider';

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

        {/* Price Range Slider */}
        {!showFreeOnly && (
          <div className="bg-gray-50 rounded-lg px-8 py-5 overflow-hidden">
            <PriceRangeSlider
              min={0}
              max={10000}
              minValue={priceRange[0]}
              maxValue={priceRange[1]}
              step={50}
              onChange={(min, max) => onPriceRangeChange([min, max])}
              formatValue={(v) => v === 10000 ? '$10,000+' : `$${v.toLocaleString()} GYD`}
              compact={true}
            />
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

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = ['All', 'Nearby', 'Real Estate', 'Vehicles', 'Jobs', 'Under $50', 'Wholesale'];

export default function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter
                ? 'bg-limin-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}

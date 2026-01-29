interface LocationBarProps {
  location: string;
  onLocationClick?: () => void;
}

export default function LocationBar({ location, onLocationClick }: LocationBarProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <button
        onClick={onLocationClick}
        className="w-full flex items-center justify-center py-2 px-4 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-4 h-4 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm text-gray-700">
          Shopping in: <span className="font-semibold">{location}</span>
        </span>
        <svg className="w-4 h-4 text-gray-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

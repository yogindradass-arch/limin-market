interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (location: string) => void;
}

const locations = [
  { name: 'Georgetown', emoji: '🏙️', region: 'Demerara-Mahaica' },
  { name: 'New Amsterdam', emoji: '🌆', region: 'East Berbice-Corentyne' },
  { name: 'Linden', emoji: '🏘️', region: 'Upper Demerara-Berbice' },
  { name: 'Anna Regina', emoji: '🏞️', region: 'Pomeroon-Supenaam' },
  { name: 'Bartica', emoji: '⛰️', region: 'Cuyuni-Mazaruni' },
  { name: 'Skeldon', emoji: '🌾', region: 'East Berbice-Corentyne' },
  { name: 'Rose Hall', emoji: '🌹', region: 'East Berbice-Corentyne' },
  { name: 'Mahaica', emoji: '🌴', region: 'Demerara-Mahaica' },
  { name: 'Lethem', emoji: '🦘', region: 'Upper Takutu-Upper Essequibo' },
  { name: 'Mahdia', emoji: '⛏️', region: 'Potaro-Siparuni' },
];

export default function LocationSelector({ isOpen, onClose, currentLocation, onSelectLocation }: LocationSelectorProps) {
  if (!isOpen) return null;

  const handleSelect = (location: string) => {
    onSelectLocation(location);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <h2 className="text-xl font-bold text-limin-dark">Select Location</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Location */}
          <div className="px-6 py-4 bg-limin-primary/5 border-b">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Currently shopping in: <strong>{currentLocation}</strong></span>
            </div>
          </div>

          {/* Locations List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {locations.map((location) => (
              <button
                key={location.name}
                onClick={() => handleSelect(location.name)}
                className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b ${
                  currentLocation === location.name ? 'bg-limin-primary/5' : ''
                }`}
              >
                <span className="text-3xl">{location.emoji}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{location.name}</div>
                  <div className="text-sm text-gray-500">{location.region}</div>
                </div>
                {currentLocation === location.name && (
                  <svg className="w-5 h-5 text-limin-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* All of Guyana Option */}
          <button
            onClick={() => handleSelect('All of Guyana')}
            className="w-full px-6 py-4 bg-gradient-to-r from-limin-primary to-orange-600 text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Browse All of Guyana
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

interface SafeMeetingSpot {
  id: string;
  name: string;
  type: 'police_station' | 'bank' | 'mall' | 'public_space' | 'community_center';
  address: string;
  city: string;
  hours: string;
  is_verified: boolean;
}

interface SafeMeetingLocationsProps {
  userCity?: string;
  compact?: boolean;
}

export default function SafeMeetingLocations({ userCity = 'Georgetown', compact = false }: SafeMeetingLocationsProps) {
  const [locations, setLocations] = useState<SafeMeetingSpot[]>([]);
  const [selectedCity, setSelectedCity] = useState(userCity);
  const [loading, setLoading] = useState(true);

  // Mock data - in production this would come from Supabase
  useEffect(() => {
    const mockLocations: SafeMeetingSpot[] = [
      // Georgetown
      { id: '1', name: 'Georgetown Police Station', type: 'police_station', address: 'Brickdam, Georgetown', city: 'Georgetown', hours: '24/7', is_verified: true },
      { id: '2', name: 'Banks DIH Limited', type: 'bank', address: 'Church Street, Georgetown', city: 'Georgetown', hours: 'Mon-Fri 8am-3pm', is_verified: true },
      { id: '3', name: 'Giftland Mall', type: 'mall', address: 'Turkeyen, East Coast Demerara', city: 'Georgetown', hours: '9am-9pm daily', is_verified: true },
      // Queens
      { id: '4', name: 'NYPD 103rd Precinct', type: 'police_station', address: '168-02 91st Ave, Queens, NY', city: 'Queens', hours: '24/7', is_verified: true },
      { id: '5', name: 'Jamaica Center Mall', type: 'mall', address: '161-10 Jamaica Ave, Queens, NY', city: 'Queens', hours: '10am-8pm daily', is_verified: true },
      { id: '6', name: 'Queens Public Library', type: 'public_space', address: '89-11 Merrick Blvd, Queens, NY', city: 'Queens', hours: '10am-6pm', is_verified: true },
      // Brooklyn
      { id: '7', name: 'NYPD 67th Precinct', type: 'police_station', address: '2820 Snyder Ave, Brooklyn, NY', city: 'Brooklyn', hours: '24/7', is_verified: true },
      { id: '8', name: 'Kings Plaza Shopping Center', type: 'mall', address: '5100 Kings Plaza, Brooklyn, NY', city: 'Brooklyn', hours: '10am-9pm daily', is_verified: true },
      // Miami
      { id: '9', name: 'Miami Police Department', type: 'police_station', address: '400 NW 2nd Ave, Miami, FL', city: 'Miami', hours: '24/7', is_verified: true },
      { id: '10', name: 'Dadeland Mall', type: 'mall', address: '7535 N Kendall Dr, Miami, FL', city: 'Miami', hours: '10am-9pm daily', is_verified: true }
    ];

    const filtered = mockLocations.filter(loc => loc.city === selectedCity);
    setLocations(filtered);
    setLoading(false);
  }, [selectedCity]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'police_station': return '🚔';
      case 'bank': return '🏦';
      case 'mall': return '🏬';
      case 'public_space': return '🏛️';
      case 'community_center': return '🏘️';
      default: return '📍';
    }
  };

  const getTypeName = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const cities = ['Georgetown', 'Queens', 'Brooklyn', 'Miami', 'Toronto'];

  if (compact) {
    return (
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-start gap-2">
          <span className="text-xl">🛡️</span>
          <div>
            <h4 className="font-semibold text-sm text-gray-800 mb-1">Safe Meeting Spots</h4>
            <p className="text-xs text-gray-600 mb-2">Meet in public, safe locations:</p>
            <div className="space-y-1">
              {locations.slice(0, 2).map(loc => (
                <div key={loc.id} className="text-xs">
                  <span className="font-medium">{getTypeIcon(loc.type)} {loc.name}</span>
                  <span className="text-gray-500 ml-1">• {loc.hours}</span>
                </div>
              ))}
            </div>
            {locations.length > 2 && (
              <p className="text-xs text-blue-600 mt-2">+ {locations.length - 2} more safe spots</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🛡️</span>
          <h3 className="text-lg font-bold">Safe Meeting Locations</h3>
        </div>
        <p className="text-sm text-blue-100">
          Always meet in public, verified safe spots when completing transactions
        </p>
      </div>

      {/* City Selector */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <label className="block text-xs font-medium text-gray-700 mb-2">Select Your City:</label>
        <div className="flex gap-2 flex-wrap">
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCity === city
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Locations List */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <p>Loading safe locations...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No safe meeting spots listed for {selectedCity} yet.</p>
            <p className="text-xs mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {locations.map(location => (
              <div
                key={location.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {getTypeIcon(location.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {location.name}
                      </h4>
                      {location.is_verified && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      {getTypeName(location.type)}
                    </p>

                    <p className="text-xs text-gray-700 mb-2">
                      📍 {location.address}
                    </p>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600">
                        🕒 {location.hours}
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        📱 Get Directions →
                        </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Safety Tips */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Safety Tips:</strong> Always meet during business hours, bring a friend, and let someone know where you're going. Never meet at your home or the buyer's home.
          </p>
        </div>
      </div>
    </div>
  );
}

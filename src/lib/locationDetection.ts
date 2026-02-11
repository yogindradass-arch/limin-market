// Location detection utility - hybrid approach
// Tries browser geolocation first, falls back to IP-based detection

interface Location {
  lat: number;
  lon: number;
}

interface DetectionResult {
  location: string;
  method: 'gps' | 'ip' | 'manual';
}

// All available locations with approximate coordinates
const LOCATION_COORDS: Record<string, Location> = {
  // Guyana
  'Georgetown, Guyana': { lat: 6.8013, lon: -58.1551 },
  'New Amsterdam, Guyana': { lat: 6.2491, lon: -57.5168 },
  'Linden, Guyana': { lat: 5.9992, lon: -58.3036 },
  'Anna Regina, Guyana': { lat: 7.2667, lon: -58.5000 },
  'Bartica, Guyana': { lat: 6.4000, lon: -58.6167 },
  'Skeldon, Guyana': { lat: 5.8833, lon: -57.1333 },
  'Rose Hall, Guyana': { lat: 6.3000, lon: -57.3000 },
  'Mahaica, Guyana': { lat: 6.4833, lon: -57.9167 },
  // New York
  'Queens, NY': { lat: 40.7282, lon: -73.7949 },
  'Brooklyn, NY': { lat: 40.6782, lon: -73.9442 },
  'Bronx, NY': { lat: 40.8448, lon: -73.8648 },
  'Richmond Hill, NY': { lat: 40.7007, lon: -73.8315 },
  'Ozone Park, NY': { lat: 40.6760, lon: -73.8438 },
  'South Ozone Park, NY': { lat: 40.6743, lon: -73.8152 },
  'Jamaica, NY': { lat: 40.6916, lon: -73.8062 },
  'Schenectady, NY': { lat: 42.8142, lon: -73.9396 },
  'Albany, NY': { lat: 42.6526, lon: -73.7562 },
  'Yonkers, NY': { lat: 40.9312, lon: -73.8987 },
  'Mount Vernon, NY': { lat: 40.9126, lon: -73.8376 },
  'Staten Island, NY': { lat: 40.5795, lon: -74.1502 },
  // Florida
  'Miami, FL': { lat: 25.7617, lon: -80.1918 },
  'Fort Lauderdale, FL': { lat: 26.1224, lon: -80.1373 },
  'Orlando, FL': { lat: 28.5383, lon: -81.3792 },
  'Lauderhill, FL': { lat: 26.1403, lon: -80.2134 },
  'Pembroke Pines, FL': { lat: 26.0034, lon: -80.2240 },
  'Miramar, FL': { lat: 25.9773, lon: -80.3322 },
  'Tampa, FL': { lat: 27.9506, lon: -82.4572 },
  'Jacksonville, FL': { lat: 30.3322, lon: -81.6557 },
  // Other US
  'Atlanta, GA': { lat: 33.7490, lon: -84.3880 },
  'Houston, TX': { lat: 29.7604, lon: -95.3698 },
  'Dallas, TX': { lat: 32.7767, lon: -96.7970 },
  'Washington, DC': { lat: 38.9072, lon: -77.0369 },
  'Charlotte, NC': { lat: 35.2271, lon: -80.8431 },
  'Boston, MA': { lat: 42.3601, lon: -71.0589 },
  'Philadelphia, PA': { lat: 39.9526, lon: -75.1652 },
  'Chicago, IL': { lat: 41.8781, lon: -87.6298 },
  'Los Angeles, CA': { lat: 34.0522, lon: -118.2437 },
  'Baltimore, MD': { lat: 39.2904, lon: -76.6122 },
  // Canada
  'Toronto, Canada': { lat: 43.6532, lon: -79.3832 },
  'Brampton, Canada': { lat: 43.7315, lon: -79.7624 },
  'Mississauga, Canada': { lat: 43.5890, lon: -79.6441 },
  'Scarborough, Canada': { lat: 43.7731, lon: -79.2578 },
  'Markham, Canada': { lat: 43.8561, lon: -79.3370 },
  // UK
  'London, UK': { lat: 51.5074, lon: -0.1278 },
  'Birmingham, UK': { lat: 52.4862, lon: -1.8904 },
  'Manchester, UK': { lat: 53.4808, lon: -2.2426 },
};

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest location from our list
function findClosestLocation(lat: number, lon: number): string {
  let closestLocation = 'Georgetown, Guyana'; // Default
  let minDistance = Infinity;

  for (const [location, coords] of Object.entries(LOCATION_COORDS)) {
    const distance = calculateDistance(lat, lon, coords.lat, coords.lon);
    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = location;
    }
  }

  return closestLocation;
}

// Try browser geolocation
async function tryBrowserGeolocation(): Promise<string | null> {
  if (!navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const closestLocation = findClosestLocation(latitude, longitude);
        resolve(closestLocation);
      },
      () => {
        // User denied or error occurred
        resolve(null);
      },
      {
        timeout: 10000,
        maximumAge: 3600000, // Cache for 1 hour
      }
    );
  });
}

// Try IP-based geolocation (fallback)
async function tryIPGeolocation(): Promise<string | null> {
  try {
    // Using ipapi.co free tier (1000 requests/day)
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('IP geolocation failed');

    const data = await response.json();
    const { latitude, longitude } = data;

    if (latitude && longitude) {
      const closestLocation = findClosestLocation(latitude, longitude);
      return closestLocation;
    }
  } catch (error) {
    console.error('IP geolocation error:', error);
  }

  return null;
}

// Main detection function
export async function detectLocation(): Promise<DetectionResult> {
  // Check localStorage first
  const savedLocation = localStorage.getItem('userLocation');
  const savedMethod = localStorage.getItem('locationMethod') as 'gps' | 'ip' | 'manual' | null;

  if (savedLocation && savedMethod) {
    return { location: savedLocation, method: savedMethod };
  }

  // Try browser geolocation
  const gpsLocation = await tryBrowserGeolocation();
  if (gpsLocation) {
    localStorage.setItem('userLocation', gpsLocation);
    localStorage.setItem('locationMethod', 'gps');
    return { location: gpsLocation, method: 'gps' };
  }

  // Fall back to IP geolocation
  const ipLocation = await tryIPGeolocation();
  if (ipLocation) {
    localStorage.setItem('userLocation', ipLocation);
    localStorage.setItem('locationMethod', 'ip');
    return { location: ipLocation, method: 'ip' };
  }

  // Ultimate fallback
  const defaultLocation = 'Georgetown, Guyana';
  return { location: defaultLocation, method: 'manual' };
}

// Save manually selected location
export function saveManualLocation(location: string): void {
  localStorage.setItem('userLocation', location);
  localStorage.setItem('locationMethod', 'manual');
}

// Clear saved location (for testing or reset)
export function clearSavedLocation(): void {
  localStorage.removeItem('userLocation');
  localStorage.removeItem('locationMethod');
}

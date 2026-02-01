import { useEffect, useState } from 'react';

interface HeroSectionProps {
  totalListings: number;
  newToday: number;
  location: string;
}

export default function HeroSection({ totalListings, newToday, location }: HeroSectionProps) {
  const [greeting, setGreeting] = useState('');
  const [emoji, setEmoji] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
      setEmoji('🌅');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
      setEmoji('☀️');
    } else {
      setGreeting('Good evening');
      setEmoji('🌙');
    }
  }, []);

  return (
    <div className="bg-white px-4 pt-8 pb-8 mb-4 border-b border-gray-200">
      <div>
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            {emoji} {greeting}, {location}!
          </h1>
          <p className="text-gray-600 text-sm">Your community marketplace is buzzing</p>
        </div>

        {/* Live Stats - Card Style */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active Listings Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalListings}</div>
            <p className="text-xs text-gray-500 mt-1">Total listings</p>
          </div>

          {/* New Today Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-medium">✨ New</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{newToday}</div>
            <p className="text-xs text-gray-500 mt-1">Added today</p>
          </div>
        </div>
      </div>
    </div>
  );
}

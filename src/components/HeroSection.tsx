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
    <div className="bg-gradient-to-br from-limin-primary via-limin-secondary to-orange-500 px-4 pt-8 pb-8 mb-4">
      <div>
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            {emoji} {greeting}, {location}!
          </h1>
          <p className="text-white/90 text-sm">Your community marketplace is buzzing</p>
        </div>

        {/* Live Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">{totalListings} active</span>
          </div>
          {newToday > 0 && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-white text-sm font-medium">✨ {newToday} new today</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

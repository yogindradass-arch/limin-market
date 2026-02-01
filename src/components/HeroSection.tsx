import { useEffect, useState } from 'react';

interface HeroSectionProps {
  totalListings: number;
  newToday: number;
  location: string;
  onPostClick: () => void;
  onSearchClick: () => void;
}

export default function HeroSection({ totalListings, newToday, location, onPostClick, onSearchClick }: HeroSectionProps) {
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
    <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-400 to-blue-500 px-4 pt-8 pb-8 mb-4">
      {/* WhatsApp-style line drawings background */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        {/* Palm tree outline */}
        <g transform="translate(20, 40)" stroke="white" strokeWidth="2" fill="none">
          <line x1="0" y1="0" x2="0" y2="50" />
          <path d="M -15 10 Q -10 0 0 0 Q 10 0 15 10" />
          <path d="M -12 20 Q -8 12 0 10 Q 8 12 12 20" />
        </g>

        {/* Tropical flower outline */}
        <g transform="translate(280, 60)" stroke="white" strokeWidth="2" fill="none">
          <circle cx="0" cy="0" r="8" />
          <circle cx="0" cy="-12" r="6" />
          <circle cx="10" cy="-8" r="6" />
          <circle cx="10" cy="8" r="6" />
          <circle cx="0" cy="12" r="6" />
          <circle cx="-10" cy="8" r="6" />
          <circle cx="-10" cy="-8" r="6" />
        </g>

        {/* Sun/star outline */}
        <g transform="translate(320, 140)" stroke="white" strokeWidth="2" fill="none">
          <circle cx="0" cy="0" r="10" />
          <line x1="-15" y1="0" x2="-12" y2="0" />
          <line x1="12" y1="0" x2="15" y2="0" />
          <line x1="0" y1="-15" x2="0" y2="-12" />
          <line x1="0" y1="12" x2="0" y2="15" />
        </g>

        {/* Wave pattern (water/river) */}
        <path d="M 0 180 Q 40 170 80 180 Q 120 190 160 180" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />

        {/* Bird outline */}
        <g transform="translate(60, 120)" stroke="white" strokeWidth="2" fill="none">
          <path d="M -15 0 Q -8 -5 0 0 Q 8 -5 15 0" />
        </g>

        {/* Leaves */}
        <g transform="translate(200, 30)" stroke="white" strokeWidth="2" fill="none">
          <path d="M 0 0 Q 10 5 15 15" />
          <path d="M 0 0 Q -10 5 -15 15" />
        </g>

        {/* Simple house (Georgetown) */}
        <g transform="translate(100, 160)" stroke="white" strokeWidth="2" fill="none">
          <rect x="-10" y="0" width="20" height="15" />
          <path d="M -12 0 L 0 -8 L 12 0" />
        </g>

        {/* Mountains/hills */}
        <path d="M 0 200 L 30 175 L 60 200" stroke="white" strokeWidth="2" fill="none" opacity="0.4" />
        <path d="M 250 200 L 280 180 L 310 200" stroke="white" strokeWidth="2" fill="none" opacity="0.4" />
      </svg>

      <div className="relative z-10">
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

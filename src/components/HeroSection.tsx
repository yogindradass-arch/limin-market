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
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-yellow-500 to-green-600 px-4 pt-8 pb-6 mb-4">
      {/* Guyana-themed background pattern - WhatsApp style */}
      <div className="absolute inset-0 opacity-15">
        {/* Waterfall (Kaieteur Falls) */}
        <div className="absolute top-4 right-8 text-6xl transform rotate-12">💧</div>
        <div className="absolute top-6 right-10 text-4xl transform rotate-12">💦</div>

        {/* Tropical Birds */}
        <div className="absolute top-12 left-6 text-5xl transform -rotate-12">🦜</div>
        <div className="absolute bottom-16 right-12 text-4xl transform rotate-45">🦩</div>

        {/* Palm Trees */}
        <div className="absolute bottom-8 left-4 text-6xl">🌴</div>
        <div className="absolute top-20 right-16 text-5xl transform -rotate-12">🌴</div>

        {/* Tropical Flowers */}
        <div className="absolute top-32 left-12 text-4xl transform rotate-45">🌺</div>
        <div className="absolute bottom-20 right-6 text-5xl">🌸</div>
        <div className="absolute top-16 right-4 text-3xl transform -rotate-12">🏵️</div>

        {/* Local Fruits */}
        <div className="absolute bottom-28 left-16 text-4xl transform rotate-12">🥥</div>
        <div className="absolute top-24 left-20 text-3xl">🍍</div>

        {/* Stars/sparkles for Georgetown vibes */}
        <div className="absolute top-8 left-24 text-2xl">✨</div>
        <div className="absolute bottom-12 right-20 text-3xl">⭐</div>

        {/* Bridge (Demerara Harbour Bridge) */}
        <div className="absolute bottom-4 left-8 text-4xl transform rotate-6">🌉</div>
      </div>

      <div className="relative z-10">
        {/* Greeting */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            {emoji} {greeting}, {location}!
          </h1>
          <p className="text-white/90 text-sm">Your community marketplace is buzzing</p>
        </div>

        {/* Live Stats */}
        <div className="flex items-center gap-4 mb-6">
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

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            onClick={onPostClick}
            className="flex-1 bg-white text-limin-primary rounded-xl py-3 px-4 font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            Post
          </button>
          <button
            onClick={onSearchClick}
            className="flex-1 bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 rounded-xl py-3 px-4 font-semibold hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

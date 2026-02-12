import { useState, useEffect, useRef } from 'react';
import type { Product } from '../types/product';
import FeedProductCard from './FeedProductCard';

interface SocialFeedViewProps {
  products: Product[];
  onClose: () => void;
  onFavorite: (productId: string) => void;
  onContactSeller: (product: Product) => void;
  favorites: string[];
}

export default function SocialFeedView({
  products,
  onClose,
  onFavorite,
  onContactSeller,
  favorites
}: SocialFeedViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const isScrolling = useRef(false);

  const currentProduct = products[currentIndex];

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isScrolling.current) return;

    const touchEndY = e.touches[0].clientY;
    const touchEndX = e.touches[0].clientX;
    const deltaY = touchStartY.current - touchEndY;
    const deltaX = touchStartX.current - touchEndX;

    // Determine if horizontal or vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe left - skip/pass
          handleSkip();
        } else {
          // Swipe right - favorite
          handleFavorite();
        }
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    isScrolling.current = false;
  };

  // Handle scroll with wheel (for desktop)
  const handleWheel = (e: React.WheelEvent) => {
    if (isScrolling.current) return;

    if (e.deltaY > 30) {
      handleNext();
    } else if (e.deltaY < -30) {
      handlePrevious();
    }
  };

  const handleNext = () => {
    if (isScrolling.current || currentIndex >= products.length - 1) return;
    isScrolling.current = true;
    setDirection('up');

    setTimeout(() => {
      setCurrentIndex(prev => Math.min(prev + 1, products.length - 1));
      setDirection(null);
      setTimeout(() => {
        isScrolling.current = false;
      }, 300);
    }, 150);
  };

  const handlePrevious = () => {
    if (isScrolling.current || currentIndex <= 0) return;
    isScrolling.current = true;
    setDirection('down');

    setTimeout(() => {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
      setDirection(null);
      setTimeout(() => {
        isScrolling.current = false;
      }, 300);
    }, 150);
  };

  const handleFavorite = () => {
    if (!currentProduct) return;
    onFavorite(currentProduct.id);

    // Show visual feedback
    const feedbackEl = document.getElementById('favorite-feedback');
    if (feedbackEl) {
      feedbackEl.classList.remove('hidden');
      feedbackEl.classList.add('animate-ping');
      setTimeout(() => {
        feedbackEl.classList.add('hidden');
        feedbackEl.classList.remove('animate-ping');
      }, 1000);
    }
  };

  const handleSkip = () => {
    // Visual feedback for skip
    const feedbackEl = document.getElementById('skip-feedback');
    if (feedbackEl) {
      feedbackEl.classList.remove('hidden');
      feedbackEl.classList.add('animate-ping');
      setTimeout(() => {
        feedbackEl.classList.add('hidden');
        feedbackEl.classList.remove('animate-ping');
      }, 1000);
    }

    // Auto advance to next
    setTimeout(() => handleNext(), 300);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowUp') handlePrevious();
      if (e.key === 'ArrowRight') handleFavorite();
      if (e.key === 'ArrowLeft') handleSkip();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  if (!currentProduct) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">No products to show</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-black rounded-full font-semibold"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress indicator */}
      <div className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
        {currentIndex + 1} / {products.length}
      </div>

      {/* Main product card */}
      <div className={`w-full h-full transition-transform duration-300 ${
        direction === 'up' ? '-translate-y-full' : direction === 'down' ? 'translate-y-full' : 'translate-y-0'
      }`}>
        <FeedProductCard
          product={currentProduct}
          isFavorited={favorites.includes(currentProduct.id)}
          onFavorite={handleFavorite}
          onContactSeller={() => onContactSeller(currentProduct)}
        />
      </div>

      {/* Navigation arrows */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex gap-4 z-50">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentIndex >= products.length - 1}
          className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Swipe feedback overlays */}
      <div
        id="favorite-feedback"
        className="hidden absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        <div className="w-32 h-32 bg-red-500/30 rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>

      <div
        id="skip-feedback"
        className="hidden absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        <div className="w-32 h-32 bg-gray-500/30 rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>

      {/* Navigation hints (show on first view) */}
      {currentIndex === 0 && (
        <div className="absolute bottom-32 left-0 right-0 pointer-events-none">
          <div className="text-center text-white/70 text-sm animate-pulse">
            <p>Use arrows to browse • Tap ❤️ to save</p>
          </div>
        </div>
      )}
    </div>
  );
}

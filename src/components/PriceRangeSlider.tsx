import { useState, useEffect } from 'react';
import './PriceRangeSlider.css';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  step?: number;
  onChange: (min: number, max: number) => void;
  formatValue?: (value: number) => string;
  compact?: boolean;
}

export default function PriceRangeSlider({
  min,
  max,
  minValue,
  maxValue,
  step = 1,
  onChange,
  formatValue = (v) => `$${v.toLocaleString()}`,
  compact = false
}: PriceRangeSliderProps) {
  const [localMinValue, setLocalMinValue] = useState(minValue);
  const [localMaxValue, setLocalMaxValue] = useState(maxValue);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  useEffect(() => {
    setLocalMinValue(minValue);
    setLocalMaxValue(maxValue);
  }, [minValue, maxValue]);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMaxValue - step);
    setLocalMinValue(newMin);
    onChange(newMin, localMaxValue);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMinValue + step);
    setLocalMaxValue(newMax);
    onChange(localMinValue, newMax);
  };

  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const minPercentage = getPercentage(localMinValue);
  const maxPercentage = getPercentage(localMaxValue);

  return (
    <div className="w-full">
      {/* Value Display */}
      <div className={`flex items-center justify-between ${compact ? 'mb-6' : 'mb-8'}`}>
        <div className="relative">
          <div className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-gray-900`}>
            {formatValue(localMinValue)}
          </div>
          <div className="text-xs text-gray-500">Minimum</div>
        </div>
        <div className="flex-1 mx-4 h-px bg-gray-200"></div>
        <div className="relative text-right">
          <div className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-gray-900`}>
            {formatValue(localMaxValue)}
          </div>
          <div className="text-xs text-gray-500">Maximum</div>
        </div>
      </div>

      {/* Slider Container */}
      <div className={`relative ${compact ? 'h-12' : 'h-14'} flex items-center px-2`}>
        {/* Track Background */}
        <div className="absolute inset-x-2 h-1.5 bg-gray-200 rounded-full" />

        {/* Active Range */}
        <div
          className="absolute h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-150"
          style={{
            left: `calc(0.5rem + ${minPercentage}% * (100% - 1rem) / 100)`,
            right: `calc(0.5rem + ${100 - maxPercentage}% * (100% - 1rem) / 100)`
          }}
        />

        {/* Range Inputs */}
        <div className="absolute inset-0">
          {/* Min Range Input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localMinValue}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            onMouseDown={() => setIsDragging('min')}
            onMouseUp={() => setIsDragging(null)}
            onTouchStart={() => setIsDragging('min')}
            onTouchEnd={() => setIsDragging(null)}
            className="modern-slider-input"
            style={{ zIndex: isDragging === 'min' ? 5 : localMinValue > max - (max - min) / 5 ? 4 : 3 }}
            aria-label="Minimum price"
          />

          {/* Max Range Input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localMaxValue}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            onMouseDown={() => setIsDragging('max')}
            onMouseUp={() => setIsDragging(null)}
            onTouchStart={() => setIsDragging('max')}
            onTouchEnd={() => setIsDragging(null)}
            className="modern-slider-input"
            style={{ zIndex: isDragging === 'max' ? 5 : 4 }}
            aria-label="Maximum price"
          />
        </div>

        {/* Floating Value Labels */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `calc(${minPercentage}%)`,
            transform: 'translateX(-50%)',
            bottom: '100%',
            marginBottom: '8px'
          }}
        >
          {isDragging === 'min' && (
            <div className="px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap animate-fadeIn">
              {formatValue(localMinValue)}
            </div>
          )}
        </div>

        <div
          className="absolute pointer-events-none"
          style={{
            left: `calc(${maxPercentage}%)`,
            transform: 'translateX(-50%)',
            bottom: '100%',
            marginBottom: '8px'
          }}
        >
          {isDragging === 'max' && (
            <div className="px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap animate-fadeIn">
              {formatValue(localMaxValue)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

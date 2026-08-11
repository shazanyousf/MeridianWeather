// Air Quality card
'use client';
import React from 'react';
import { AirQuality } from '@/types';

interface AirQualityCardProps {
  airQuality: AirQuality | null;
}

const aqiColors: Record<number, { label: string; color: string }> = {
  1: { label: 'Good', color: '#22c55e' },
  2: { label: 'Fair', color: '#eab308' },
  3: { label: 'Moderate', color: '#f97316' },
  4: { label: 'Poor', color: '#ef4444' },
  5: { label: 'Very Poor', color: '#a855f7' },
};

export const AirQualityCard: React.FC<AirQualityCardProps> = ({ airQuality }) => {
  if (!airQuality) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Air Quality</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Air quality data not available</p>
      </div>
    );
  }

  const aqiInfo = aqiColors[airQuality.aqi] || { label: 'Unknown', color: '#64748b' };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Air Quality</h3>
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
          style={{ backgroundColor: aqiInfo.color }}
        >
          {airQuality.aqi}
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{aqiInfo.label}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Air Quality Index</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Object.entries(airQuality.components)
          .slice(0, 6)
          .map(([key, value]) => (
            <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                {key.toUpperCase()}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {typeof value === 'number' ? value.toFixed(1) : value}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

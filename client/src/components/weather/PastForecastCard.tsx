// Past 7-day forecast card (historical weather)
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { PastForecastItem } from '@/types';
import { formatTemp, getDayName, getWeatherEmoji } from '@/utils/format';
import { useAppSelector } from '@/redux/store';

interface PastForecastCardProps {
  forecast: PastForecastItem[];
  title?: string;
}

// Helper to compute a relative label for past days (Yesterday, "2 days ago", etc.)
const getPastDayLabel = (date: string, index: number): string => {
  if (index === 0) return 'Yesterday';
  if (index === 1) return '2 days ago';
  if (index === 2) return '3 days ago';
  if (index === 3) return '4 days ago';
  if (index === 4) return '5 days ago';
  if (index === 5) return '6 days ago';
  return getDayName(date);
};

export const PastForecastCard: React.FC<PastForecastCardProps> = ({ forecast, title = 'Past 7-Day Forecast' }) => {
  const units = useAppSelector((state) => state.ui.units);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="space-y-2">
        {forecast.map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-16">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getPastDayLabel(day.date, i)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {getDayName(day.date)}
              </p>
            </div>
            <span className="text-2xl">{getWeatherEmoji(day.category)}</span>
            <div className="flex-1 mx-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{Math.round(day.tempMin)}°</span>
                <span>{Math.round(day.tempMax)}°</span>
              </div>
              <div className="relative h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                <div
                  className="absolute h-full bg-gradient-to-r from-primary-500 to-accent-400 rounded-full"
                  style={{
                    left: `${((day.tempMin + 10) / 60) * 100}%`,
                    right: `${100 - ((day.tempMax + 10) / 60) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatTemp(day.tempMax, units)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTemp(day.tempMin, units)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


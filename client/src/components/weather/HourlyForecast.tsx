// Hourly forecast scrollable strip
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { HourlyForecast as HourlyForecastType } from '@/types';
import { formatTemp, getHour, getWeatherEmoji } from '@/utils/format';
import { useAppSelector } from '@/redux/store';

interface HourlyForecastProps {
  hourly: HourlyForecastType[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly }) => {
  const units = useAppSelector((state) => state.ui.units);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Hourly Forecast
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {hourly.map((hour, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex flex-col items-center min-w-[70px] p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {i === 0 ? 'Now' : getHour(hour.time)}
            </p>
            <span className="text-2xl mb-2">{getWeatherEmoji(hour.category)}</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatTemp(hour.temperature, units)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {hour.precipitationProbability > 0 && (
                <span className="text-blue-500">💧 {hour.precipitationProbability}%</span>
              )}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

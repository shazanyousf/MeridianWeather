// 7-day forecast card
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { DailyForecast } from '@/types';
import { formatTemp, getDayName, getWeatherEmoji } from '@/utils/format';
import { useAppSelector } from '@/redux/store';

interface ForecastCardProps {
  forecast: DailyForecast[];
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
  const units = useAppSelector((state) => state.ui.units);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        7-Day Forecast
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
            <div className="w-12">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {i === 0 ? 'Today' : getDayName(day.date)}
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

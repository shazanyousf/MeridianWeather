// AI-powered weather recommendations
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
  FiHeart,
  FiActivity,
  FiAlertTriangle,
  FiCalendar,
  FiSun,
  FiWind,
  FiUmbrella,
} from 'react-icons/fi';
import { Recommendations } from '@/types';

interface AIRecommendationsProps {
  recommendations: Recommendations;
}

const severityColor: Record<string, string> = {
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
  danger: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
};

const SectionCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5"
  >
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
    </div>
    {children}
  </motion.div>
);

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ recommendations }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        AI Weather Recommendations
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Clothing */}
<SectionCard icon={<FiWind className="text-primary-500" />} title="Clothing">
          <div className="flex flex-wrap gap-2">
            {recommendations.clothing.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1.5 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        </SectionCard>

        {/* Health */}
        <SectionCard icon={<FiHeart className="text-red-500" />} title="Health Advisory">
          <div className="space-y-2">
            {recommendations.health.map((item, i) => (
              <p
                key={i}
                className={`px-3 py-2 text-sm rounded-lg ${severityColor[item.level] || severityColor.info}`}
              >
                {item.message}
              </p>
            ))}
          </div>
        </SectionCard>

        {/* Activities */}
        <SectionCard icon={<FiActivity className="text-green-500" />} title="Outdoor Activities">
          <div className="flex flex-wrap gap-2">
            {recommendations.activities.suitable.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
          {recommendations.activities.notRecommended.length > 0 && (
            <p className="mt-2 text-xs text-red-500">
              Not recommended: {recommendations.activities.notRecommended.join(', ')}
            </p>
          )}
        </SectionCard>

        {/* Travel */}
<SectionCard icon={<FiSun className="text-accent-500" />} title="Travel Suggestion">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${star <= recommendations.travel.rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {recommendations.travel.suggestion}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {recommendations.travel.reason}
          </p>
        </SectionCard>

        {/* Crop */}
<SectionCard icon={<FiUmbrella className="text-green-600" />} title="Crop Advisory">
          <div className="space-y-2">
            {recommendations.crop.map((item, i) => (
              <p key={i} className="text-sm text-gray-600 dark:text-gray-300">
                🌾 {item}
              </p>
            ))}
          </div>
        </SectionCard>

        {/* Best time to visit */}
        <SectionCard icon={<FiCalendar className="text-purple-500" />} title="Best Time to Visit">
          {recommendations.bestTimeToVisit ? (
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(recommendations.bestTimeToVisit.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {recommendations.bestTimeToVisit.condition} •{' '}
                {recommendations.bestTimeToVisit.recommendation} (Score:{' '}
                {recommendations.bestTimeToVisit.score}/100)
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
          )}
        </SectionCard>
      </div>

      {/* Disaster alerts */}
      {recommendations.disaster.length > 0 && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FiAlertTriangle className="text-red-500" />
            <h3 className="font-semibold text-red-700 dark:text-red-300">Disaster Alerts</h3>
          </div>
          <div className="space-y-2">
            {recommendations.disaster.map((alert, i) => (
              <p key={i} className="text-sm text-red-700 dark:text-red-300">
                ⚠️ {alert.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

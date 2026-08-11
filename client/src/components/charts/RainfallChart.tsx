// Rainfall chart (Recharts)
'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DailyForecast } from '@/types';

interface RainfallChartProps {
  daily: DailyForecast[];
}

export const RainfallChart: React.FC<RainfallChartProps> = ({ daily }) => {
  const data = daily.map((day) => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    rain: Math.round(day.precipitationSum || 0),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Rainfall (mm)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
              }}
            />
            <Bar dataKey="rain" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

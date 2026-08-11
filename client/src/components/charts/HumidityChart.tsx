// Humidity chart (Recharts Area)
'use client';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HourlyForecast } from '@/types';

interface HumidityChartProps {
  hourly: HourlyForecast[];
}

export const HumidityChart: React.FC<HumidityChartProps> = ({ hourly }) => {
  const data = hourly.slice(0, 12).map((h) => ({
    name: new Date(h.time).toLocaleTimeString('en-US', { hour: 'numeric' }),
    humidity: Math.round(h.humidity),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Humidity (%) - Next 12 Hours
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#humidityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

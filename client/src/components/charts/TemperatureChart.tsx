// Temperature trend chart (Recharts)
'use client';
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HourlyForecast, DailyForecast } from '@/types';
import { formatTemp } from '@/utils/format';
import { useAppSelector } from '@/redux/store';

interface TemperatureChartProps {
  daily: DailyForecast[];
  hourly?: HourlyForecast[];
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ daily, hourly }) => {
  const units = useAppSelector((state) => state.ui.units);

  const data = daily.map((day) => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    max: Math.round(day.tempMax),
    min: Math.round(day.tempMin),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Temperature Trend
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
            <Legend />
            <Line
              type="monotone"
              dataKey="max"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              name={`Max (${units === 'imperial' ? '°F' : '°C'})`}
            />
            <Line
              type="monotone"
              dataKey="min"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name={`Min (${units === 'imperial' ? '°F' : '°C'})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

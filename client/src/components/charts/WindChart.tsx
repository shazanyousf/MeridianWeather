// Wind speed chart (Chart.js Line)
'use client';
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { DailyForecast } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WindChartProps {
  daily: DailyForecast[];
  dark?: boolean;
}

export const WindChart: React.FC<WindChartProps> = ({ daily, dark }) => {
  const data = {
    labels: daily.map((d) =>
      new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
    ),
    datasets: [
      {
        label: 'Max Wind Speed (km/h)',
        data: daily.map((d) => Math.round(d.windSpeedMax || 0)),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: dark ? '#e5e7eb' : '#374151',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: dark ? '#9ca3af' : '#6b7280' },
        grid: { color: dark ? 'rgba(75,85,99,0.2)' : 'rgba(0,0,0,0.05)' },
      },
      y: {
        ticks: { color: dark ? '#9ca3af' : '#6b7280' },
        grid: { color: dark ? 'rgba(75,85,99,0.2)' : 'rgba(0,0,0,0.05)' },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Wind Speed
      </h3>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

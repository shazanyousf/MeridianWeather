// Loading skeleton component
'use client';
import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg',
        className
      )}
    />
  );
};

export const WeatherCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-16 w-24 mb-6" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

export const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WeatherCardSkeleton />
        <WeatherCardSkeleton />
        <WeatherCardSkeleton />
      </div>
    </div>
  );
};

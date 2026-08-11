import { MainLayout } from '@/components/layout/MainLayout';
import { HistoricalWeatherSearch } from '@/components/weather/HistoricalWeatherSearch';

export default function HistoricalWeatherPage() {
  return (
    <MainLayout>
      <div className="pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historical Weather</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Search a city and inspect its archived weather conditions for an exact date.
          </p>
        </div>
        <HistoricalWeatherSearch />
      </div>
    </MainLayout>
  );
}

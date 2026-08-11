'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { FiCalendar, FiCloudRain, FiMapPin, FiSearch, FiSun, FiWind } from 'react-icons/fi';
import { LocationResult, PastForecastItem } from '@/types';
import { weatherService } from '@/services/weatherService';
import { getErrorMessage } from '@/services/api';
import { formatDate, formatTemp, formatWind, getWeatherEmoji } from '@/utils/format';
import { useAppSelector } from '@/redux/store';
import { useDebounce } from '@/hooks/useDebounce';

const archiveLatestDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 5);
  return date.toISOString().slice(0, 10);
};

const todayDate = () => new Date().toISOString().slice(0, 10);

export const HistoricalWeatherSearch: React.FC = () => {
  const units = useAppSelector((state) => state.ui.units);
  const [city, setCity] = useState('');
  const [date, setDate] = useState(archiveLatestDate());
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [historicalDay, setHistoricalDay] = useState<PastForecastItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debouncedCity = useDebounce(city, 350);

  useEffect(() => {
    if (debouncedCity.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    weatherService.geocode(debouncedCity).then(setSuggestions).catch(() => setSuggestions([]));
  }, [debouncedCity]);

  const selectLocation = (location: LocationResult) => {
    setSelectedLocation(location);
    setCity([location.name, location.country].filter(Boolean).join(', '));
    setSuggestions([]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!city.trim()) {
      setError('Enter a city name to view its historical weather.');
      return;
    }
    if (date > todayDate()) {
      setError('Please select today or an earlier date. Future weather is not available as historical data.');
      return;
    }
    if (date > archiveLatestDate()) {
      setError(`Historical archive data is currently available through ${archiveLatestDate()}.`);
      return;
    }
    setLoading(true);
    setError('');
    setHistoricalDay(null);
    try {
      const location = selectedLocation || (await weatherService.geocode(city))[0];
      if (!location) {
        setError('City not found. Select a city from the suggestions and try again.');
        return;
      }
      const history = await weatherService.getPastForecast(location.lat, location.lon, 1, undefined, date);
      const day = history.daily?.[0];
      if (!day) {
        setError('Historical weather is not available for this date.');
        return;
      }
      setSelectedLocation(location);
      setHistoricalDay(day);
      setSuggestions([]);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const locationName = selectedLocation && [selectedLocation.name, selectedLocation.admin1, selectedLocation.country].filter(Boolean).join(', ');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-labelledby="historical-weather-heading">
      <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-cyan-600 p-6 sm:p-8 shadow-card">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-primary-100 text-sm font-semibold mb-3"><FiCalendar aria-hidden="true" /> Historical weather</div>
          <h2 id="historical-weather-heading" className="text-2xl sm:text-3xl font-bold text-white">Look up weather for an exact date</h2>
          <p className="mt-2 text-primary-100">Choose a city from the suggestions, then select the exact year, month, and day.</p>
          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_11rem_auto] sm:items-end">
            <div className="relative">
              <label htmlFor="historical-city-search" className="mb-1 block text-xs font-medium text-primary-100">Search city</label>
              <FiMapPin className="absolute left-4 top-[2.8rem] -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input id="historical-city-search" value={city} onChange={(event) => { setCity(event.target.value); setSelectedLocation(null); }} placeholder="Search for a city" autoComplete="off" className="w-full rounded-xl bg-white px-11 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-200" />
              {suggestions.length > 0 && <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5">{suggestions.slice(0, 6).map((location) => <button key={`${location.lat}-${location.lon}`} type="button" onClick={() => selectLocation(location)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"><FiMapPin className="shrink-0 text-primary-600" /><span><span className="block font-medium text-gray-900">{location.name}</span><span className="block text-xs text-gray-500">{[location.admin1, location.country].filter(Boolean).join(', ')}</span></span></button>)}</div>}
            </div>
            <div><label htmlFor="historical-date" className="mb-1 block text-xs font-medium text-primary-100">Select date</label><input id="historical-date" type="date" min="1940-01-01" value={date} onChange={(event) => { const nextDate = event.target.value; if (nextDate > todayDate()) { setError('Please select today or an earlier date.'); return; } setError(''); setDate(nextDate); }} className="w-full rounded-xl bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-200" /></div>
            <div><span className="mb-1 block text-xs font-medium invisible" aria-hidden="true">Action</span><button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"><FiSearch aria-hidden="true" />{loading ? 'Loading...' : 'View weather'}</button></div>
          </form>
          {error && <p className="mt-3 text-sm text-white" role="alert">{error}</p>}
        </div>
      </div>
      {historicalDay && <div className="mt-6 rounded-2xl bg-white dark:bg-gray-800 shadow-card p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-sm font-medium text-primary-600 dark:text-primary-400">{formatDate(historicalDay.date)}</p><h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{locationName}</h3><p className="mt-1 text-gray-500 dark:text-gray-400">{historicalDay.condition}</p></div><span className="text-5xl" aria-label={historicalDay.condition}>{getWeatherEmoji(historicalDay.category)}</span></div><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4"><Metric label="High" value={formatTemp(historicalDay.tempMax, units)} /><Metric label="Low" value={formatTemp(historicalDay.tempMin, units)} /><Metric icon={<FiCloudRain />} label="Precipitation" value={`${historicalDay.precipitationSum.toFixed(1)} mm`} /><Metric label="Rain" value={`${historicalDay.rainSum.toFixed(1)} mm`} /><Metric label="Snow" value={`${historicalDay.snowfallSum.toFixed(1)} mm`} /><Metric icon={<FiWind />} label="Wind" value={formatWind(historicalDay.windSpeedMax, units)} /><Metric icon={<FiSun />} label="Sunrise" value={new Date(historicalDay.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} /><Metric label="Sunset" value={new Date(historicalDay.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} /></div></div>}
    </section>
  );
};

const Metric: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700"><div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">{icon}{label}</div><p className="mt-1 font-semibold text-gray-900 dark:text-white">{value}</p></div>;

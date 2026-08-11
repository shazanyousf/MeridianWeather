// Weather search bar with suggestions & voice search
'use client';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMic, FiMapPin, FiClock } from 'react-icons/fi';
import { weatherService } from '@/services/weatherService';
import { LocationResult } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useAppSelector } from '@/redux/store';
import toast from 'react-hot-toast';

interface WeatherSearchProps {
  onSelect: (location: LocationResult) => void;
  onVoiceSearch?: (query: string) => void;
}

export const WeatherSearch: React.FC<WeatherSearchProps> = ({ onSelect, onVoiceSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [open, setOpen] = useState(false);
  const [popular, setPopular] = useState<LocationResult[]>([]);
const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const debouncedQuery = useDebounce(query, 500);
  const recentSearches = useAppSelector((state) => state.weather.recentSearches);
  const inputRef = useRef<HTMLDivElement>(null);

  const { listening, supported, startListening, transcript } = useVoiceSearch((text) => {
    setQuery(text);
    onVoiceSearch?.(text);
  });

  // Position the dropdown relative to the input using its bounding rect
  useLayoutEffect(() => {
    if (open && inputRef.current && typeof window !== 'undefined') {
      const rect = inputRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [open, suggestions, recentSearches, popular]);

  // Load suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      const q = debouncedQuery || '';
      if (q.length >= 2) {
        try {
          const results = await weatherService.geocode(q);
          setSuggestions(results);
          setOpen(true);
        } catch (err) {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  // Load popular cities on mount
  useEffect(() => {
    weatherService.getPopularCities().then(setPopular).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const handleSelect = (location: LocationResult) => {
    onSelect(location);
    setQuery(location.name);
    setOpen(false);
  };

  const dropdown = (
    <AnimatePresence>
      {open && pos && (
        <motion.div
          key="dropdown"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          style={{ top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="fixed bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Search Results
              </p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(s)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left"
                >
                  <FiMapPin className="text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {s.admin1 && `${s.admin1}, `}{s.country}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-700">
              <p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Recent Searches
              </p>
              {recentSearches.slice(0, 5).map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left"
                >
                  <FiClock className="text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular cities */}
          {popular.length > 0 && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-700">
              <p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Popular Cities
              </p>
              <div className="flex flex-wrap gap-2 px-3 py-2">
                {popular.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(c)}
                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors"
                  >
                    {c.city || c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div ref={inputRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search city, state, country, zip code..."
          className="w-full px-12 py-4 text-base bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-primary-500 shadow-card text-gray-900 dark:text-white"
        />
<FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        {supported && (
          <button
            onClick={startListening}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
              listening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-gray-400 hover:text-primary-500'
            }`}
            aria-label="Voice search"
          >
            <FiMic size={20} />
          </button>
        )}
      </div>

      {typeof window !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
};

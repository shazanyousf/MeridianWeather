// Weather Redux slice
'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocationResult, WeatherData } from '@/types';

interface WeatherState {
  currentLocation: LocationResult | null;
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  recentSearches: string[];
}

const initialState: WeatherState = {
  currentLocation: null,
  weatherData: null,
  loading: false,
  error: null,
  recentSearches: [],
};

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<LocationResult | null>) => {
      state.currentLocation = action.payload;
    },
    setWeatherData: (state, action: PayloadAction<WeatherData | null>) => {
      state.weatherData = action.payload;
    },
    setWeatherLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setWeatherError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const filtered = state.recentSearches.filter((s) => s !== action.payload);
      state.recentSearches = [action.payload, ...filtered].slice(0, 8);
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
  },
});

export const {
  setCurrentLocation,
  setWeatherData,
  setWeatherLoading,
  setWeatherError,
  addRecentSearch,
  clearRecentSearches,
} = weatherSlice.actions;
export default weatherSlice.reducer;

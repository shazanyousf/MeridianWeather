// UI Redux slice - sidebar, modals, theme
'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  units: 'metric' | 'imperial';
  mobileMenuOpen: boolean;
}

const initialState: UIState = {
  sidebarOpen: false,
  theme: 'light',
  units: 'metric',
  mobileMenuOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setUnits: (state, action: PayloadAction<'metric' | 'imperial'>) => {
      state.units = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
  },
});

export const { toggleSidebar, setTheme, toggleTheme, setUnits, toggleMobileMenu } = uiSlice.actions;
export default uiSlice.reducer;

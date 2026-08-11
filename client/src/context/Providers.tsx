// Combined providers for the app
'use client';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { store } from '@/redux/store';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#1e293b',
                    color: '#fff',
                    borderRadius: '12px',
                  },
                  success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                  error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

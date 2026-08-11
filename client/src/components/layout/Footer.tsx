// Footer component
'use client';
import React from 'react';
import Link from 'next/link';
import { FiCloud, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiCloud className="text-primary-400" size={28} />
              <span className="text-xl font-bold text-white">
                Meridian<span className="text-primary-400">Weather</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Smart Weather Forecasting & Climate Analytics System. Real-time weather data, forecasts, and AI-powered recommendations.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/weather" className="hover:text-primary-400">Weather</Link></li>
              <li><Link href="/charts" className="hover:text-primary-400">Charts & Analytics</Link></li>
              <li><Link href="/compare" className="hover:text-primary-400">Compare Weather</Link></li>
              <li><Link href="/historical" className="hover:text-primary-400">Historical Weather</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-primary-400">Login</Link></li>
              <li><Link href="/register" className="hover:text-primary-400">Register</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary-400">Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-primary-400">Admin Panel</Link></li>
            </ul>
          </div>

          {/* Data sources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Data Sources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>OpenWeatherMap</li>
              <li>Open-Meteo</li>
              <li>WeatherAPI</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Meridian Weather. MCA Final Year Project. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-primary-400" aria-label="GitHub">
              <FiGithub size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-primary-400" aria-label="Twitter">
              <FiTwitter size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-primary-400" aria-label="LinkedIn">
              <FiLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

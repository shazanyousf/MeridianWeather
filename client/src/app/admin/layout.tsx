// Admin layout with sidebar navigation
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiBarChart2,
  FiUsers,
  FiSearch,
  FiActivity,
  FiMessageSquare,
  FiBell,
  FiLayout,
  FiLogOut,
  FiMenu,
  FiHome,
} from 'react-icons/fi';
import { tokenStorage } from '@/services/api';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: FiLayout },
  { href: '/admin/users', label: 'Users', icon: FiUsers },
  { href: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/admin/searches', label: 'Search Stats', icon: FiSearch },
  { href: '/admin/api-usage', label: 'API Usage', icon: FiActivity },
  { href: '/admin/feedback', label: 'Feedback', icon: FiMessageSquare },
  { href: '/admin/announcements', label: 'Announcements', icon: FiBell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = tokenStorage.getAdminToken();
    if (!token) {
      router.replace('/admin-login');
    }
  }, [router]);

  const handleLogout = async () => {
    tokenStorage.clearAdminToken();
    router.push('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md lg:hidden"
      >
        <FiMenu size={20} className="text-gray-700 dark:text-white" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
<div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary-600">Meridian Admin</h1>
          <p className="text-xs text-gray-500 mt-1">Control Panel</p>
        </div>

        <div className="p-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiHome size={18} />
            View Website
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 p-6 md:p-10">{children}</main>
    </div>
  );
}

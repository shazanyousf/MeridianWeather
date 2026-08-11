// Dashboard layout with sidebar
'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiLayout,
  FiStar,
  FiClock,
  FiUser,
  FiBell,
  FiBarChart2,
  FiMessageSquare,
  FiSettings,
FiLogOut,
  FiHome,
  FiCloud,
  FiTrendingUp,
  FiRepeat,
} from 'react-icons/fi';

const websiteItems = [
  { href: '/', label: 'Home', icon: <FiHome /> },
  { href: '/weather', label: 'Weather', icon: <FiCloud /> },
  { href: '/charts', label: 'Charts', icon: <FiTrendingUp /> },
  { href: '/compare', label: 'Compare', icon: <FiRepeat /> },
];
import { useAuth } from '@/context/AuthContext';
import { tokenStorage } from '@/services/api';
import { cn } from '@/utils/cn';

const sidebarItems = [
  { href: '/dashboard', label: 'Overview', icon: <FiLayout /> },
  { href: '/dashboard/favorites', label: 'Favorites', icon: <FiStar /> },
  { href: '/dashboard/history', label: 'History', icon: <FiClock /> },
  { href: '/dashboard/notifications', label: 'Notifications', icon: <FiBell /> },
  { href: '/dashboard/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
  { href: '/dashboard/feedback', label: 'Feedback', icon: <FiMessageSquare /> },
  { href: '/dashboard/profile', label: 'Profile', icon: <FiUser /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <FiSettings /> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {user?.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

<nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Dashboard
          </p>
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Website
          </p>
          {websiteItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 flex justify-around py-2">
        {[{ href: '/', label: 'Home', icon: <FiHome size={18} /> }, ...sidebarItems.slice(0, 4)].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-3',
              pathname === item.href
                ? 'text-primary-600'
                : 'text-gray-500'
            )}
          >
            {item.icon}
            <span className="text-[10px]">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </div>

      <main className="flex-1 md:ml-0 pb-20 md:pb-0">{children}</main>
    </div>
  );
}

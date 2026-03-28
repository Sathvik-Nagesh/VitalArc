'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHealthStore } from '@/store/useHealthStore';
import {
  Home, UserCircle, Heart, Activity, Clock,
  SlidersHorizontal, Award, Brain, Calendar,
  Sun, Moon, Shield, Microscope
} from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/collector', label: 'Initial Setup', icon: UserCircle },
  { href: '/mirror', label: 'Bio Age', icon: Heart },
  { href: '/predictor', label: 'Risk Predictor', icon: Activity },
  { href: '/timeline', label: 'Timeline', icon: Clock },
  { href: '/simulator', label: 'Simulator', icon: SlidersHorizontal },
  { href: '/coach', label: 'AI Coach', icon: Brain },
  { href: '/tracker', label: 'Daily Tracker', icon: Calendar },
  { href: '/about', label: 'Methodology', icon: Microscope },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme, profile } = useHealthStore();

  return (
    <aside className="fixed left-0 top-0 h-full w-[72px] lg:w-[240px] z-50 flex flex-col glass border-r border-white/5 dark:border-white/5 light:border-black/5">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-4 py-5 border-b border-white/5 active:scale-95 transition-transform group">
        <div className="relative w-10 h-10 flex-shrink-0 group-hover:rotate-6 transition-transform">
          <Image src="/logo.png" fill alt="Logo" className="object-contain" />
        </div>
        <span className="hidden lg:block text-lg font-black tracking-tighter gradient-text">VitalArc</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isDisabled = !profile && item.href !== '/collector' && item.href !== '/dashboard';

          return (
            <Link
              key={item.href}
              href={isDisabled ? '#' : item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-500/15 text-primary-400 dark:text-primary-400 shadow-glow-sm'
                  : isDisabled
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-white/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-200 dark:text-gray-400 dark:hover:text-gray-200'
                }
              `}
              onClick={(e) => isDisabled && e.preventDefault()}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-500' : ''}`} />
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
              {isActive && (
                <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-2 py-4 border-t border-white/5 space-y-2">
        {/* Privacy & Terms */}
        <Link href="/privacy" className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 dark:text-gray-500 hover:bg-white/5 hover:text-gray-400 transition-all text-xs">
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span className="hidden lg:block text-xs">Privacy & Terms</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full hover:bg-white/5 transition-all duration-200 text-gray-400"
          id="theme-toggle"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-5 h-5 flex-shrink-0 text-yellow-400" />
              <span className="hidden lg:block text-sm font-medium">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 flex-shrink-0 text-indigo-400" />
              <span className="hidden lg:block text-sm font-medium">Dark Mode</span>
            </>
          )}
        </button>

        {/* User info */}
        {profile && (
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg">
              {(profile.name || 'U')[0].toUpperCase()}
            </div>
            <div className="hidden lg:block">
              <div className="text-sm font-medium dark:text-gray-200 group-hover:text-primary-400 transition-colors">{profile.name || 'User'}</div>
              <div className="text-xs text-gray-500">Edit Profile</div>
            </div>
          </Link>
        )}

        {/* Award badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 text-[10px] text-gray-500 uppercase tracking-widest font-black">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>v2.2 — Medical Build</span>
        </div>
      </div>
    </aside>
  );
}

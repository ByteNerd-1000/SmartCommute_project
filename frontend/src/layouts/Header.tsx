import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { Moon, Sun, Navigation } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const isActive = (path: string) => location.pathname === path;
  
  const navLinkClass = (path: string) => 
    `font-medium transition-colors ${
      isActive(path)
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/50 dark:border-slate-800/80 bg-white/75 dark:bg-slate-950/75 backdrop-blur-2xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group min-w-0">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Navigation className="w-6 h-6" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-lg font-bold text-slate-900 dark:text-white truncate">CityRoute Smart Ai</span>
            <span className="hidden sm:block text-[11px] tracking-[0.22em] uppercase text-slate-500 dark:text-slate-400">Route optimizer for every commute</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/50 p-1.5 shadow-sm backdrop-blur-md">
          <Link to="/" className={`px-4 py-2 rounded-full text-sm ${isActive('/') ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}>Home</Link>
          <Link to="/search" className={`px-4 py-2 rounded-full text-sm ${isActive('/search') ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}>Search</Link>
          <Link to="/history" className={`px-4 py-2 rounded-full text-sm ${isActive('/history') ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}>History</Link>
          <Link to="/compare" className={`px-4 py-2 rounded-full text-sm ${isActive('/compare') ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}>Compare</Link>
          <Link to="/analytics" className={`px-4 py-2 rounded-full text-sm ${isActive('/analytics') ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}>Analytics</Link>
        </nav>

        <button
          onClick={toggleDarkMode}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/60 px-3 py-2 text-slate-700 dark:text-slate-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          <span className="hidden sm:inline text-sm font-medium">{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 border-t mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 text-slate-600 dark:text-slate-400">
          {/* Company Info */}
          <div>
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white text-lg">CityRoute Smart Ai</h3>
            <p className="text-sm max-w-3xl">
              Intelligent multimodal transportation optimization platform. Find the cheapest, fastest, or most eco-friendly commute using AI-powered route optimization.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 transition-colors duration-300">
          <p className="text-sm text-slate-600 dark:text-slate-400">&copy; 2026 CityRoute Smart Ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

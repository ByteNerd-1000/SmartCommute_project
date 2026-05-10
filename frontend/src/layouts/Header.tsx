import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { Moon, Sun, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-md ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} border-b`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className={`flex items-center gap-2 text-2xl font-bold transition-colors ${isDarkMode ? 'text-white hover:text-primary-400' : 'text-gray-900 hover:text-primary-600'}`}>
          <Navigation className="w-7 h-7 text-primary-500" />
          SmartCommute
        </Link>

        {/* Navigation */}
        <nav className={`hidden md:flex items-center gap-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Link
            to="/"
            className={`font-medium transition-colors ${
              isActive('/') ? (isDarkMode ? 'text-primary-400' : 'text-primary-600') : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Home
          </Link>
          <Link
            to="/search"
            className={`font-medium transition-colors ${
              isActive('/search') ? (isDarkMode ? 'text-primary-400' : 'text-primary-600') : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Search
          </Link>
          <Link
            to="/history"
            className={`font-medium transition-colors ${
              isActive('/history') ? (isDarkMode ? 'text-primary-400' : 'text-primary-600') : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            History
          </Link>
          <Link
            to="/compare"
            className={`font-medium transition-colors ${
              isActive('/compare') ? (isDarkMode ? 'text-primary-400' : 'text-primary-600') : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Compare
          </Link>
          <Link
            to="/analytics"
            className={`font-medium transition-colors ${
              isActive('/analytics') ? (isDarkMode ? 'text-primary-400' : 'text-primary-600') : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Analytics
          </Link>
        </nav>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  const { isDarkMode } = useThemeStore();

  return (
    <footer className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border-t mt-20`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {/* Company */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SmartCommute</h3>
            <p className="text-sm">
              Intelligent multimodal transportation optimization platform
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className={`hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Features</a></li>
              <li><a href="#" className={`hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Pricing</a></li>
              <li><a href="#" className={`hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>API</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className={`hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>About</a></li>
              <li><a href="#" className={`hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Blog</a></li>
              <li><a href="#" className={`hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className={`hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Privacy</a></li>
              <li><a href="#" className={`hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Terms</a></li>
              <li><a href="#" className={`hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>License</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} pt-8 flex items-center justify-between`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>&copy; 2024 SmartCommute. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Twitter</a>
            <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>GitHub</a>
            <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

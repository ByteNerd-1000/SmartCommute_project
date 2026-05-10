import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './layouts/Header';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { RouteHistoryPage } from './pages/RouteHistoryPage';
import { RouteComparisonPage } from './pages/RouteComparisonPage';
import { useThemeStore } from './store/theme';

function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300`}>
        <Header />
        
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/history" element={<RouteHistoryPage />} />
            <Route path="/compare" element={<RouteComparisonPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

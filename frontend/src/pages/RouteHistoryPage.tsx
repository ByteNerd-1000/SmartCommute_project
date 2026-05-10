import React, { useState } from 'react';
import { useHistoryStore } from '../store/history';
import { useThemeStore } from '../store/theme';
import { Clock, Trash2, TrendingUp, MapPin } from 'lucide-react';
import { MapComponent } from '../components/MapComponent';

export const RouteHistoryPage: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const {
    savedRoutes,
    removeRoute,
    clearHistory,
    getFrequentRoutes,
    getRecentRoutes,
  } = useHistoryStore();

  const [viewMode, setViewMode] = useState<'recent' | 'frequent'>('recent');
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  const displayRoutes =
    viewMode === 'recent'
      ? getRecentRoutes(20)
      : getFrequentRoutes(20);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      } min-h-screen transition-colors duration-300`}
    >
      {/* Header */}
      <div
        className={`${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-50 border-gray-200'
        } border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Route History</h1>
          </div>
          <p
            className={`${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            View and manage your saved commute routes
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {savedRoutes.length === 0 ? (
          <div
            className={`${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            } border rounded-lg p-12 text-center`}
          >
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Route History</h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Your saved routes will appear here. Search for routes to get started!
            </p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('recent')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'recent'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Recent
                </button>
                <button
                  onClick={() => setViewMode('frequent')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'frequent'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Most Frequent
                </button>
              </div>

              <button
                onClick={() => clearHistory()}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>

            {/* Routes Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayRoutes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  className={`${
                    isDarkMode
                      ? 'bg-gray-800 hover:bg-gray-750 border-gray-700'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  } border rounded-lg p-4 cursor-pointer transition-colors`}
                >
                  {/* Route Info */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-sm truncate">
                      {route.source}
                    </h3>
                    <p
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}
                    >
                      ↓
                    </p>
                    <h3 className="font-semibold text-sm truncate">
                      {route.destination}
                    </h3>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div
                      className={`${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      } rounded p-2 text-center`}
                    >
                      <p className="text-xs opacity-70">Fare</p>
                      <p className="font-bold text-sm">₹{route.fare.toFixed(0)}</p>
                    </div>
                    <div
                      className={`${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      } rounded p-2 text-center`}
                    >
                      <p className="text-xs opacity-70">Time</p>
                      <p className="font-bold text-sm">{route.duration}m</p>
                    </div>
                    <div
                      className={`${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      } rounded p-2 text-center`}
                    >
                      <p className="text-xs opacity-70">Uses</p>
                      <p className="font-bold text-sm">{route.frequency}</p>
                    </div>
                  </div>

                  {/* Modes */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {[...new Set(route.modes)].map((mode, idx) => {
                      const META: Record<string, { label: string; emoji: string; cls: string }> = {
                        walk:        { label: 'Walk',        emoji: '🚶', cls: 'bg-green-500/20 text-green-400' },
                        bus:         { label: 'Bus',         emoji: '🚌', cls: 'bg-blue-500/20 text-blue-400' },
                        metro:       { label: 'Metro',       emoji: '🚇', cls: 'bg-purple-500/20 text-purple-400' },
                        rapido_bike: { label: 'Rapido',      emoji: '🛵', cls: 'bg-yellow-500/20 text-yellow-400' },
                        auto:        { label: 'Auto',        emoji: '🛺', cls: 'bg-orange-500/20 text-orange-400' },
                        ola_mini:    { label: 'Ola Mini',    emoji: '🚗', cls: 'bg-indigo-500/20 text-indigo-400' },
                        uber_go:     { label: 'Uber Go',     emoji: '🚙', cls: 'bg-slate-500/20 text-slate-300' },
                      };
                      const m = META[mode as string] || { label: String(mode), emoji: '🚐', cls: 'bg-gray-500/20 text-gray-300' };
                      return (
                        <span key={idx} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${m.cls}`}>
                          {m.emoji} {m.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Time */}
                  <div className="flex justify-between items-center">
                    <p className="text-xs opacity-60">
                      {formatDate(route.timestamp)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRoute(route.id);
                      }}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Route Detail */}
            {selectedRoute && (
              <div
                className={`${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                } border rounded-lg p-6 mt-8`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Route Details</h2>
                  <button
                    onClick={() => setSelectedRoute(null)}
                    className={`${
                      isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ✕
                  </button>
                </div>

                {/* Route Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Journey</h3>
                    <div
                      className={`${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      } rounded-lg p-4 mb-4`}
                    >
                      <p className="font-semibold">{selectedRoute.source}</p>
                      <p className="text-center my-2">↓</p>
                      <p className="font-semibold">{selectedRoute.destination}</p>
                    </div>

                    <h3 className="font-semibold mb-4">Statistics</h3>
                    <div
                      className={`${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      } rounded-lg p-4 space-y-3`}
                    >
                      <div className="flex justify-between">
                        <span className="opacity-70">Estimated Fare:</span>
                        <span className="font-bold">₹{selectedRoute.fare.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Duration:</span>
                        <span className="font-bold">{selectedRoute.duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Distance:</span>
                        <span className="font-bold">
                          {selectedRoute.distance.toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Times Used:</span>
                        <span className="font-bold">{selectedRoute.frequency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="h-96 rounded-lg overflow-hidden">
                    <MapComponent
                      route={selectedRoute.routes?.[0]}
                      source={{
                        lat: selectedRoute.sourceCoords.lat,
                        lng: selectedRoute.sourceCoords.lng,
                      }}
                      destination={{
                        lat: selectedRoute.destCoords.lat,
                        lng: selectedRoute.destCoords.lng,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

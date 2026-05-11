import React, { useState } from 'react';
import { useHistoryStore } from '../store/history';
import { Clock, Trash2, TrendingUp, MapPin } from 'lucide-react';
import { MapComponent } from '../components/MapComponent';

export const RouteHistoryPage: React.FC = () => {
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
    <div className="page-shell min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Route History</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage your saved commute routes
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {savedRoutes.length === 0 ? (
          <div className="page-surface p-12 text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500 opacity-50" />
            <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">No Route History</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Your saved routes will appear here. Search for routes to get started!
            </p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
              <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('recent')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    viewMode === 'recent'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Recent
                </button>
                <button
                  onClick={() => setViewMode('frequent')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    viewMode === 'frequent'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Most Frequent
                </button>
              </div>

              <button
                onClick={() => clearHistory()}
                className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2 font-medium"
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
                  className="page-surface p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* Route Info */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {route.source}
                    </h3>
                    <p className="text-xs text-slate-400 my-1">
                      ↓
                    </p>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {route.destination}
                    </h3>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Fare</p>
                      <p className="font-bold text-sm text-primary-600 dark:text-primary-400">₹{route.fare.toFixed(0)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Time</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{route.duration}m</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Uses</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{route.frequency}</p>
                    </div>
                  </div>

                  {/* Modes */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {[...new Set(route.modes)].map((mode, idx) => {
                      const META: Record<string, { label: string; emoji: string; cls: string }> = {
                        walk:        { label: 'Walk',        emoji: '🚶', cls: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
                        bus:         { label: 'Bus',         emoji: '🚌', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
                        metro:       { label: 'Metro',       emoji: '🚇', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
                        rapido_bike: { label: 'Rapido',      emoji: '🛵', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' },
                        auto:        { label: 'Auto',        emoji: '🛺', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' },
                        ola_mini:    { label: 'Ola Mini',    emoji: '🚗', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' },
                        uber_go:     { label: 'Uber Go',     emoji: '🚙', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300' },
                      };
                      const m = META[mode as string] || { label: String(mode), emoji: '🚐', cls: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300' };
                      return (
                        <span key={idx} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${m.cls}`}>
                          {m.emoji} {m.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Time */}
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(route.timestamp)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRoute(route.id);
                      }}
                      className="text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Route Detail */}
            {selectedRoute && (
              <div className="page-surface p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Route Details</h2>
                  <button
                    onClick={() => setSelectedRoute(null)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Route Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Journey</h3>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-4 mb-6">
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedRoute.source}</p>
                      <div className="my-3 ml-2 border-l-2 border-dashed border-slate-300 dark:border-slate-600 h-6"></div>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedRoute.destination}</p>
                    </div>

                    <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Statistics</h3>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400 text-sm">Estimated Fare</span>
                        <span className="font-bold text-lg text-primary-600 dark:text-primary-400">₹{selectedRoute.fare.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400 text-sm">Duration</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{selectedRoute.duration} min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400 text-sm">Distance</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {selectedRoute.distance.toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400 text-sm">Times Used</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{selectedRoute.frequency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
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

import React, { useRef } from 'react';
import { SearchInterface, RouteCard } from '../components/SearchInterface';
import { RecommendationsDisplay } from '../components/RecommendationsDisplay';
import { MapComponent } from '../components/MapComponent';
import { FareComparison } from '../components/FareComparison';
import { useSearchStore } from '../store/search';
import { useThemeStore } from '../store/theme';
import { useHistoryStore } from '../store/history';
import { motion } from 'framer-motion';

const MODE_LABELS: Record<string, string> = {
  walk: 'Walk', bus: 'Bus', metro: 'Metro',
  rapido_bike: 'Rapido Bike', auto: 'Auto', ola_mini: 'Ola Mini', uber_go: 'Uber Go',
};
const modeLabel = (m: string) => MODE_LABELS[m] || m;

export const SearchPage: React.FC = () => {
  const {
    routes,
    selectedRoute,
    source,
    destination,
    recommendations,
    setSelectedRoute,
    setSource,
    setDestination,
  } = useSearchStore();
  const { isDarkMode } = useThemeStore();
  const { addRoute } = useHistoryStore();
  const resultsRef = useRef<HTMLDivElement>(null);

  const selectRoute = (route: any) => {
    setSelectedRoute(route);
    // Save to history when user selects a route
    if (source && destination) {
      addRoute({
        id: `${source.lat},${source.lng}-${destination.lat},${destination.lng}`,
        source: source.name || `${source.lat.toFixed(4)}, ${source.lng.toFixed(4)}`,
        destination: destination.name || `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`,
        sourceCoords: { lat: source.lat, lng: source.lng },
        destCoords: { lat: destination.lat, lng: destination.lng },
        routes,
        recommendations,
        fare: route.fare,
        duration: route.duration_minutes,
        distance: route.distance_km,
        modes: route.modes,
        timestamp: Date.now(),
      });
    }
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleMapClick = (lat: number, lng: number) => {
    const point = { lat, lng, name: `Map point ${lat.toFixed(4)}, ${lng.toFixed(4)}` };
    if (!source) {
      setSource(point);
      return;
    }
    setDestination(point);
  };

  return (
    <div className="page-shell min-h-screen pt-8 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Hero */}
        <motion.div
          className="page-surface-strong mb-8 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] p-6 md:p-10">
            <div>
              <span className="section-kicker mb-4">Live route planner</span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white leading-tight">
                Plan smarter commutes with route comparison, live recommendations, and map-based input.
              </h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                Search any source and destination, then review the best route by cost, travel time, walking effort, and transfer count.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="page-stat p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 mb-1">Step 1</p>
                  <p className="font-semibold text-slate-900 dark:text-white">Choose your start and end points</p>
                </div>
                <div className="page-stat p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 mb-1">Step 2</p>
                  <p className="font-semibold text-slate-900 dark:text-white">Review AI suggestions instantly</p>
                </div>
                <div className="page-stat p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 mb-1">Step 3</p>
                  <p className="font-semibold text-slate-900 dark:text-white">Save the best route to history</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 content-start">
              <div className="page-stat p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 mb-2">What you can search</p>
                <div className="flex flex-wrap gap-2">
                  {['Landmarks', 'Metro stations', 'Bus stops', 'Addresses', 'Map clicks'].map((item) => (
                    <span key={item} className="rounded-full bg-white/80 dark:bg-slate-900/70 px-3 py-1 text-sm text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="page-stat p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 mb-2">Smart signals</p>
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <p>• Route cards are ranked by value and speed.</p>
                  <p>• Recommendations highlight the cheapest, fastest, and most comfortable choices.</p>
                  <p>• The map updates as soon as you select a route.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Interface */}
        <div className="mb-12">
          <SearchInterface />
        </div>

        {/* Recommendations Section */}
        {recommendations && (
          <div className="mb-12">
            <RecommendationsDisplay
              recommendations={recommendations}
              onSelectRoute={selectRoute}
            />
          </div>
        )}

        {/* Fare Comparison */}
        {routes.length > 0 && source && destination && (
          <div className="mb-12">
            <FareComparison
              routes={routes}
              source={source}
              destination={destination}
            />
          </div>
        )}

        {/* Results Section */}
        {routes.length > 0 && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Routes List */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Available Routes</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Compare route cards side by side</p>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-2">
                {routes.map((route, i) => (
                  <RouteCard
                    key={i}
                    route={route}
                    isSelected={selectedRoute?.id === route.id}
                    onSelect={() => selectRoute(route)}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                {selectedRoute && (
                  <div className="mb-4 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Selected Route</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          {[...new Set(selectedRoute.modes)].map((m: string) => modeLabel(m)).join(' → ')}
                          {selectedRoute.via_stops?.find((s: string) => s.startsWith('Bus route:'))
                            ? ` • ${selectedRoute.via_stops.find((s: string) => s.startsWith('Bus route:'))?.replace('Bus route: ', '')}`
                            : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-500 dark:text-primary-400">₹{selectedRoute.fare.toFixed(2)}</p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {selectedRoute.duration_minutes} min • {selectedRoute.distance_km.toFixed(1)} km
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <MapComponent
                  source={source || undefined}
                  destination={destination || undefined}
                  route={selectedRoute}
                  routes={routes}
                  onMapClick={handleMapClick}
                />
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  Click the map to set source first, then destination. Select any route to redraw it here.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Route Optimizer Map */}
        {routes.length === 0 && (
          <motion.div
            className="rounded-xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MapComponent
              source={source || undefined}
              destination={destination || undefined}
              onMapClick={handleMapClick}
            />
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Click the map to choose source and destination, or search by stop name above.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

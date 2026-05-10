import React, { useEffect, useRef } from 'react';
import { SearchInterface, RouteCard } from '../components/SearchInterface';
import { RecommendationsDisplay } from '../components/RecommendationsDisplay';
import { MapComponent } from '../components/MapComponent';
import { FareComparison } from '../components/FareComparison';
import { useSearchStore, useTransitStore } from '../store/search';
import { useThemeStore } from '../store/theme';
import { useHistoryStore } from '../store/history';
import { motion } from 'framer-motion';
import apiService from '../services/api';

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
  const { setBusStops, setMetroStations, setBusStopsLoaded, setMetroStationsLoaded } =
    useTransitStore();
  const { isDarkMode } = useThemeStore();
  const { addRoute } = useHistoryStore();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load transit data on mount
  useEffect(() => {
    const loadTransitData = async () => {
      try {
        const [busResponse, metroResponse] = await Promise.all([
          apiService.getAllBusStops(),
          apiService.getAllMetroStations(),
        ]);

        setBusStops(busResponse.data.stops || []);
        setMetroStations(metroResponse.data.stations || []);
        setBusStopsLoaded(true);
        setMetroStationsLoaded(true);
      } catch (error) {
        console.error('Error loading transit data:', error);
      }
    };

    loadTransitData();
  }, []);

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
    <div className={`min-h-screen pt-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Plan Your Route</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Find the best multimodal route for your journey</p>
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
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Available Routes</h2>
              <div className={`space-y-3 max-h-[600px] overflow-y-auto rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
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

            {/* Map and Details */}
            <div className="lg:col-span-2">
              <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
                {selectedRoute && (
                  <div className={`mb-4 rounded-lg p-4 ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-50'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">Selected Route</h3>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {[...new Set(selectedRoute.modes)].map((m: string) => modeLabel(m)).join(' → ')}
                          {selectedRoute.via_stops?.find((s: string) => s.startsWith('Bus route:'))
                            ? ` • ${selectedRoute.via_stops.find((s: string) => s.startsWith('Bus route:'))?.replace('Bus route: ', '')}`
                            : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-400">₹{selectedRoute.fare.toFixed(2)}</p>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
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
                <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click the map to set source first, then destination. Select any route to redraw it here.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Route Optimizer Map */}
        {routes.length === 0 && (
          <motion.div
            className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MapComponent
              source={source || undefined}
              destination={destination || undefined}
              onMapClick={handleMapClick}
            />
            <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Click the map to choose source and destination, or search by stop name above.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader } from 'lucide-react';
import { useSearchStore } from '../store/search';
import { useTransitStore } from '../store/search';
import { useHistoryStore } from '../store/history';
import apiService from '../services/api';

interface SearchInterfaceProps {
  onSearch?: (routes: any) => void;
}

interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type?: string;
  stop_id?: string;
  stop_name?: string;
  stop_lat?: number;
  stop_lon?: number;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch }) => {
  const {
    source,
    destination,
    loading,
    error,
    routes,
    setSource,
    setDestination,
    setRoutes,
    setRecommendations,
    setSelectedRoute,
    setLoading,
    setError,
  } = useSearchStore();

  const { busStops, metroStations, setBusStops, setMetroStations } = useTransitStore();
  const { addRoute } = useHistoryStore();

  const [sourceInput, setSourceInput] = useState(source?.name || '');
  const [destInput, setDestInput] = useState(destination?.name || '');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [sourceSuggestions, setSourceSuggestions] = useState<Stop[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<Stop[]>([]);
  const sourceRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (source?.name) setSourceInput(source.name);
  }, [source]);

  useEffect(() => {
    if (destination?.name) setDestInput(destination.name);
  }, [destination]);

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
      } catch (error) {
        console.error('Error loading transit data:', error);
      }
    };

    if (busStops.length === 0) {
      loadTransitData();
    }
  }, []);

  const normalizePlace = (place: any) => ({
    lat: place.stop_lat ?? place.lat,
    lng: place.stop_lon ?? place.lng,
    name: place.stop_name ?? place.name,
    type: place.type ?? (place.stop_id ? 'bus_stop' : 'place'),
  });

  // Search real places for source
  useEffect(() => {
    if (sourceInput.trim().length < 2) {
      setSourceSuggestions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const response = await apiService.searchLocations(sourceInput, 8);
        let results = response.data.results || [];
        
        // Fallback to local transit database if Nominatim finds nothing
        if (results.length === 0) {
          const allStops = [...(busStops || []), ...(metroStations || [])];
          results = allStops.filter(stop => {
            const stopName = stop.stop_name || stop.name || '';
            return stopName.toLowerCase().includes(sourceInput.toLowerCase());
          }).slice(0, 8);
        }
        setSourceSuggestions(results);
      } catch {
        const allStops = [...(busStops || []), ...(metroStations || [])];
        setSourceSuggestions(allStops.filter(stop => {
          const stopName = stop.stop_name || stop.name || '';
          return stopName.toLowerCase().includes(sourceInput.toLowerCase());
        }).slice(0, 8));
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [sourceInput, busStops, metroStations]);

  // Search real places for destination
  useEffect(() => {
    if (destInput.trim().length < 2) {
      setDestSuggestions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const response = await apiService.searchLocations(destInput, 8);
        let results = response.data.results || [];
        
        // Fallback to local transit database if Nominatim finds nothing
        if (results.length === 0) {
          const allStops = [...(busStops || []), ...(metroStations || [])];
          results = allStops.filter(stop => {
            const stopName = stop.stop_name || stop.name || '';
            return stopName.toLowerCase().includes(destInput.toLowerCase());
          }).slice(0, 8);
        }
        setDestSuggestions(results);
      } catch {
        const allStops = [...(busStops || []), ...(metroStations || [])];
        setDestSuggestions(allStops.filter(stop => {
          const stopName = stop.stop_name || stop.name || '';
          return stopName.toLowerCase().includes(destInput.toLowerCase());
        }).slice(0, 8));
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [destInput, busStops, metroStations]);

  const handleSelectSource = (stop: any) => {
    const place = normalizePlace(stop);
    setSource({ lat: place.lat, lng: place.lng, name: place.name });
    setSourceInput(place.name);
    setSourceOpen(false);
  };

  const handleSelectDestination = (stop: any) => {
    const place = normalizePlace(stop);
    setDestination({ lat: place.lat, lng: place.lng, name: place.name });
    setDestInput(place.name);
    setDestOpen(false);
  };

  const resolveTypedLocation = async (
    selected: typeof source,
    input: string,
    setter: (location: any) => void
  ) => {
    if (selected && selected.name === input) return selected;
    const response = await apiService.geocodeLocation(input);
    const place = normalizePlace(response.data);
    const location = { lat: place.lat, lng: place.lng, name: place.name };
    setter(location);
    return location;
  };

  const handleSearch = async () => {
    if (!sourceInput.trim() || !destInput.trim()) {
      setError('Enter both source and destination');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resolvedSource = await resolveTypedLocation(source, sourceInput.trim(), setSource);
      const resolvedDestination = await resolveTypedLocation(destination, destInput.trim(), setDestination);

      if (resolvedSource.lat === resolvedDestination.lat && resolvedSource.lng === resolvedDestination.lng) {
        setError('Source and destination cannot be the same');
        return;
      }

      const response = await apiService.searchRoutes(resolvedSource, resolvedDestination, 8);
      const routes = response.data.routes || [];
      const recommendations = response.data.recommendations || null;
      setRoutes(routes);
      setSelectedRoute(routes[0] || null);
      if (recommendations) {
        setRecommendations(recommendations);
      }

      // Save to history
      if (routes.length > 0) {
        const bestRoute = routes[0];
        addRoute({
          id: `${resolvedSource.name}-${resolvedDestination.name}-${Date.now()}`,
          source: resolvedSource.name || 'Source',
          destination: resolvedDestination.name || 'Destination',
          sourceCoords: { lat: resolvedSource.lat, lng: resolvedSource.lng },
          destCoords: { lat: resolvedDestination.lat, lng: resolvedDestination.lng },
          routes: routes,
          recommendations: recommendations,
          fare: bestRoute.fare || 0,
          duration: bestRoute.duration_minutes || 0,
          distance: bestRoute.distance_km || 0,
          modes: bestRoute.modes || [],
          timestamp: Date.now(),
        });
      }

      onSearch?.(routes);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to search routes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold text-white mb-6">Plan Your Route</h2>

      <div className="space-y-4">
        {/* Source */}
        <div className="relative z-20" ref={sourceRef}>
          <label className="block text-sm font-medium text-slate-300 mb-2">From</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-primary-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search any place, address, landmark, or use map click"
              value={sourceInput}
              onChange={(e) => {
                setSourceInput(e.target.value);
                setSource(null);
              }}
              onFocus={() => setSourceOpen(true)}
              onBlur={() => setTimeout(() => setSourceOpen(false), 200)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-primary-400"
            />
            {source && (
              <span className="absolute right-3 top-3 text-xs text-primary-300 bg-primary-900 px-2 py-1 rounded">
                ✓ Selected
              </span>
            )}
          </div>
          {/* Source Suggestions */}
          <AnimatePresence>
            {sourceOpen && sourceSuggestions.length > 0 && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {sourceSuggestions.map((stop, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSource(stop)}
                    className="w-full text-left px-4 py-2 hover:bg-primary-500/20 border-b border-slate-700 last:border-b-0 text-white text-sm transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-400" />
                      <div>
                        <p className="font-medium">{stop.stop_name || stop.name}</p>
                        <p className="text-xs text-slate-400">{stop.type || (stop.stop_id ? 'bus stop' : 'place')} • {(stop.stop_lat || stop.lat).toFixed(3)}, {(stop.stop_lon || stop.lng).toFixed(3)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Destination */}
        <div className="relative z-10" ref={destRef}>
          <label className="block text-sm font-medium text-slate-300 mb-2">To</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-primary-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search destination place, address, or landmark"
              value={destInput}
              onChange={(e) => {
                setDestInput(e.target.value);
                setDestination(null);
              }}
              onFocus={() => setDestOpen(true)}
              onBlur={() => setTimeout(() => setDestOpen(false), 200)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-primary-400"
            />
            {destination && (
              <span className="absolute right-3 top-3 text-xs text-primary-300 bg-primary-900 px-2 py-1 rounded">
                ✓ Selected
              </span>
            )}
          </div>
          {/* Destination Suggestions */}
          <AnimatePresence>
            {destOpen && destSuggestions.length > 0 && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {destSuggestions.map((stop, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectDestination(stop)}
                    className="w-full text-left px-4 py-2 hover:bg-primary-500/20 border-b border-slate-700 last:border-b-0 text-white text-sm transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-400" />
                      <div>
                        <p className="font-medium">{stop.stop_name || stop.name}</p>
                        <p className="text-xs text-slate-400">{stop.type || (stop.stop_id ? 'bus stop' : 'place')} • {(stop.stop_lat || stop.lat).toFixed(3)}, {(stop.stop_lon || stop.lng).toFixed(3)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Find Routes
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

const MODE_META: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  walk:        { label: 'Walk',        color: 'text-green-400',  bg: 'bg-green-500/15',  emoji: '🚶' },
  bus:         { label: 'Bus',         color: 'text-blue-400',   bg: 'bg-blue-500/15',   emoji: '🚌' },
  metro:       { label: 'Metro',       color: 'text-purple-400', bg: 'bg-purple-500/15', emoji: '🚇' },
  rapido_bike: { label: 'Rapido Bike', color: 'text-yellow-400', bg: 'bg-yellow-500/15', emoji: '🛵' },
  auto:        { label: 'Auto',        color: 'text-orange-400', bg: 'bg-orange-500/15', emoji: '🛺' },
  ola_mini:    { label: 'Ola Mini',    color: 'text-indigo-400', bg: 'bg-indigo-500/15', emoji: '🚗' },
  uber_go:     { label: 'Uber Go',     color: 'text-slate-300',  bg: 'bg-slate-500/15',  emoji: '🚙' },
  ride:        { label: 'Ride',        color: 'text-orange-400', bg: 'bg-orange-500/15', emoji: '🚗' },
};

export const RouteCard: React.FC<{ route: any; isSelected?: boolean; onSelect?: () => void }> = ({
  route,
  isSelected = false,
  onSelect,
}) => {
  const formatWalk = (km: number) => {
    if (!km || km < 0.01) return 'At stop';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  // Bus route info — skip traffic noise lines
  const boardAt = route.via_stops?.find((s: string) => s.startsWith('Board at'));
  const busInfo = route.via_stops?.find((s: string) => s.startsWith('Bus route:'));
  const alightAt = route.via_stops?.find((s: string) => s.startsWith('Get down at'));

  return (
    <motion.button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? 'bg-primary-500/20 border-primary-400 shadow-lg shadow-primary-500/10'
          : 'bg-slate-800 border-slate-700 hover:border-slate-500'
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Header: mode badges + fare */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-1.5">
          {route.modes.map((mode: string, i: number) => {
            const meta = MODE_META[mode] || { label: mode, color: 'text-slate-300', bg: 'bg-slate-600/20', emoji: '🚐' };
            return (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}
              >
                <span>{meta.emoji}</span>
                {meta.label}
              </span>
            );
          })}
        </div>
        <span className="text-xl font-bold text-primary-400 ml-2 shrink-0">₹{route.fare.toFixed(0)}</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div>
          <p className="text-slate-500 text-xs mb-0.5">Duration</p>
          <p className="text-white text-sm font-semibold">{route.duration_minutes} min</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs mb-0.5">Distance</p>
          <p className="text-white text-sm font-semibold">{route.distance_km.toFixed(1)} km</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs mb-0.5">Walking</p>
          <p className="text-white text-sm font-semibold">{formatWalk(route.walking_distance_km)}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs mb-0.5">Transfers</p>
          <p className="text-white text-sm font-semibold">{route.transfer_count}</p>
        </div>
      </div>

      {/* Route guidance (only meaningful info) */}
      {(boardAt || busInfo || alightAt) && (
        <div className="bg-slate-700/40 rounded-lg px-3 py-2 text-xs text-slate-300 space-y-0.5">
          {boardAt && <p>📍 {boardAt.replace('Board at ', '')}</p>}
          {busInfo && <p className="font-medium text-blue-300">🚌 {busInfo.replace('Bus route: ', '')}</p>}
          {alightAt && <p>🏁 {alightAt.replace('Get down at ', '')}</p>}
        </div>
      )}

      {/* Inline fare breakdown */}
      {route.fare_breakdown && (
        <div className="mt-2 text-xs text-slate-400">
          <span>{route.fare_breakdown.label}: </span>
          <span>₹{route.fare_breakdown.base_fare} base</span>
          {route.fare_breakdown.distance_component != null && (
            <span> + ₹{Number(route.fare_breakdown.distance_component).toFixed(0)} dist</span>
          )}
          {route.fare_breakdown.time_component != null && (
            <span> + ₹{Number(route.fare_breakdown.time_component).toFixed(0)} time</span>
          )}
          {route.fare_breakdown.surge_multiplier > 1 && (
            <span className="text-orange-400"> ×{route.fare_breakdown.surge_multiplier} surge</span>
          )}
        </div>
      )}
    </motion.button>
  );
};

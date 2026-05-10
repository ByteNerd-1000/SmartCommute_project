import { create } from 'zustand';

export interface Route {
  id: string;
  modes: string[];
  fare: number;
  duration_minutes: number;
  walking_distance_km: number;
  transfer_count: number;
  distance_km: number;
  stops: any[];
  polyline?: [number, number][];
  via_stops?: string[];
  traffic_level?: number;
  traffic_provider?: string;
}

export interface Score {
  overall: number;
  cheapness: number;
  speed: number;
  comfort: number;
  eco_friendliness: number;
}

export interface Recommendation {
  route: Route;
  score: Score;
  recommendation_type: string;
  reason: string;
}

export interface SearchState {
  source: { lat: number; lng: number; name?: string } | null;
  destination: { lat: number; lng: number; name?: string } | null;
  routes: Route[];
  selectedRoute: Route | null;
  recommendations: {
    best_overall?: Recommendation;
    cheapest?: Recommendation;
    fastest?: Recommendation;
    eco_friendly?: Recommendation;
  } | null;
  loading: boolean;
  error: string | null;
}

interface SearchStore extends SearchState {
  setSource: (source: SearchState['source']) => void;
  setDestination: (destination: SearchState['destination']) => void;
  setRoutes: (routes: Route[]) => void;
  setSelectedRoute: (route: Route | null) => void;
  setRecommendations: (recommendations: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: SearchState = {
  source: null,
  destination: null,
  routes: [],
  selectedRoute: null,
  recommendations: null,
  loading: false,
  error: null,
};

export const useSearchStore = create<SearchStore>((set) => ({
  ...initialState,
  
  setSource: (source) => set({ source }),
  setDestination: (destination) => set({ destination }),
  setRoutes: (routes) => set({ routes }),
  setSelectedRoute: (selectedRoute) => set({ selectedRoute }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  reset: () => set(initialState),
}));

// Transit Data Store
interface TransitStore {
  busStops: any[];
  metroStations: any[];
  busStopsLoaded: boolean;
  metroStationsLoaded: boolean;
  setBusStops: (stops: any[]) => void;
  setMetroStations: (stations: any[]) => void;
  setBusStopsLoaded: (loaded: boolean) => void;
  setMetroStationsLoaded: (loaded: boolean) => void;
}

export const useTransitStore = create<TransitStore>((set) => ({
  busStops: [],
  metroStations: [],
  busStopsLoaded: false,
  metroStationsLoaded: false,
  setBusStops: (busStops) => set({ busStops }),
  setMetroStations: (metroStations) => set({ metroStations }),
  setBusStopsLoaded: (busStopsLoaded) => set({ busStopsLoaded }),
  setMetroStationsLoaded: (metroStationsLoaded) => set({ metroStationsLoaded }),
}));

// Analytics Store
interface AnalyticsStore {
  summary: any | null;
  trends: any | null;
  setSummary: (summary: any) => void;
  setTrends: (trends: any) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  summary: null,
  trends: null,
  setSummary: (summary) => set({ summary }),
  setTrends: (trends) => set({ trends }),
}));

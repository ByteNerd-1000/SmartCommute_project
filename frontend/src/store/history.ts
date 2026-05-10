import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedRoute {
  id: string;
  source: string;
  destination: string;
  sourceCoords: { lat: number; lng: number };
  destCoords: { lat: number; lng: number };
  routes: any[];
  recommendations?: any;
  fare: number;
  duration: number;
  distance: number;
  modes: string[];
  timestamp: number;
  frequency?: number; // How many times this route was searched
}

interface HistoryStore {
  savedRoutes: SavedRoute[];
  frequentRoutes: SavedRoute[];
  addRoute: (route: SavedRoute) => void;
  removeRoute: (id: string) => void;
  clearHistory: () => void;
  updateFrequency: (id: string) => void;
  getSortedRoutes: () => SavedRoute[];
  getFrequentRoutes: (limit?: number) => SavedRoute[];
  getRecentRoutes: (limit?: number) => SavedRoute[];
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      savedRoutes: [],
      frequentRoutes: [],

      addRoute: (route: SavedRoute) =>
        set((state) => {
          const existingIndex = state.savedRoutes.findIndex(
            (r) =>
              r.source === route.source &&
              r.destination === route.destination
          );

          if (existingIndex >= 0) {
            const existing = state.savedRoutes[existingIndex];
            const updated = [...state.savedRoutes];
            updated[existingIndex] = {
              ...existing,
              ...route,
              frequency: (existing.frequency || 1) + 1,
              timestamp: Date.now(),
            };
            return { savedRoutes: updated };
          }

          return {
            savedRoutes: [
              ...state.savedRoutes,
              { ...route, frequency: 1 },
            ],
          };
        }),

      removeRoute: (id: string) =>
        set((state) => ({
          savedRoutes: state.savedRoutes.filter((r) => r.id !== id),
        })),

      clearHistory: () =>
        set({
          savedRoutes: [],
          frequentRoutes: [],
        }),

      updateFrequency: (id: string) =>
        set((state) => {
          const updated = state.savedRoutes.map((r) =>
            r.id === id
              ? { ...r, frequency: (r.frequency || 1) + 1, timestamp: Date.now() }
              : r
          );
          return { savedRoutes: updated };
        }),

      getSortedRoutes: () =>
        [...get().savedRoutes].sort(
          (a, b) => b.timestamp - a.timestamp
        ),

      getFrequentRoutes: (limit = 5) =>
        [...get().savedRoutes]
          .sort(
            (a, b) => (b.frequency || 1) - (a.frequency || 1)
          )
          .slice(0, limit),

      getRecentRoutes: (limit = 5) =>
        [...get().savedRoutes]
          .sort(
            (a, b) => b.timestamp - a.timestamp
          )
          .slice(0, limit),
    }),
    {
      name: 'route-history-storage',
    }
  )
);

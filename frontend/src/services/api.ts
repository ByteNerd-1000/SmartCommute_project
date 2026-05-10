import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const apiService = {
  searchLocations: (query: string, limit: number = 8) =>
    apiClient.get('/locations/search', { params: { q: query, limit } }),

  geocodeLocation: (query: string) =>
    apiClient.get('/locations/geocode', { params: { q: query } }),

  // Route Search
  searchRoutes: (source: any, destination: any, maxOptions: number = 5) =>
    apiClient.post('/routes/search', {
      source: {
        latitude: source.lat,
        longitude: source.lng,
        name: source.name
      },
      destination: {
        latitude: destination.lat,
        longitude: destination.lng,
        name: destination.name
      },
      max_options: maxOptions
    }),

  compareRoutes: (routeIds: string[]) =>
    apiClient.get('/routes/compare', { params: { route_ids: routeIds } }),

  getRouteHistory: (limit: number = 50) =>
    apiClient.get('/history/routes', { params: { limit } }),

  saveRoute: (payload: any) =>
    apiClient.post('/saved-routes', payload),

  getSavedRoutes: () =>
    apiClient.get('/saved-routes'),

  deleteSavedRoute: (routeId: number) =>
    apiClient.delete(`/saved-routes/${routeId}`),

  // Fare Prediction
  predictFare: (fareParams: any) =>
    apiClient.post('/fare/predict', fareParams),

  // Transit Data
  getNearbyBusStops: (lat: number, lng: number, radiusKm: number = 1.0) =>
    apiClient.get('/transit/bus-stops', {
      params: { latitude: lat, longitude: lng, radius_km: radiusKm }
    }),

  getNearbyMetroStations: (lat: number, lng: number, radiusKm: number = 1.0) =>
    apiClient.get('/transit/metro-stations', {
      params: { latitude: lat, longitude: lng, radius_km: radiusKm }
    }),

  getAllBusStops: () =>
    apiClient.get('/transit/all-bus-stops'),

  getAllMetroStations: () =>
    apiClient.get('/transit/all-metro-stations'),

  getInterchangeStations: () =>
    apiClient.get('/transit/interchanges'),

  // Analytics
  getAnalyticsSummary: () =>
    apiClient.get('/analytics/summary'),

  getAnalyticsTrends: (days: number = 7) =>
    apiClient.get('/analytics/trends', { params: { days } }),

  // Info
  getVersion: () =>
    apiClient.get('/info/version'),
};

export default apiService;

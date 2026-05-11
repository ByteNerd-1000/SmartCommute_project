import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const sourceIcon = L.divIcon({
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#22C55E;border:3px solid #fff;
    box-shadow:0 0 0 2px #22C55E,0 2px 6px rgba(0,0,0,0.5);
  "></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const destIcon = L.divIcon({
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#EF4444;border:3px solid #fff;
    box-shadow:0 0 0 2px #EF4444,0 2px 6px rgba(0,0,0,0.5);
  "></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const routeColors: Record<string, string> = {
  bus: '#0EA5E9',
  metro: '#A855F7',
  ride: '#F97316',
  walk: '#22C55E',
  rapido_bike: '#EAB308',
  auto: '#F59E0B',
  ola_mini: '#6366F1',
  uber_go: '#94A3B8',
};

function getColor(modes: string[]): string {
  const primary = modes?.find((m) => m !== 'walk') || modes?.[0] || 'bus';
  return routeColors[primary] || '#0EA5E9';
}

function toLatLng(polyline: [number, number][]): [number, number][] {
  return polyline.map(([lat, lng]) => [lat, lng]);
}

function stopsToLatLng(stops: any[]): [number, number][] {
  return stops
    .filter((s) => s?.lat != null && s?.lng != null)
    .map((s) => [s.lat, s.lng]);
}

function getPolylinePoints(route: any): [number, number][] {
  if (route?.polyline?.length >= 2) return toLatLng(route.polyline);
  if (route?.stops?.length >= 2) return stopsToLatLng(route.stops);
  return [];
}

// Auto-fit map to source+destination
const MapController: React.FC<{
  source?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
}> = ({ source, destination, onMapClick }) => {
  const map = useMap();

  useMapEvents({
    click: (e: any) => onMapClick?.(e.latlng.lat, e.latlng.lng),
  });

  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);

  useEffect(() => {
    if (source && destination) {
      const bounds = L.latLngBounds(
        [source.lat, source.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (source) {
      map.setView([source.lat, source.lng], 14);
    }
  }, [map, source?.lat, source?.lng, destination?.lat, destination?.lng]);

  return null;
};

interface MapComponentProps {
  source?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  busStops?: any[];
  metroStations?: any[];
  route?: any;
  routes?: any[];
  onMapClick?: (lat: number, lng: number) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  source,
  destination,
  route,
  routes = [],
  onMapClick,
}) => {
  const center: [number, number] = source
    ? [source.lat, source.lng]
    : [18.5204, 73.8567];

  const selectedId = route?.id;

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        zoomControl={true}
      >
        <MapController source={source} destination={destination} onMapClick={onMapClick} />

        {/* CartoDB Positron (light) tiles - clean light map, no API key */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Source marker */}
        {source && (
          <Marker position={[source.lat, source.lng]} icon={sourceIcon}>
            <Popup>
              <div className="text-sm font-semibold text-gray-800">📍 Start</div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
            <Popup>
              <div className="text-sm font-semibold text-gray-800">🏁 Destination</div>
            </Popup>
          </Marker>
        )}

        {/* Background route polylines (unselected) */}
        {routes
          .filter((r) => r?.id !== selectedId)
          .map((r) => {
            const pts = getPolylinePoints(r);
            if (pts.length < 2) return null;
            return (
              <Polyline
                key={r.id}
                positions={pts}
                pathOptions={{
                  color: getColor(r.modes),
                  weight: 4,
                  opacity: 0.3,
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <strong>{r.modes?.join(' → ')}</strong><br />
                    ₹{r.fare?.toFixed(2)} · {r.duration_minutes} min · {r.distance_km?.toFixed(1)} km
                  </div>
                </Popup>
              </Polyline>
            );
          })}

        {/* Selected route polyline */}
        {route && (() => {
          const pts = getPolylinePoints(route);
          if (pts.length < 2) return null;
          const isPrivate = route.modes?.some((m: string) =>
            ['rapido_bike', 'auto', 'ola_mini', 'uber_go'].includes(m)
          );
          return (
            <Polyline
              key={`selected-${route.id}`}
              positions={pts}
              pathOptions={{
                color: getColor(route.modes),
                weight: 7,
                opacity: 0.95,
                dashArray: isPrivate ? '12 8' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            >
              <Popup>
                <div className="text-xs">
                  <strong>✅ {route.modes?.join(' → ')}</strong><br />
                  ₹{route.fare?.toFixed(2)} · {route.duration_minutes} min · {route.distance_km?.toFixed(1)} km
                </div>
              </Popup>
            </Polyline>
          );
        })()}
      </MapContainer>
    </div>
  );
};

export default MapComponent;

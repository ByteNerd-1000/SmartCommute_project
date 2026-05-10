/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'leaflet';

declare module 'react-leaflet' {
  import type { ComponentType, ReactNode } from 'react';
  export const MapContainer: ComponentType<any>;
  export const TileLayer: ComponentType<any>;
  export const Marker: ComponentType<any>;
  export const Popup: ComponentType<{ children?: ReactNode }>;
  export const Polyline: ComponentType<any>;
  export const useMap: () => any;
  export const useMapEvents: (handlers: any) => any;
}

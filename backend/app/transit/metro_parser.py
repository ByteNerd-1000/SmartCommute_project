"""
Metro dataset parser for Pune Metro system.
Handles metro stops, routes, and interchanges.
"""
import pandas as pd
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import logging
from app.config import METRO_DATASET_DIR

logger = logging.getLogger(__name__)

class MetroParser:
    """Parse and manage Pune Metro data."""
    
    def __init__(self, metro_dir: Path = METRO_DATASET_DIR):
        """Initialize Metro parser."""
        self.metro_dir = metro_dir
        self.stops: Optional[pd.DataFrame] = None
        self.routes: Optional[pd.DataFrame] = None
        self.trips: Optional[pd.DataFrame] = None
        self.stop_times: Optional[pd.DataFrame] = None
        self._load_data()
    
    def _load_data(self):
        """Load all metro data files."""
        try:
            self.stops = pd.read_csv(self.metro_dir / "metro_stops.csv")
            logger.info(f"Loaded {len(self.stops)} metro stops")
            
            self.routes = pd.read_csv(self.metro_dir / "metro_routes.csv")
            logger.info(f"Loaded {len(self.routes)} metro routes")
            
            self.trips = pd.read_csv(self.metro_dir / "metro_trips.csv")
            logger.info(f"Loaded {len(self.trips)} metro trips")
            
            self.stop_times = pd.read_csv(self.metro_dir / "metro_stop_times.csv")
            logger.info(f"Loaded {len(self.stop_times)} metro stop times")
        except Exception as e:
            logger.error(f"Error loading metro data: {e}")
            raise
    
    def get_all_stops(self) -> List[Dict]:
        """Get all metro stops."""
        if self.stops is None:
            return []
        
        stops_list = []
        for _, row in self.stops.iterrows():
            stops_list.append({
                "stop_id": str(row.get("stop_id", "")),
                "stop_name": str(row.get("stop_name", "")),
                "stop_lat": float(row.get("stop_lat", 0)),
                "stop_lon": float(row.get("stop_lon", 0)),
                "line": str(row.get("line", ""))
            })
        return stops_list
    
    def get_stop_by_id(self, stop_id: str) -> Optional[Dict]:
        """Get metro stop details by ID."""
        if self.stops is None:
            return None
        
        stop = self.stops[self.stops["stop_id"].astype(str) == stop_id]
        if stop.empty:
            return None
        
        row = stop.iloc[0]
        return {
            "stop_id": str(row.get("stop_id", "")),
            "stop_name": str(row.get("stop_name", "")),
            "stop_lat": float(row.get("stop_lat", 0)),
            "stop_lon": float(row.get("stop_lon", 0)),
            "line": str(row.get("line", ""))
        }
    
    def get_stops_near_location(self, lat: float, lon: float, radius_km: float = 1.0) -> List[Dict]:
        """Find metro stops within radius."""
        if self.stops is None:
            return []
        
        from app.utils.geolocation import haversine_distance
        
        nearby = []
        for _, row in self.stops.iterrows():
            dist = haversine_distance(
                lat, lon,
                float(row.get("stop_lat", 0)),
                float(row.get("stop_lon", 0))
            )
            if dist <= radius_km:
                nearby.append({
                    "stop_id": str(row.get("stop_id", "")),
                    "stop_name": str(row.get("stop_name", "")),
                    "stop_lat": float(row.get("stop_lat", 0)),
                    "stop_lon": float(row.get("stop_lon", 0)),
                    "line": str(row.get("line", "")),
                    "distance_km": round(dist, 3)
                })
        
        return sorted(nearby, key=lambda x: x["distance_km"])
    
    def get_routes_for_stop(self, stop_id: str) -> List[Dict]:
        """Get metro routes serving this stop."""
        if self.stop_times is None or self.trips is None or self.routes is None:
            return []
        
        trips_at_stop = self.stop_times[
            self.stop_times["stop_id"].astype(str) == stop_id
        ]["trip_id"].unique()
        
        routes_set = set()
        for trip_id in trips_at_stop:
            trip = self.trips[self.trips["trip_id"] == trip_id]
            if not trip.empty:
                route_id = trip.iloc[0]["route_id"]
                routes_set.add(route_id)
        
        routes_list = []
        for route_id in routes_set:
            route = self.routes[self.routes["route_id"] == route_id]
            if not route.empty:
                row = route.iloc[0]
                routes_list.append({
                    "route_id": str(row.get("route_id", "")),
                    "route_name": str(row.get("route_name", "")),
                    "line": str(row.get("line", ""))
                })
        
        return routes_list
    
    def get_interchange_stations(self) -> List[Dict]:
        """Get all interchange stations where lines connect."""
        if self.stops is None:
            return []
        
        interchange_stations = []
        for stop_name in self.stops["stop_name"].unique():
            stops_with_name = self.stops[self.stops["stop_name"] == stop_name]
            lines = stops_with_name["line"].unique()
            
            if len(lines) > 1:
                row = stops_with_name.iloc[0]
                interchange_stations.append({
                    "stop_name": str(stop_name),
                    "stop_id": str(row.get("stop_id", "")),
                    "stop_lat": float(row.get("stop_lat", 0)),
                    "stop_lon": float(row.get("stop_lon", 0)),
                    "lines": [str(l) for l in lines]
                })
        
        return interchange_stations
    
    def get_stop_sequence_for_route(self, route_id: str, trip_id: Optional[str] = None) -> List[Dict]:
        """Get stop sequence for a metro route."""
        if self.trips is None or self.stop_times is None or self.stops is None:
            return []
        
        if trip_id is None:
            trips = self.trips[self.trips["route_id"] == route_id]
            if trips.empty:
                return []
            trip_id = trips.iloc[0]["trip_id"]
        
        trip_stops = self.stop_times[self.stop_times["trip_id"] == trip_id].sort_values("stop_sequence")
        
        sequence = []
        for _, row in trip_stops.iterrows():
            stop_id = str(row["stop_id"])
            stop_info = self.get_stop_by_id(stop_id)
            if stop_info:
                sequence.append({
                    **stop_info,
                    "arrival_time": row.get("arrival_time", ""),
                    "departure_time": row.get("departure_time", ""),
                    "stop_sequence": int(row.get("stop_sequence", 0))
                })
        
        return sequence

    
    def is_interchange_available(self, from_stop: str, to_stop: str) -> bool:
        """Check if interchange is available between two stops."""
        # Simplified interchange logic
        # In a real system, would check transfer times and connections
        from_stop_data = self.get_stop_by_id(from_stop)
        to_stop_data = self.get_stop_by_id(to_stop)
        
        if not from_stop_data or not to_stop_data:
            return False
        
        # Allow interchange if stops are close (within 500m)
        from app.utils.geolocation import haversine_distance
        dist = haversine_distance(
            from_stop_data["stop_lat"], from_stop_data["stop_lon"],
            to_stop_data["stop_lat"], to_stop_data["stop_lon"]
        )
        
        return dist <= 0.5

# Global Metro parser instance
_metro_parser: Optional[MetroParser] = None

def get_metro_parser() -> MetroParser:
    """Get or create global Metro parser."""
    global _metro_parser
    if _metro_parser is None:
        _metro_parser = MetroParser()
    return _metro_parser

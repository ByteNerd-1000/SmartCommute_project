"""
GTFS (General Transit Feed Specification) parsing service.
Reads and processes PMPML bus data.
"""
import pandas as pd
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import logging
from app.config import GTFS_DIR

logger = logging.getLogger(__name__)

class GTFSParser:
    """Parse and manage GTFS transit data."""
    
    def __init__(self, gtfs_dir: Path = GTFS_DIR):
        """Initialize GTFS parser with dataset directory."""
        self.gtfs_dir = gtfs_dir
        self.stops: Optional[pd.DataFrame] = None
        self.routes: Optional[pd.DataFrame] = None
        self.stop_times: Optional[pd.DataFrame] = None
        self.trips: Optional[pd.DataFrame] = None
        self.shapes: Optional[pd.DataFrame] = None
        self._load_data()
    
    def _load_data(self):
        """Load all GTFS data files."""
        try:
            self.stops = pd.read_csv(self.gtfs_dir / "stops.txt")
            logger.info(f"Loaded {len(self.stops)} stops")
            
            self.routes = pd.read_csv(self.gtfs_dir / "routes.txt")
            logger.info(f"Loaded {len(self.routes)} routes")
            
            self.stop_times = pd.read_csv(self.gtfs_dir / "stop_times.txt")
            logger.info(f"Loaded {len(self.stop_times)} stop times")
            
            self.trips = pd.read_csv(self.gtfs_dir / "trips.txt")
            logger.info(f"Loaded {len(self.trips)} trips")
            
            if (self.gtfs_dir / "shapes.txt").exists():
                self.shapes = pd.read_csv(self.gtfs_dir / "shapes.txt")
                logger.info(f"Loaded {len(self.shapes)} shape points")
        except Exception as e:
            logger.error(f"Error loading GTFS data: {e}")
            raise
    
    def get_all_stops(self) -> List[Dict]:
        """Get all bus stops as list of dicts."""
        if self.stops is None:
            return []
        
        stops_list = []
        for _, row in self.stops.iterrows():
            stops_list.append({
                "stop_id": row["stop_id"],
                "stop_name": row.get("stop_name", ""),
                "stop_lat": float(row["stop_lat"]),
                "stop_lon": float(row["stop_lon"]),
                "stop_desc": row.get("stop_desc", ""),
                "stop_code": row.get("stop_code", "")
            })
        return stops_list
    
    def get_stop_by_id(self, stop_id: str) -> Optional[Dict]:
        """Get stop details by ID."""
        if self.stops is None:
            return None
        
        stop = self.stops[self.stops["stop_id"] == stop_id]
        if stop.empty:
            return None
        
        row = stop.iloc[0]
        return {
            "stop_id": row["stop_id"],
            "stop_name": row.get("stop_name", ""),
            "stop_lat": float(row["stop_lat"]),
            "stop_lon": float(row["stop_lon"]),
            "stop_desc": row.get("stop_desc", ""),
            "stop_code": row.get("stop_code", "")
        }
    
    def get_stops_near_location(self, lat: float, lon: float, radius_km: float = 1.0) -> List[Dict]:
        """Find bus stops within radius of coordinates."""
        if self.stops is None:
            return []
        
        from app.utils.geolocation import haversine_distance
        
        nearby = []
        for _, row in self.stops.iterrows():
            dist = haversine_distance(
                lat, lon, 
                float(row["stop_lat"]), 
                float(row["stop_lon"])
            )
            if dist <= radius_km:
                nearby.append({
                    "stop_id": row["stop_id"],
                    "stop_name": row.get("stop_name", ""),
                    "stop_lat": float(row["stop_lat"]),
                    "stop_lon": float(row["stop_lon"]),
                    "distance_km": round(dist, 3)
                })
        
        return sorted(nearby, key=lambda x: x["distance_km"])
    
    def get_routes_for_stop(self, stop_id: str) -> List[Dict]:
        """Get all routes serving a stop."""
        if self.stop_times is None or self.trips is None or self.routes is None:
            return []
        
        # Find all trips serving this stop
        trips_at_stop = self.stop_times[self.stop_times["stop_id"] == stop_id]["trip_id"].unique()
        
        # Get routes for these trips
        routes_set = set()
        for trip_id in trips_at_stop:
            trip = self.trips[self.trips["trip_id"] == trip_id]
            if not trip.empty:
                route_id = trip.iloc[0]["route_id"]
                routes_set.add(route_id)
        
        # Get route details
        routes_list = []
        for route_id in routes_set:
            route = self.routes[self.routes["route_id"] == route_id]
            if not route.empty:
                row = route.iloc[0]
                routes_list.append({
                    "route_id": row["route_id"],
                    "route_short_name": row.get("route_short_name", ""),
                    "route_long_name": row.get("route_long_name", ""),
                    "route_type": row.get("route_type", ""),
                })
        
        return routes_list
    
    def get_route_shape(self, route_id: str, trip_id: Optional[str] = None) -> List[Tuple[float, float]]:
        """Get shape coordinates for a route."""
        if self.shapes is None or self.trips is None:
            return []
        
        # Get a trip for this route
        if trip_id is None:
            trips = self.trips[self.trips["route_id"] == route_id]
            if trips.empty:
                return []
            trip_id = trips.iloc[0]["trip_id"]
        
        # Get shape for this trip
        trip = self.trips[self.trips["trip_id"] == trip_id]
        if trip.empty:
            return []
        
        shape_id = trip.iloc[0].get("shape_id")
        if pd.isna(shape_id):
            return []
        
        shape_points = self.shapes[self.shapes["shape_id"] == shape_id]
        if shape_points.empty:
            return []
        
        # Sort by sequence and extract coordinates
        coords = []
        for _, row in shape_points.sort_values("shape_pt_sequence").iterrows():
            coords.append((float(row["shape_pt_lat"]), float(row["shape_pt_lon"])))
        
        return coords
    
    def get_stop_sequence_for_route(self, route_id: str, trip_id: Optional[str] = None) -> List[Dict]:
        """Get sequence of stops for a route."""
        if self.trips is None or self.stop_times is None or self.stops is None:
            return []
        
        # Get a trip for this route
        if trip_id is None:
            trips = self.trips[self.trips["route_id"] == route_id]
            if trips.empty:
                return []
            trip_id = trips.iloc[0]["trip_id"]
        
        # Get stops for this trip in sequence
        trip_stops = self.stop_times[self.stop_times["trip_id"] == trip_id].sort_values("stop_sequence")
        
        sequence = []
        for _, row in trip_stops.iterrows():
            stop_id = row["stop_id"]
            stop_info = self.get_stop_by_id(stop_id)
            if stop_info:
                sequence.append({
                    **stop_info,
                    "arrival_time": row.get("arrival_time", ""),
                    "departure_time": row.get("departure_time", ""),
                    "stop_sequence": int(row["stop_sequence"])
                })
        
        return sequence

    def get_trip_between_stops(self, source_stop_id: str, dest_stop_id: str) -> Optional[Dict]:
        """Find a trip where source appears before destination."""
        if self.stop_times is None or self.trips is None or self.routes is None:
            return None

        source_times = self.stop_times[self.stop_times["stop_id"] == source_stop_id][["trip_id", "stop_sequence"]]
        dest_times = self.stop_times[self.stop_times["stop_id"] == dest_stop_id][["trip_id", "stop_sequence"]]
        if source_times.empty or dest_times.empty:
            return None

        merged = source_times.merge(dest_times, on="trip_id", suffixes=("_src", "_dst"))
        if merged.empty:
            return None

        merged = merged.assign(sequence_gap=(merged["stop_sequence_dst"] - merged["stop_sequence_src"]).abs())
        best = merged.sort_values("sequence_gap", ascending=False).iloc[0]
        trip = self.trips[self.trips["trip_id"] == best["trip_id"]].iloc[0]
        route = self.routes[self.routes["route_id"] == trip["route_id"]].iloc[0]
        return {
            "trip_id": trip["trip_id"],
            "route_id": trip["route_id"],
            "shape_id": trip.get("shape_id"),
            "route_short_name": route.get("route_short_name", ""),
            "route_long_name": route.get("route_long_name", ""),
            "source_sequence": int(best["stop_sequence_src"]),
            "dest_sequence": int(best["stop_sequence_dst"]),
        }

    def get_shape_segment_between_stops(self, trip_id: str, source_stop_id: str, dest_stop_id: str) -> List[Tuple[float, float]]:
        """Return the shape segment between two stops for a specific trip."""
        if self.shapes is None or self.stop_times is None or self.trips is None:
            return []

        trip = self.trips[self.trips["trip_id"] == trip_id]
        if trip.empty:
            return []
        shape_id = trip.iloc[0].get("shape_id")
        if pd.isna(shape_id):
            return []

        source_stop = self.get_stop_by_id(source_stop_id)
        dest_stop = self.get_stop_by_id(dest_stop_id)
        if not source_stop or not dest_stop:
            return []

        points = self.shapes[self.shapes["shape_id"] == shape_id].sort_values("shape_pt_sequence")
        if points.empty:
            return []

        coords = [(float(row["shape_pt_lat"]), float(row["shape_pt_lon"])) for _, row in points.iterrows()]

        from app.utils.geolocation import haversine_distance

        def nearest_index(stop: Dict) -> int:
            return min(
                range(len(coords)),
                key=lambda idx: haversine_distance(stop["stop_lat"], stop["stop_lon"], coords[idx][0], coords[idx][1])
            )

        start = nearest_index(source_stop)
        end = nearest_index(dest_stop)
        if start <= end:
            return coords[start:end + 1]
        return coords[end:start + 1]

# Global GTFS parser instance
_gtfs_parser: Optional[GTFSParser] = None

def get_gtfs_parser() -> GTFSParser:
    """Get or create global GTFS parser."""
    global _gtfs_parser
    if _gtfs_parser is None:
        _gtfs_parser = GTFSParser()
    return _gtfs_parser

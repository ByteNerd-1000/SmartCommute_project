"""
Route optimization and planning service.
Core service that combines transit networks to generate multimodal routes.
"""
from typing import List, Dict, Tuple, Optional
import logging
from app.transit.gtfs_parser import get_gtfs_parser
from app.transit.metro_parser import get_metro_parser
from app.utils.geolocation import (
    haversine_distance,
    estimate_walk_duration,
    is_peak_hour,
    get_time_of_day
)
from app.services.recommendation_engine import Route, get_recommendation_engine
from app.services.traffic_routing import get_traffic_routing_service
from app.ml.fare_predictor import get_fare_model
import time

logger = logging.getLogger(__name__)

class RouteOptimizationService:
    """Service for optimizing multimodal routes."""
    
    def __init__(self):
        self.gtfs = get_gtfs_parser()
        self.metro = get_metro_parser()
        self.recommendation_engine = get_recommendation_engine()
        self.fare_model = get_fare_model()
        self.traffic = get_traffic_routing_service()
    
    def plan_routes(
        self,
        source_lat: float,
        source_lng: float,
        dest_lat: float,
        dest_lng: float,
        max_options: int = 5
    ) -> Dict:
        """Plan multimodal routes between source and destination."""
        
        logger.info(f"Planning routes from ({source_lat},{source_lng}) to ({dest_lat},{dest_lng})")
        
        try:
            # Find nearby transit points
            source_buses = self.gtfs.get_stops_near_location(source_lat, source_lng, 1.0)
            source_metros = self.metro.get_stops_near_location(source_lat, source_lng, 1.0)
            dest_buses = self.gtfs.get_stops_near_location(dest_lat, dest_lng, 1.0)
            dest_metros = self.metro.get_stops_near_location(dest_lat, dest_lng, 1.0)
            
            routes = []
            
            # Generate walking-only route
            walk_route = self._generate_walk_route(
                source_lat, source_lng, dest_lat, dest_lng
            )
            if walk_route:
                routes.append(walk_route)
            
            # Generate bus routes
            for src_bus in source_buses[:2]:
                for dst_bus in dest_buses[:2]:
                    route = self._generate_bus_route(
                        source_lat, source_lng, src_bus,
                        dest_lat, dest_lng, dst_bus
                    )
                    if route:
                        routes.append(route)
            
            # Generate metro routes
            for src_metro in source_metros[:2]:
                for dst_metro in dest_metros[:2]:
                    route = self._generate_metro_route(
                        source_lat, source_lng, src_metro,
                        dest_lat, dest_lng, dst_metro
                    )
                    if route:
                        routes.append(route)
            
            # Generate combined routes
            for src_bus in source_buses[:1]:
                for dst_metro in dest_metros[:1]:
                    route = self._generate_bus_metro_route(
                        source_lat, source_lng, src_bus,
                        dest_lat, dest_lng, dst_metro
                    )
                    if route:
                        routes.append(route)
            
            # Generate private provider estimates
            for provider in self._provider_fare_configs():
                private_route = self._generate_private_provider_route(
                    source_lat, source_lng, dest_lat, dest_lng, provider
                )
                if private_route:
                    routes.append(private_route)
            
            # Deduplicate and limit routes
            routes = self._deduplicate_routes(routes)
            routes = routes[:max_options]
            
            if not routes:
                logger.warning("No routes found")
                return {"routes": [], "error": "No routes found"}
            
            logger.info(f"Generated {len(routes)} route options")
            
            # Get recommendations
            recommendations = self.recommendation_engine.generate_recommendations(
                routes,
                (source_lat, source_lng),
                (dest_lat, dest_lng)
            )
            
            return {
                "routes": [r.to_dict() for r in routes],
                "recommendations": recommendations,
                "source": {"lat": source_lat, "lng": source_lng},
                "destination": {"lat": dest_lat, "lng": dest_lng}
            }
        
        except Exception as e:
            logger.error(f"Error planning routes: {e}", exc_info=True)
            return {"routes": [], "error": str(e)}
    
    def _generate_walk_route(
        self,
        src_lat: float,
        src_lng: float,
        dst_lat: float,
        dst_lng: float
    ) -> Optional[Route]:
        """Generate a walking-only route."""
        distance = haversine_distance(src_lat, src_lng, dst_lat, dst_lng)
        
        if distance > 2.0:  # Don't suggest walking more than 2km
            return None
        
        duration = estimate_walk_duration(distance)
        
        # Predict fare (walking should be free)
        fare = 0
        
        route = Route(
            id=f"walk_{int(time.time())}",
            modes=["walk"],
            fare=fare,
            duration_minutes=duration,
            walking_distance_km=distance,
            transfer_count=0,
            distance_km=distance,
            stops=[
                {"type": "start", "lat": src_lat, "lng": src_lng},
                {"type": "end", "lat": dst_lat, "lng": dst_lng}
            ]
        )
        
        return route
    
    def _generate_bus_route(
        self,
        src_lat: float,
        src_lng: float,
        src_bus: Dict,
        dst_lat: float,
        dst_lng: float,
        dst_bus: Dict
    ) -> Optional[Route]:
        """Generate a bus-only route."""
        
        # Calculate components
        walk1 = haversine_distance(src_lat, src_lng, src_bus["stop_lat"], src_bus["stop_lon"])
        walk2 = haversine_distance(dst_bus["stop_lat"], dst_bus["stop_lon"], dst_lat, dst_lng)
        
        if walk1 > 1.0 or walk2 > 1.0:
            return None
        
        bus_distance = haversine_distance(
            src_bus["stop_lat"], src_bus["stop_lon"],
            dst_bus["stop_lat"], dst_bus["stop_lon"]
        )
        
        traffic = self.traffic.estimate_drive(
            src_bus["stop_lat"], src_bus["stop_lon"],
            dst_bus["stop_lat"], dst_bus["stop_lon"]
        )
        bus_distance = traffic.distance_km

        # Estimate duration
        walk_time = estimate_walk_duration(walk1 + walk2)
        bus_time = max(1, int(traffic.duration_minutes * 1.1))
        total_duration = walk_time + bus_time + 10  # 10 min for boarding
        
        # Predict fare
        features = {
            "distance_km": bus_distance,
            "duration_min": bus_time,
            "traffic_level": traffic.traffic_level,
            "time_of_day": get_time_of_day(int(time.time()) % 86400),
            "weather": "clear",
            "vehicle_type": "bus",
            "peak_hour": is_peak_hour(int(time.time()) % 86400),
            "transfer_count": 0,
            "route_type": "PMPML"
        }
        # Realistic PMPML fare estimate
        # e.g. Hadapsar to Wagholi (~13.5km) is ₹40 -> roughly ₹5 base + ₹2.5/km
        fare = float(max(5.0, round(5.0 + (bus_distance * 2.5), 0)))
        trip_match = self.gtfs.get_trip_between_stops(src_bus["stop_id"], dst_bus["stop_id"])
        if trip_match:
            bus_route_label = (
                trip_match.get("route_short_name")
                or trip_match.get("route_long_name")
                or trip_match.get("route_id")
                or "PMPML"
            )
            bus_shape = self.gtfs.get_shape_segment_between_stops(
                trip_match["trip_id"],
                src_bus["stop_id"],
                dst_bus["stop_id"],
            )
        else:
            bus_routes = self._matching_bus_routes(src_bus["stop_id"], dst_bus["stop_id"])
            bus_route_label = ", ".join(bus_routes[:3]) if bus_routes else "PMPML connector"
            bus_shape = []

        route_polyline = [
            (src_lat, src_lng),
            (src_bus["stop_lat"], src_bus["stop_lon"]),
            *(bus_shape or traffic.polyline),
            (dst_bus["stop_lat"], dst_bus["stop_lon"]),
            (dst_lat, dst_lng),
        ]
        
        route = Route(
            id=f"bus_{src_bus['stop_id']}_{dst_bus['stop_id']}",
            modes=["walk", "bus", "walk"],
            fare=fare,
            duration_minutes=total_duration,
            walking_distance_km=walk1 + walk2,
            transfer_count=0,
            distance_km=bus_distance,
            stops=[
                {"type": "start", "lat": src_lat, "lng": src_lng},
                {"type": "bus_stop", "lat": src_bus["stop_lat"], "lng": src_bus["stop_lon"], "name": src_bus.get("stop_name")},
                {"type": "bus_stop", "lat": dst_bus["stop_lat"], "lng": dst_bus["stop_lon"], "name": dst_bus.get("stop_name")},
                {"type": "end", "lat": dst_lat, "lng": dst_lng}
            ],
            polyline=route_polyline,
            via_stops=[
                f"Board at {src_bus.get('stop_name', 'nearby stop')}",
                f"Bus route: {bus_route_label}",
                f"Get down at {dst_bus.get('stop_name', 'destination stop')}",
            ],
            fare_breakdown={
                "label": "PMPML bus estimate",
                "base_fare": 5.0,
                "distance_component": round(bus_distance * 2.5, 2),
                "total": fare,
            },
            provider="PMPML",
            category="public_transport",
            traffic_level=traffic.traffic_level,
            traffic_provider=traffic.provider
        )
        
        return route
    
    def _generate_metro_route(
        self,
        src_lat: float,
        src_lng: float,
        src_metro: Dict,
        dst_lat: float,
        dst_lng: float,
        dst_metro: Dict
    ) -> Optional[Route]:
        """Generate a metro-only route."""
        
        walk1 = haversine_distance(src_lat, src_lng, src_metro["stop_lat"], src_metro["stop_lon"])
        walk2 = haversine_distance(dst_metro["stop_lat"], dst_metro["stop_lon"], dst_lat, dst_lng)
        
        if walk1 > 1.0 or walk2 > 1.0:
            return None
        
        metro_distance = haversine_distance(
            src_metro["stop_lat"], src_metro["stop_lon"],
            dst_metro["stop_lat"], dst_metro["stop_lon"]
        )
        
        # Estimate duration
        walk_time = estimate_walk_duration(walk1 + walk2)
        metro_time = int((metro_distance / 25) * 60) + 5  # Assume 25 km/h average + 5 min stations
        total_duration = walk_time + metro_time
        
        # Predict fare
        features = {
            "distance_km": metro_distance,
            "duration_min": metro_time,
            "traffic_level": 0,
            "time_of_day": get_time_of_day(int(time.time()) % 86400),
            "weather": "clear",
            "vehicle_type": "metro",
            "peak_hour": is_peak_hour(int(time.time()) % 86400),
            "transfer_count": 0,
            "route_type": "metro"
        }
        # Realistic Pune Metro fare estimate (cap at 35)
        fare = float(max(10.0, min(35.0, round(10.0 + (metro_distance * 2.0), 0))))
        
        route = Route(
            id=f"metro_{src_metro['stop_id']}_{dst_metro['stop_id']}",
            modes=["walk", "metro", "walk"],
            fare=fare,
            duration_minutes=total_duration,
            walking_distance_km=walk1 + walk2,
            transfer_count=0,
            distance_km=metro_distance,
            stops=[
                {"type": "start", "lat": src_lat, "lng": src_lng},
                {"type": "metro_station", "lat": src_metro["stop_lat"], "lng": src_metro["stop_lon"], "name": src_metro.get("stop_name")},
                {"type": "metro_station", "lat": dst_metro["stop_lat"], "lng": dst_metro["stop_lon"], "name": dst_metro.get("stop_name")},
                {"type": "end", "lat": dst_lat, "lng": dst_lng}
            ],
            fare_breakdown={
                "label": "Pune Metro ticket",
                "base_fare": 10.0,
                "distance_component": round(metro_distance * 2.0, 2),
                "total": fare,
            },
            provider="Pune Metro",
            category="public_transport"
        )
        
        return route
    
    def _generate_bus_metro_route(
        self,
        src_lat: float,
        src_lng: float,
        src_bus: Dict,
        dst_lat: float,
        dst_lng: float,
        dst_metro: Dict
    ) -> Optional[Route]:
        """Generate a combined bus-metro route."""
        
        walk1 = haversine_distance(src_lat, src_lng, src_bus["stop_lat"], src_bus["stop_lon"])
        walk2 = haversine_distance(dst_metro["stop_lat"], dst_metro["stop_lon"], dst_lat, dst_lng)
        
        if walk1 > 1.0 or walk2 > 1.0:
            return None
        
        bus_metro_distance = haversine_distance(
            src_bus["stop_lat"], src_bus["stop_lon"],
            dst_metro["stop_lat"], dst_metro["stop_lon"]
        )
        
        # Estimate duration
        walk_time = estimate_walk_duration(walk1 + walk2)
        bus_time = int((bus_metro_distance / 20) * 60)
        transfer_time = 10
        total_duration = walk_time + bus_time + transfer_time + 15
        
        # Predict fare
        features = {
            "distance_km": bus_metro_distance,
            "duration_min": bus_time + 15,
            "traffic_level": 0.3,
            "time_of_day": get_time_of_day(int(time.time()) % 86400),
            "weather": "clear",
            "vehicle_type": "bus_metro",
            "peak_hour": is_peak_hour(int(time.time()) % 86400),
            "transfer_count": 1,
            "route_type": "mixed"
        }
        # Realistic combined fare: ~5 base bus + 10 base metro + 2.5/km
        fare = float(max(15.0, round(15.0 + (bus_metro_distance * 2.5), 0)))
        
        route = Route(
            id=f"busmetro_{src_bus['stop_id']}_{dst_metro['stop_id']}",
            modes=["walk", "bus", "metro", "walk"],
            fare=fare,
            duration_minutes=total_duration,
            walking_distance_km=walk1 + walk2,
            transfer_count=1,
            distance_km=bus_metro_distance,
            stops=[
                {"type": "start", "lat": src_lat, "lng": src_lng},
                {"type": "bus_stop", "lat": src_bus["stop_lat"], "lng": src_bus["stop_lon"]},
                {"type": "metro_station", "lat": dst_metro["stop_lat"], "lng": dst_metro["stop_lon"]},
                {"type": "end", "lat": dst_lat, "lng": dst_lng}
            ],
            fare_breakdown={
                "label": "Bus + Metro estimate",
                "base_fare": 15.0,
                "distance_component": round(bus_metro_distance * 2.5, 2),
                "total": fare,
            },
            provider="Mixed Transit",
            category="public_transport"
        )
        
        return route
    
    def _generate_private_provider_route(
        self,
        src_lat: float,
        src_lng: float,
        dst_lat: float,
        dst_lng: float,
        provider: Dict
    ) -> Optional[Route]:
        """Generate estimated fare route for Uber/Ola/Rapido/Auto."""
        
        traffic = self.traffic.estimate_drive(src_lat, src_lng, dst_lat, dst_lng)
        distance = traffic.distance_km
        duration = traffic.duration_minutes + provider.get("wait_minutes", 3)
        
        peak_multiplier = 1.15 if is_peak_hour(int(time.time()) % 86400) else 1.0
        traffic_multiplier = 1 + min(0.35, traffic.traffic_level * provider.get("traffic_surge", 0.25))
        surge_multiplier = round(peak_multiplier * traffic_multiplier * provider.get("surge", 1.0), 2)
        base_fare = provider["base_fare"]
        distance_component = distance * provider["per_km"]
        time_component = duration * provider["per_minute"]
        fare = (base_fare + distance_component + time_component) * surge_multiplier
        
        route = Route(
            id=f"{provider['id']}_{int(time.time())}",
            modes=[provider["id"]],
            fare=fare,
            duration_minutes=duration,
            walking_distance_km=0,
            transfer_count=0,
            distance_km=distance,
            stops=[
                {"type": "start", "lat": src_lat, "lng": src_lng},
                {"type": "end", "lat": dst_lat, "lng": dst_lng}
            ],
            polyline=traffic.polyline,
            via_stops=[
                f"{provider['name']} pickup at source",
                f"Traffic: {int(traffic.traffic_level * 100)}% delay model",
                "Drop at destination",
            ],
            fare_breakdown={
                "label": f"{provider['name']} estimate",
                "base_fare": base_fare,
                "distance_component": round(distance_component, 2),
                "time_component": round(time_component, 2),
                "surge_multiplier": surge_multiplier,
                "total": round(fare, 2),
            },
            provider=provider["name"],
            category=provider["category"],
            traffic_level=traffic.traffic_level,
            traffic_provider=traffic.provider
        )
        
        return route

    def _provider_fare_configs(self) -> List[Dict]:
        """
        Realistic Pune fare rules (2024-25).
        Sources: Rapido app, Ola/Uber Pune pricing, PMPML meter rates.
        """
        return [
            # Rapido Bike: base ₹25, ~₹5.5/km, minimal time charge
            {"id": "rapido_bike", "name": "Rapido Bike", "category": "bike_taxi",
             "base_fare": 25, "per_km": 5.5, "per_minute": 0.25,
             "wait_minutes": 3, "traffic_surge": 0.08, "surge": 1.0},
            # Auto/Rickshaw: meter rate ₹24 first 1.5km, ~₹13/km after
            {"id": "auto", "name": "Auto/Rickshaw", "category": "rickshaw",
             "base_fare": 24, "per_km": 13.0, "per_minute": 0.15,
             "wait_minutes": 2, "traffic_surge": 0.06, "surge": 1.0},
            # Ola Mini: base ₹40, ~₹10/km, ₹0.75/min
            {"id": "ola_mini", "name": "Ola Mini", "category": "cab",
             "base_fare": 40, "per_km": 10.0, "per_minute": 0.75,
             "wait_minutes": 4, "traffic_surge": 0.10, "surge": 1.0},
            # Uber Go: base ₹45, ~₹11/km, ₹0.80/min
            {"id": "uber_go", "name": "Uber Go", "category": "cab",
             "base_fare": 45, "per_km": 11.0, "per_minute": 0.80,
             "wait_minutes": 4, "traffic_surge": 0.10, "surge": 1.0},
        ]
    
    def _deduplicate_routes(self, routes: List[Route]) -> List[Route]:
        """Remove duplicate or very similar routes."""
        if not routes:
            return []
        
        unique_routes = []
        for route in routes:
            is_duplicate = False
            for existing in unique_routes:
                # Check if routes are similar (same modes, similar fare/duration)
                if (route.modes == existing.modes and
                    abs(route.fare - existing.fare) < 10 and
                    abs(route.duration_minutes - existing.duration_minutes) < 5):
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_routes.append(route)
        
        return sorted(unique_routes, key=lambda r: r.fare)

    def _matching_bus_routes(self, source_stop_id: str, dest_stop_id: str) -> List[str]:
        """Find PMPML route names that serve both stops."""
        try:
            source_routes = self.gtfs.get_routes_for_stop(source_stop_id)
            dest_routes = self.gtfs.get_routes_for_stop(dest_stop_id)
            dest_ids = {route.get("route_id") for route in dest_routes}
            matches = []
            for route in source_routes:
                if route.get("route_id") in dest_ids:
                    label = route.get("route_short_name") or route.get("route_long_name") or route.get("route_id")
                    if label:
                        matches.append(str(label))
            if matches:
                return matches
            fallback = []
            for route in source_routes[:3]:
                label = route.get("route_short_name") or route.get("route_long_name") or route.get("route_id")
                if label:
                    fallback.append(f"{label} (from boarding stop)")
            return fallback
        except Exception as exc:
            logger.warning(f"Could not resolve bus route labels: {exc}")
            return []

# Global service instance
_route_optimization_service: Optional[RouteOptimizationService] = None

def get_route_optimization_service() -> RouteOptimizationService:
    """Get or create global route optimization service."""
    global _route_optimization_service
    if _route_optimization_service is None:
        _route_optimization_service = RouteOptimizationService()
    return _route_optimization_service

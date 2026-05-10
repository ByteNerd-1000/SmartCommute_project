"""
Traffic-aware routing using OSRM (free, no API key needed).
OSRM gives real road distances and actual route polylines.
Falls back to haversine estimate if OSRM is unavailable.
"""
from __future__ import annotations

import json
import logging
import time
import urllib.parse
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import List, Tuple

from app.utils.geolocation import get_time_of_day, haversine_distance, is_peak_hour

logger = logging.getLogger(__name__)

OSRM_BASE = "http://router.project-osrm.org"


@dataclass
class TrafficEstimate:
    distance_km: float
    duration_minutes: int
    traffic_level: float
    provider: str
    polyline: List[Tuple[float, float]]


def _decode_geojson_coords(coords: list) -> List[Tuple[float, float]]:
    """Convert GeoJSON [lng, lat] coords to (lat, lng) tuples."""
    return [(lat, lng) for lng, lat in coords]


def _time_based_traffic() -> float:
    """Estimate traffic level from time of day (0=clear, 1=heavy)."""
    now = int(time.time()) % 86400
    if is_peak_hour(now):
        return 0.75
    period = get_time_of_day(now)
    return {"morning": 0.5, "afternoon": 0.35, "evening": 0.65, "night": 0.15}.get(period, 0.4)


class TrafficRoutingService:
    def estimate_drive(
        self,
        src_lat: float,
        src_lng: float,
        dst_lat: float,
        dst_lng: float,
    ) -> TrafficEstimate:
        """Get real road distance + polyline via OSRM."""
        osrm = self._osrm(src_lat, src_lng, dst_lat, dst_lng)
        if osrm:
            return osrm
        return self._fallback(src_lat, src_lng, dst_lat, dst_lng)

    def _osrm(
        self,
        src_lat: float,
        src_lng: float,
        dst_lat: float,
        dst_lng: float,
    ) -> TrafficEstimate | None:
        """
        Call the public OSRM API for real road routing.
        Returns actual road distance, duration, and polyline.
        """
        coords = f"{src_lng},{src_lat};{dst_lng},{dst_lat}"
        params = urllib.parse.urlencode({
            "overview": "full",
            "geometries": "geojson",
            "steps": "false",
        })
        url = f"{OSRM_BASE}/route/v1/driving/{coords}?{params}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "SmartCommute/1.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            if data.get("code") != "Ok" or not data.get("routes"):
                return None

            route = data["routes"][0]
            distance_km = round(route["distance"] / 1000, 2)
            # OSRM duration is free-flow; apply time-based traffic factor
            traffic = _time_based_traffic()
            traffic_factor = 1 + (traffic * 0.4)  # up to 40% slower in traffic
            free_flow_min = max(1, round(route["duration"] / 60))
            duration_min = max(1, round(free_flow_min * traffic_factor))

            coords_list = route["geometry"]["coordinates"]
            polyline = _decode_geojson_coords(coords_list)

            logger.info(
                f"OSRM: {distance_km}km, {duration_min}min, traffic={traffic:.2f}, {len(polyline)} pts"
            )
            return TrafficEstimate(
                distance_km=distance_km,
                duration_minutes=duration_min,
                traffic_level=round(traffic, 2),
                provider="osrm",
                polyline=polyline,
            )
        except Exception as exc:
            logger.warning(f"OSRM unavailable: {exc}")
            return None

    def _fallback(self, src_lat: float, src_lng: float, dst_lat: float, dst_lng: float) -> TrafficEstimate:
        """Haversine-based fallback when OSRM is unavailable."""
        direct = haversine_distance(src_lat, src_lng, dst_lat, dst_lng)
        road_distance = direct * 1.25  # road is ~25% longer than straight line
        traffic = _time_based_traffic()
        now = int(time.time()) % 86400
        period = get_time_of_day(now)
        base_speed = {"morning": 19, "afternoon": 24, "evening": 17, "night": 30}.get(period, 22)
        duration = max(1, round((road_distance / base_speed) * 60))
        return TrafficEstimate(
            distance_km=round(road_distance, 2),
            duration_minutes=duration,
            traffic_level=traffic,
            provider="fallback_haversine",
            polyline=[(src_lat, src_lng), (dst_lat, dst_lng)],
        )


_traffic_service: TrafficRoutingService | None = None


def get_traffic_routing_service() -> TrafficRoutingService:
    global _traffic_service
    if _traffic_service is None:
        _traffic_service = TrafficRoutingService()
    return _traffic_service

"""
Place search and geocoding using Nominatim (OpenStreetMap).
Completely free, no API key needed.
Falls back to local bus stop / landmark search.
"""
from __future__ import annotations

import json
import logging
import urllib.parse
import urllib.request
from typing import Dict, List, Optional

from app.config import PUNE_CENTER_LAT, PUNE_CENTER_LNG

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_HEADERS = {"User-Agent": "SmartCommute/1.0 (pune-commute-app)"}

# Pune bounding box for restricting search
PUNE_VIEWBOX = "73.6,18.3,74.3,18.8"

PUNE_LANDMARKS = [
    {"name": "Pune Railway Station", "lat": 18.5289, "lng": 73.8744, "type": "landmark"},
    {"name": "Pune Station Jayprakash Stand", "lat": 18.5285, "lng": 73.8742, "type": "bus_stop"},
    {"name": "Shivajinagar", "lat": 18.5308, "lng": 73.8475, "type": "area"},
    {"name": "Hadapsar", "lat": 18.5089, "lng": 73.9259, "type": "area"},
    {"name": "Wagholi", "lat": 18.5807, "lng": 73.9821, "type": "area"},
    {"name": "Viman Nagar", "lat": 18.5679, "lng": 73.9143, "type": "area"},
    {"name": "Kothrud", "lat": 18.5074, "lng": 73.8077, "type": "area"},
    {"name": "Katraj", "lat": 18.4529, "lng": 73.8652, "type": "area"},
    {"name": "Hinjewadi Phase 1", "lat": 18.5913, "lng": 73.7389, "type": "area"},
    {"name": "Hinjewadi Phase 2", "lat": 18.5988, "lng": 73.7265, "type": "area"},
    {"name": "Hinjewadi Phase 3", "lat": 18.6078, "lng": 73.7142, "type": "area"},
    {"name": "COEP Technological University", "lat": 18.5294, "lng": 73.8566, "type": "landmark"},
    {"name": "Phoenix Marketcity Pune", "lat": 18.5621, "lng": 73.9167, "type": "landmark"},
    {"name": "Swargate", "lat": 18.5018, "lng": 73.8636, "type": "area"},
    {"name": "Kharadi", "lat": 18.5515, "lng": 73.9346, "type": "area"},
    {"name": "Magarpatta City", "lat": 18.5162, "lng": 73.9285, "type": "area"},
    {"name": "Baner", "lat": 18.5590, "lng": 73.7868, "type": "area"},
    {"name": "Aundh", "lat": 18.5590, "lng": 73.8075, "type": "area"},
    {"name": "Wakad", "lat": 18.5986, "lng": 73.7617, "type": "area"},
    {"name": "Pimpri", "lat": 18.6280, "lng": 73.7973, "type": "area"},
    {"name": "Chinchwad", "lat": 18.6482, "lng": 73.8089, "type": "area"},
    {"name": "Nigdi", "lat": 18.6590, "lng": 73.7706, "type": "area"},
    {"name": "Deccan Gymkhana", "lat": 18.5167, "lng": 73.8440, "type": "area"},
    {"name": "FC Road (Fergusson College Road)", "lat": 18.5185, "lng": 73.8423, "type": "landmark"},
    {"name": "Camp (Cantonment)", "lat": 18.5167, "lng": 73.8803, "type": "area"},
    {"name": "Kondhwa", "lat": 18.4761, "lng": 73.8937, "type": "area"},
    {"name": "Yerawada", "lat": 18.5460, "lng": 73.8928, "type": "area"},
    {"name": "Kalyani Nagar", "lat": 18.5461, "lng": 73.9033, "type": "area"},
    {"name": "Koregaon Park", "lat": 18.5362, "lng": 73.8929, "type": "area"},
    {"name": "Boat Club Road", "lat": 18.5362, "lng": 73.8706, "type": "landmark"},
    {"name": "Pune Airport (Lohegaon)", "lat": 18.5821, "lng": 73.9197, "type": "landmark"},
    {"name": "Bhosari", "lat": 18.6395, "lng": 73.8460, "type": "area"},
    {"name": "Tathawade", "lat": 18.6162, "lng": 73.7711, "type": "area"},
    {"name": "Vishrantwadi", "lat": 18.5691, "lng": 73.8987, "type": "area"},
    {"name": "Mundhwa", "lat": 18.5226, "lng": 73.9214, "type": "area"},
    {"name": "Bibwewadi", "lat": 18.4760, "lng": 73.8631, "type": "area"},
    {"name": "Warje", "lat": 18.4838, "lng": 73.8063, "type": "area"},
    {"name": "Salisbury Park", "lat": 18.5004, "lng": 73.8758, "type": "area"},
    {"name": "Dhanori", "lat": 18.5853, "lng": 73.9254, "type": "area"},
    {"name": "Lohegaon", "lat": 18.5897, "lng": 73.9109, "type": "area"},
]


class GeocodingService:
    def search(self, query: str, limit: int = 8) -> List[Dict]:
        query = query.strip()
        if not query:
            return []

        # First try Nominatim for real results
        results = self._nominatim_search(query, limit)
        if results:
            return results[:limit]

        # Fall back to local search
        return self._local_search(query, limit)

    def geocode(self, query: str) -> Optional[Dict]:
        results = self.search(query, 1)
        return results[0] if results else None

    def _nominatim_search(self, query: str, limit: int) -> List[Dict]:
        """Search using Nominatim (OpenStreetMap) - free, no API key."""
        try:
            # First try with viewbox restricted to Pune
            params = urllib.parse.urlencode({
                "q": f"{query}, Pune, Maharashtra",
                "format": "json",
                "limit": min(limit + 5, 15),
                "countrycodes": "in",
                "viewbox": PUNE_VIEWBOX,
                "bounded": 0,  # Don't hard-bound so we get results even near edges
                "addressdetails": 1,
                "dedupe": 1,
            })
            url = f"{NOMINATIM_URL}?{params}"
            req = urllib.request.Request(url, headers=NOMINATIM_HEADERS)
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            results = []
            for item in data:
                lat = float(item["lat"])
                lng = float(item["lon"])
                # Keep only results within wider Pune metro area
                if not (18.2 <= lat <= 18.85 and 73.5 <= lng <= 74.4):
                    continue
                display = item.get("display_name", query)
                address = item.get("address", {})
                # Build a clean short name
                parts = []
                for key in ["amenity", "road", "neighbourhood", "suburb", "city_district", "town", "city"]:
                    val = address.get(key)
                    if val and val not in parts:
                        parts.append(val)
                    if len(parts) >= 3:
                        break
                short_name = ", ".join(parts) if parts else ", ".join(display.split(", ")[:3])
                results.append({
                    "name": short_name,
                    "lat": lat,
                    "lng": lng,
                    "type": item.get("type", "place"),
                })

            # Deduplicate by proximity (within ~200m)
            deduped = []
            for r in results:
                is_dup = any(
                    abs(r["lat"] - e["lat"]) < 0.002 and abs(r["lng"] - e["lng"]) < 0.002
                    for e in deduped
                )
                if not is_dup:
                    deduped.append(r)

            if deduped:
                logger.info(f"Nominatim found {len(deduped)} results for '{query}'")
            return deduped[:limit]
        except Exception as exc:
            logger.warning(f"Nominatim search failed: {exc}")
            return []

    def _local_search(self, query: str, limit: int) -> List[Dict]:
        """Search local landmarks + bus stops as offline fallback."""
        needle = query.lower()
        results = []

        for landmark in PUNE_LANDMARKS:
            if needle in landmark["name"].lower():
                results.append(landmark)

        try:
            from app.transit.gtfs_parser import get_gtfs_parser
            gtfs = get_gtfs_parser()
            for stop in gtfs.get_all_stops():
                if needle in str(stop.get("stop_name", "")).lower():
                    results.append({
                        "name": stop.get("stop_name"),
                        "lat": stop.get("stop_lat"),
                        "lng": stop.get("stop_lon"),
                        "type": "bus_stop",
                    })
                    if len(results) >= limit:
                        return results[:limit]
        except Exception:
            pass

        try:
            from app.transit.metro_parser import get_metro_parser
            metro = get_metro_parser()
            for station in metro.get_all_stops():
                if needle in str(station.get("stop_name", "")).lower():
                    results.append({
                        "name": station.get("stop_name"),
                        "lat": station.get("stop_lat"),
                        "lng": station.get("stop_lon"),
                        "type": "metro_station",
                    })
        except Exception:
            pass

        if not results:
            results.append({
                "name": f"{query}, Pune",
                "lat": PUNE_CENTER_LAT,
                "lng": PUNE_CENTER_LNG,
                "type": "fallback",
            })

        return results[:limit]


_geocoding_service: GeocodingService | None = None


def get_geocoding_service() -> GeocodingService:
    global _geocoding_service
    if _geocoding_service is None:
        _geocoding_service = GeocodingService()
    return _geocoding_service

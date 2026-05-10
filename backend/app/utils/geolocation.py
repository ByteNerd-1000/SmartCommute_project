"""
Utility functions for SmartCommute.
Includes geolocation, distance calculations, and common helpers.
"""
import math
from typing import Tuple, List
from math import radians, cos, sin, asin, sqrt
from datetime import datetime
import hashlib

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points on Earth using Haversine formula.
    Returns distance in kilometers.
    """
    R = 6371  # Earth's radius in km
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    
    return R * c

def manhattan_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Manhattan distance approximation in kilometers."""
    lat_dist = haversine_distance(lat1, lon1, lat1, lon2)
    lon_dist = haversine_distance(lat1, lon1, lat2, lon1)
    return lat_dist + lon_dist

def estimate_walk_duration(distance_km: float, speed_kmh: float = 5.0) -> int:
    """Estimate walking duration in minutes."""
    return int((distance_km / speed_kmh) * 60)

def estimate_walk_duration_from_meters(distance_m: float, speed_kmh: float = 5.0) -> int:
    """Estimate walking duration in minutes from meters."""
    return estimate_walk_duration(distance_m / 1000, speed_kmh)

def time_to_seconds(time_str: str) -> int:
    """Convert HH:MM:SS string to seconds."""
    try:
        parts = time_str.split(':')
        hours = int(parts[0])
        minutes = int(parts[1])
        seconds = int(parts[2]) if len(parts) > 2 else 0
        return hours * 3600 + minutes * 60 + seconds
    except (ValueError, IndexError):
        return 0

def seconds_to_time(seconds: int) -> str:
    """Convert seconds to HH:MM:SS string."""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def is_peak_hour(time_seconds: int) -> bool:
    """Determine if time is peak hour (7-10 AM or 5-8 PM) and it is a weekday."""
    hours = time_seconds // 3600
    is_weekend = datetime.now().weekday() >= 5 # 5=Sat, 6=Sun
    if is_weekend:
        return False
    return (7 <= hours <= 10) or (17 <= hours <= 20)

def get_time_of_day(time_seconds: int) -> str:
    """Get time period category."""
    hours = time_seconds // 3600
    if 5 <= hours < 12:
        return "morning"
    elif 12 <= hours < 17:
        return "afternoon"
    elif 17 <= hours < 21:
        return "evening"
    else:
        return "night"

def generate_hash(source: Tuple[float, float], dest: Tuple[float, float]) -> str:
    """Generate hash for source-destination pair for caching."""
    key = f"{source[0]:.4f},{source[1]:.4f},{dest[0]:.4f},{dest[1]:.4f}"
    return hashlib.md5(key.encode()).hexdigest()

def normalize_location_name(name: str) -> str:
    """Normalize location names for matching."""
    return name.lower().strip()

def degrees_to_kilometers(degrees: float) -> float:
    """Rough conversion of degree distance to km."""
    return degrees * 111.32

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate bearing between two points (0-360 degrees)."""
    dL = radians(lon2 - lon1)
    y = sin(dL) * cos(radians(lat2))
    x = cos(radians(lat1)) * sin(radians(lat2)) - sin(radians(lat1)) * cos(radians(lat2)) * cos(dL)
    bearing = math.atan2(y, x)
    return (math.degrees(bearing) + 360) % 360

def is_within_radius(lat1: float, lon1: float, lat2: float, lon2: float, radius_km: float) -> bool:
    """Check if a point is within radius of another."""
    distance = haversine_distance(lat1, lon1, lat2, lon2)
    return distance <= radius_km

class CoordinateBounds:
    """Represent geographic bounds."""
    def __init__(self, min_lat: float, min_lng: float, max_lat: float, max_lng: float):
        self.min_lat = min_lat
        self.min_lng = min_lng
        self.max_lat = max_lat
        self.max_lng = max_lng
    
    def contains(self, lat: float, lng: float) -> bool:
        """Check if point is within bounds."""
        return (self.min_lat <= lat <= self.max_lat and 
                self.min_lng <= lng <= self.max_lng)
    
    def center(self) -> Tuple[float, float]:
        """Get center of bounds."""
        return (
            (self.min_lat + self.max_lat) / 2,
            (self.min_lng + self.max_lng) / 2
        )

# Pune city bounds (approximate)
PUNE_BOUNDS = CoordinateBounds(18.4, 73.7, 18.65, 74.0)

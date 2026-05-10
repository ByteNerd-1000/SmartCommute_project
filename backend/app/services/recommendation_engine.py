"""
Recommendation engine for multimodal route suggestions.
Generates intelligent route recommendations based on various factors.
"""
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import math
from app.ml.fare_predictor import get_fare_model

@dataclass
class Route:
    """Represents a complete route option."""
    id: str
    modes: List[str]  # ["walk", "bus", "metro", "walk"]
    fare: float
    duration_minutes: int
    walking_distance_km: float
    transfer_count: int
    distance_km: float
    stops: List[Dict]
    polyline: Optional[List[Tuple[float, float]]] = None
    via_stops: Optional[List[str]] = None
    traffic_level: float = 0.0
    traffic_provider: str = "static"
    fare_breakdown: Optional[Dict] = None
    provider: Optional[str] = None
    category: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "modes": self.modes,
            "fare": round(self.fare, 2),
            "duration_minutes": self.duration_minutes,
            "walking_distance_km": round(self.walking_distance_km, 2),
            "transfer_count": self.transfer_count,
            "distance_km": round(self.distance_km, 2),
            "stops": self.stops,
            "polyline": self.polyline,
            "via_stops": self.via_stops,
            "traffic_level": round(self.traffic_level, 2),
            "traffic_provider": self.traffic_provider,
            "fare_breakdown": self.fare_breakdown,
            "provider": self.provider,
            "category": self.category,
        }

@dataclass
class RecommendationScore:
    """Scoring for a route recommendation."""
    overall: float
    cheapness: float
    speed: float
    comfort: float
    eco_friendliness: float
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "overall": round(self.overall, 2),
            "cheapness": round(self.cheapness, 2),
            "speed": round(self.speed, 2),
            "comfort": round(self.comfort, 2),
            "eco_friendliness": round(self.eco_friendliness, 2),
        }

class RecommendationEngine:
    """Engine for generating route recommendations."""
    
    def __init__(self):
        self.fare_model = get_fare_model()
        
        # Mode weights for scoring
        self.eco_score = {
            "walk": 1.0,
            "metro": 0.9,
            "bus": 0.8,
            "rapido_bike": 0.45,
            "auto": 0.35,
            "ola_mini": 0.3,
            "uber_go": 0.3,
            "ride": 0.3
        }
        
        self.comfort_score = {
            "walk": 0.5,
            "metro": 0.9,
            "bus": 0.7,
            "rapido_bike": 0.75,
            "auto": 0.8,
            "ola_mini": 0.95,
            "uber_go": 1.0,
            "ride": 1.0
        }
    
    def generate_recommendations(
        self,
        routes: List[Route],
        source_coords: Tuple[float, float],
        dest_coords: Tuple[float, float]
    ) -> Dict[str, any]:
        """Generate comprehensive recommendations from route options."""
        
        if not routes:
            return {
                "best_overall": None,
                "cheapest": None,
                "fastest": None,
                "eco_friendly": None,
                "comfort": None,
                "all_scored": []
            }
        
        # Score all routes
        scored_routes = []
        for route in routes:
            score = self._calculate_score(route)
            scored_routes.append({
                "route": route,
                "score": score
            })
        
        # Find top picks
        best_overall = max(scored_routes, key=lambda x: x["score"].overall)
        cheapest = min(scored_routes, key=lambda x: x["route"].fare)
        fastest = min(scored_routes, key=lambda x: x["route"].duration_minutes)
        eco_friendly = max(scored_routes, key=lambda x: x["score"].eco_friendliness)
        comfort = max(scored_routes, key=lambda x: x["score"].comfort)
        
        return {
            "best_overall": {
                "route": best_overall["route"].to_dict(),
                "score": best_overall["score"].to_dict(),
                "recommendation_type": "BEST_OVERALL",
                "reason": self._get_recommendation_reason(best_overall["route"], "overall")
            },
            "cheapest": {
                "route": cheapest["route"].to_dict(),
                "score": self._calculate_score(cheapest["route"]).to_dict(),
                "recommendation_type": "CHEAPEST",
                "reason": f"Lowest fare at ₹{cheapest['route'].fare:.0f}"
            },
            "fastest": {
                "route": fastest["route"].to_dict(),
                "score": self._calculate_score(fastest["route"]).to_dict(),
                "recommendation_type": "FASTEST",
                "reason": f"Quickest option at {fastest['route'].duration_minutes} minutes"
            },
            "eco_friendly": {
                "route": eco_friendly["route"].to_dict(),
                "score": eco_friendly["score"].to_dict(),
                "recommendation_type": "ECO_FRIENDLY",
                "reason": "Environmentally conscious choice"
            },
            "comfort": {
                "route": comfort["route"].to_dict(),
                "score": comfort["score"].to_dict(),
                "recommendation_type": "COMFORT",
                "reason": "Least walking and transfers"
            },
            "all_scored": [
                {
                    "route": r["route"].to_dict(),
                    "score": r["score"].to_dict()
                }
                for r in scored_routes
            ]
        }
    
    def _calculate_score(self, route: Route) -> RecommendationScore:
        """Calculate multi-dimensional score for a route."""
        
        # Normalize metrics (0-100 scale)
        cheapness = self._score_cheapness(route)
        speed = self._score_speed(route)
        comfort = self._score_comfort(route)
        eco = self._score_eco_friendliness(route)
        
        # Calculate overall score (weighted average)
        overall = (
            cheapness * 0.25 +
            speed * 0.30 +
            comfort * 0.25 +
            eco * 0.20
        )
        
        return RecommendationScore(
            overall=overall,
            cheapness=cheapness,
            speed=speed,
            comfort=comfort,
            eco_friendliness=eco
        )
    
    def _score_cheapness(self, route: Route) -> float:
        """Score route based on fare (lower is better)."""
        # Assume typical fare range 10-200 INR
        MIN_FARE = 10
        MAX_FARE = 200
        
        normalized_fare = max(MIN_FARE, min(route.fare, MAX_FARE))
        score = ((MAX_FARE - normalized_fare) / (MAX_FARE - MIN_FARE)) * 100
        
        return max(0, min(100, score))
    
    def _score_speed(self, route: Route) -> float:
        """Score route based on duration (lower is better)."""
        # Assume typical duration range 15-120 minutes
        MIN_DURATION = 15
        MAX_DURATION = 120
        
        normalized_duration = max(MIN_DURATION, min(route.duration_minutes, MAX_DURATION))
        score = ((MAX_DURATION - normalized_duration) / (MAX_DURATION - MIN_DURATION)) * 100
        
        return max(0, min(100, score))
    
    def _score_comfort(self, route: Route) -> float:
        """Score route based on comfort factors."""
        # Factors: transfer count, walking distance
        comfort = 100
        
        # Penalize transfers (each transfer reduces comfort by 15 points)
        comfort -= route.transfer_count * 15
        
        # Penalize walking (each 0.5 km walking reduces comfort by 5 points)
        comfort -= (route.walking_distance_km / 0.5) * 5
        
        # Penalize mode transitions
        transfer_penalty = (len(route.modes) - 1) * 10
        comfort -= transfer_penalty
        
        return max(0, min(100, comfort))
    
    def _score_eco_friendliness(self, route: Route) -> float:
        """Score route based on environmental impact."""
        score = 0
        mode_count = len(route.modes)
        
        for mode in route.modes:
            score += self.eco_score.get(mode, 0.5) * (100 / mode_count)
        
        # Bonus for walking
        walking_distance = route.walking_distance_km
        walking_bonus = min(walking_distance * 5, 20)
        score += walking_bonus
        
        # Penalty for rides
        if "ride" in route.modes:
            score -= 20
        
        return max(0, min(100, score))
    
    def _get_recommendation_reason(self, route: Route, recommendation_type: str) -> str:
        """Generate human-readable reason for recommendation."""
        modes_str = " → ".join(route.modes)
        
        if recommendation_type == "overall":
            return f"Best balance of fare (₹{route.fare:.0f}) and time ({route.duration_minutes} min) with {modes_str}"
        
        return f"Route: {modes_str}"
    
    def compare_routes(self, routes: List[Route]) -> Dict:
        """Generate comparison matrix for routes."""
        if not routes:
            return {}
        
        comparison = {
            "routes": [],
            "cheapest_fare": min(r.fare for r in routes),
            "most_expensive_fare": max(r.fare for r in routes),
            "fastest_duration": min(r.duration_minutes for r in routes),
            "slowest_duration": max(r.duration_minutes for r in routes),
            "avg_transfers": sum(r.transfer_count for r in routes) / len(routes),
            "avg_walking": sum(r.walking_distance_km for r in routes) / len(routes)
        }
        
        for route in routes:
            comparison["routes"].append({
                "id": route.id,
                "modes": route.modes,
                "fare": route.fare,
                "duration": route.duration_minutes,
                "walking": route.walking_distance_km,
                "transfers": route.transfer_count,
                "score": self._calculate_score(route).to_dict()
            })
        
        return comparison

# Global recommendation engine instance
_recommendation_engine: Optional[RecommendationEngine] = None

def get_recommendation_engine() -> RecommendationEngine:
    """Get or create global recommendation engine."""
    global _recommendation_engine
    if _recommendation_engine is None:
        _recommendation_engine = RecommendationEngine()
    return _recommendation_engine

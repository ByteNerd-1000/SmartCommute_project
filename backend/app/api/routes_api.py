"""
API routes for SmartCommute.
Defines all HTTP endpoints for the application.
"""
from fastapi import APIRouter, Query, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging
import json
from datetime import datetime, timedelta
from app.services.route_optimization import get_route_optimization_service
from app.services.geocoding import get_geocoding_service
from app.transit.gtfs_parser import get_gtfs_parser
from app.transit.metro_parser import get_metro_parser
from app.ml.fare_predictor import get_fare_model
from app.database import get_db
from app.utils.geolocation import generate_hash

logger = logging.getLogger(__name__)
router = APIRouter()

# Request/Response Models
class LocationInput(BaseModel):
    """Location input for route planning."""
    latitude: float
    longitude: float
    name: Optional[str] = None

class RouteSearchRequest(BaseModel):
    """Request body for route search."""
    source: LocationInput
    destination: LocationInput
    max_options: Optional[int] = 5

class FarePredictionRequest(BaseModel):
    """Request for fare prediction."""
    distance_km: float
    duration_min: int
    traffic_level: float
    time_of_day: str
    weather: str
    vehicle_type: str
    peak_hour: bool
    transfer_count: int
    route_type: str

class NearestTransitRequest(BaseModel):
    """Request for nearest transit points."""
    latitude: float
    longitude: float
    radius_km: Optional[float] = 1.0

class SavedRouteRequest(BaseModel):
    """Request for saving a route."""
    name: str
    source: LocationInput
    destination: LocationInput
    route_data: dict
    is_favorite: Optional[bool] = False

@router.get("/locations/search")
async def search_locations(q: str = Query(..., min_length=1), limit: int = Query(8, ge=1, le=20)):
    """Search real places/landmarks/stops for source/destination input."""
    try:
        return {"results": get_geocoding_service().search(q, limit)}
    except Exception as e:
        logger.error(f"Error searching locations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/locations/geocode")
async def geocode_location(q: str = Query(..., min_length=1)):
    """Resolve one typed location to coordinates."""
    try:
        result = get_geocoding_service().geocode(q)
        if not result:
            raise HTTPException(status_code=404, detail="Location not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error geocoding location: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Routes API
@router.post("/routes/search")
async def search_routes(request: RouteSearchRequest, db = Depends(get_db)):
    """
    Search for multimodal routes between two locations.
    
    Args:
        request: Route search request with source and destination
    
    Returns:
        List of route options with recommendations
    """
    try:
        from app.database.models import CachedRecommendation, RouteHistory

        cache_key = f"v4:{generate_hash((request.source.latitude, request.source.longitude), (request.destination.latitude, request.destination.longitude))}:{request.max_options or 5}"
        cached = db.query(CachedRecommendation).filter(
            CachedRecommendation.source_hash == cache_key
        ).first()
        if cached and cached.expires_at > datetime.utcnow():
            return json.loads(cached.recommendations_data)

        route_service = get_route_optimization_service()
        
        result = route_service.plan_routes(
            source_lat=request.source.latitude,
            source_lng=request.source.longitude,
            dest_lat=request.destination.latitude,
            dest_lng=request.destination.longitude,
            max_options=request.max_options or 5
        )

        routes = result.get("routes", [])
        if routes:
            try:
                selected_route = routes[0]
                selected_mode = next(
                    (mode for mode in selected_route.get("modes", []) if mode != "walk"),
                    selected_route.get("modes", ["walk"])[0] if selected_route.get("modes") else "unknown"
                )
                db.add(RouteHistory(
                    source_lat=request.source.latitude,
                    source_lng=request.source.longitude,
                    dest_lat=request.destination.latitude,
                    dest_lng=request.destination.longitude,
                    source_name=request.source.name,
                    dest_name=request.destination.name,
                    selected_route_id=selected_route.get("id"),
                    selected_mode=selected_mode,
                    estimated_fare=selected_route.get("fare"),
                    estimated_duration=selected_route.get("duration_minutes"),
                ))
                expires_at = datetime.utcnow() + timedelta(minutes=15)
                dest_hash = generate_hash(
                    (request.destination.latitude, request.destination.longitude),
                    (request.source.latitude, request.source.longitude)
                )
                if cached:
                    cached.dest_hash = dest_hash
                    cached.recommendations_data = json.dumps(result)
                    cached.expires_at = expires_at
                else:
                    db.add(CachedRecommendation(
                        source_hash=cache_key,
                        dest_hash=dest_hash,
                        recommendations_data=json.dumps(result),
                        expires_at=expires_at,
                    ))
                db.commit()
            except Exception as analytics_error:
                db.rollback()
                logger.warning(f"Could not save route history: {analytics_error}")
        
        return result
    
    except Exception as e:
        logger.error(f"Error searching routes: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/routes/compare")
async def compare_routes(
    route_ids: List[str] = Query(...),
    db = Depends(get_db)
):
    """
    Compare multiple routes.
    
    Args:
        route_ids: List of route IDs to compare
    
    Returns:
        Comparison matrix
    """
    try:
        from app.database.models import CachedRecommendation
        from app.services.recommendation_engine import Route, get_recommendation_engine

        cached_rows = db.query(CachedRecommendation).filter(
            CachedRecommendation.expires_at > datetime.utcnow()
        ).all()
        found = {}
        for row in cached_rows:
            data = json.loads(row.recommendations_data)
            for route in data.get("routes", []):
                if route.get("id") in route_ids:
                    found[route["id"]] = route

        routes = [
            Route(
                id=r["id"],
                modes=r["modes"],
                fare=r["fare"],
                duration_minutes=r["duration_minutes"],
                walking_distance_km=r["walking_distance_km"],
                transfer_count=r["transfer_count"],
                distance_km=r["distance_km"],
                stops=r.get("stops", []),
                polyline=r.get("polyline"),
                via_stops=r.get("via_stops"),
                traffic_level=r.get("traffic_level", 0),
                traffic_provider=r.get("traffic_provider", "cache"),
                fare_breakdown=r.get("fare_breakdown"),
                provider=r.get("provider"),
                category=r.get("category"),
            )
            for r in found.values()
        ]
        return {
            "requested_route_ids": route_ids,
            "found_route_ids": list(found.keys()),
            "comparison": get_recommendation_engine().compare_routes(routes),
        }
    except Exception as e:
        logger.error(f"Error comparing routes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Fare Prediction API
@router.post("/fare/predict")
async def predict_fare(request: FarePredictionRequest):
    """
    Predict fare for given parameters.
    
    Args:
        request: Fare prediction parameters
    
    Returns:
        Predicted fare amount
    """
    try:
        fare_model = get_fare_model()
        
        features = {
            "distance_km": request.distance_km,
            "duration_min": request.duration_min,
            "traffic_level": request.traffic_level,
            "time_of_day": request.time_of_day,
            "weather": request.weather,
            "vehicle_type": request.vehicle_type,
            "peak_hour": request.peak_hour,
            "transfer_count": request.transfer_count,
            "route_type": request.route_type
        }
        
        fare = fare_model.predict(features)
        
        return {
            "predicted_fare": round(fare, 2),
            "currency": "INR"
        }
    
    except Exception as e:
        logger.error(f"Error predicting fare: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Transit Data API
@router.get("/transit/bus-stops")
async def get_bus_stops(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius_km: float = Query(1.0, ge=0.1, le=5.0)
):
    """
    Get nearby bus stops.
    
    Args:
        latitude: Center latitude
        longitude: Center longitude
        radius_km: Search radius in kilometers
    
    Returns:
        List of nearby bus stops
    """
    try:
        gtfs = get_gtfs_parser()
        stops = gtfs.get_stops_near_location(latitude, longitude, radius_km)
        
        return {
            "stops": stops,
            "count": len(stops),
            "center": {"lat": latitude, "lng": longitude},
            "radius_km": radius_km
        }
    
    except Exception as e:
        logger.error(f"Error getting bus stops: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transit/metro-stations")
async def get_metro_stations(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius_km: float = Query(1.0, ge=0.1, le=5.0)
):
    """
    Get nearby metro stations.
    
    Args:
        latitude: Center latitude
        longitude: Center longitude
        radius_km: Search radius in kilometers
    
    Returns:
        List of nearby metro stations
    """
    try:
        metro = get_metro_parser()
        stations = metro.get_stops_near_location(latitude, longitude, radius_km)
        
        return {
            "stations": stations,
            "count": len(stations),
            "center": {"lat": latitude, "lng": longitude},
            "radius_km": radius_km
        }
    
    except Exception as e:
        logger.error(f"Error getting metro stations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transit/all-bus-stops")
async def get_all_bus_stops():
    """
    Get all bus stops (useful for map visualization).
    
    Returns:
        List of all bus stops
    """
    try:
        gtfs = get_gtfs_parser()
        stops = gtfs.get_all_stops()
        
        return {
            "stops": stops,
            "count": len(stops)
        }
    
    except Exception as e:
        logger.error(f"Error getting all bus stops: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transit/all-metro-stations")
async def get_all_metro_stations():
    """
    Get all metro stations (useful for map visualization).
    
    Returns:
        List of all metro stations
    """
    try:
        metro = get_metro_parser()
        stations = metro.get_all_stops()
        
        return {
            "stations": stations,
            "count": len(stations)
        }
    
    except Exception as e:
        logger.error(f"Error getting all metro stations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transit/interchanges")
async def get_interchange_stations():
    """
    Get metro interchange stations.
    
    Returns:
        List of interchange stations
    """
    try:
        metro = get_metro_parser()
        interchanges = metro.get_interchange_stations()
        
        return {
            "interchanges": interchanges,
            "count": len(interchanges)
        }
    
    except Exception as e:
        logger.error(f"Error getting interchanges: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Saved Routes / History API
@router.get("/history/routes")
async def get_route_history(limit: int = Query(50, ge=1, le=200), db = Depends(get_db)):
    """Get recent route searches."""
    try:
        from app.database.models import RouteHistory

        rows = db.query(RouteHistory).order_by(RouteHistory.timestamp.desc()).limit(limit).all()
        return {
            "history": [
                {
                    "id": row.id,
                    "source": {"lat": row.source_lat, "lng": row.source_lng, "name": row.source_name},
                    "destination": {"lat": row.dest_lat, "lng": row.dest_lng, "name": row.dest_name},
                    "selected_route_id": row.selected_route_id,
                    "selected_mode": row.selected_mode,
                    "estimated_fare": row.estimated_fare,
                    "estimated_duration": row.estimated_duration,
                    "timestamp": row.timestamp.isoformat(),
                }
                for row in rows
            ],
            "count": len(rows),
        }
    except Exception as e:
        logger.error(f"Error getting route history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/saved-routes")
async def save_route(request: SavedRouteRequest, db = Depends(get_db)):
    """Persist a named saved route."""
    try:
        from app.database.models import SavedRoute

        saved = SavedRoute(
            source_lat=request.source.latitude,
            source_lng=request.source.longitude,
            dest_lat=request.destination.latitude,
            dest_lng=request.destination.longitude,
            name=request.name,
            route_data=json.dumps(request.route_data),
            is_favorite=bool(request.is_favorite),
        )
        db.add(saved)
        db.commit()
        db.refresh(saved)
        return {"id": saved.id, "status": "saved"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/saved-routes")
async def get_saved_routes(db = Depends(get_db)):
    """List saved routes."""
    try:
        from app.database.models import SavedRoute

        rows = db.query(SavedRoute).order_by(SavedRoute.created_at.desc()).all()
        return {
            "routes": [
                {
                    "id": row.id,
                    "name": row.name,
                    "source": {"lat": row.source_lat, "lng": row.source_lng},
                    "destination": {"lat": row.dest_lat, "lng": row.dest_lng},
                    "route_data": json.loads(row.route_data or "{}"),
                    "created_at": row.created_at.isoformat(),
                    "is_favorite": row.is_favorite,
                }
                for row in rows
            ],
            "count": len(rows),
        }
    except Exception as e:
        logger.error(f"Error getting saved routes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/saved-routes/{route_id}")
async def delete_saved_route(route_id: int, db = Depends(get_db)):
    """Delete a saved route."""
    try:
        from app.database.models import SavedRoute

        row = db.query(SavedRoute).filter(SavedRoute.id == route_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="Saved route not found")
        db.delete(row)
        db.commit()
        return {"status": "deleted", "id": route_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting saved route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Analytics API
@router.get("/analytics/summary")
async def get_analytics_summary(db = Depends(get_db)):
    """
    Get commute analytics summary.
    
    Returns:
        Analytics statistics
    """
    try:
        from app.database.models import RouteHistory
        from sqlalchemy import func
        
        # Get today's statistics
        today = datetime.utcnow().date()
        
        # Count by mode
        mode_counts = db.query(
            RouteHistory.selected_mode,
            func.count(RouteHistory.id)
        ).filter(
            func.date(RouteHistory.timestamp) == today
        ).group_by(RouteHistory.selected_mode).all()
        
        # Average fare
        avg_fare = db.query(
            func.avg(RouteHistory.estimated_fare)
        ).filter(
            func.date(RouteHistory.timestamp) == today
        ).scalar()
        
        mode_distribution = {mode: count for mode, count in mode_counts if mode}

        return {
            "date": str(today),
            "total_searches": sum(count for _, count in mode_counts),
            "mode_distribution": mode_distribution,
            "average_fare": round(avg_fare, 2) if avg_fare else 0,
            "period": "today"
        }
    
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        return {"error": str(e)}

@router.get("/analytics/trends")
async def get_analytics_trends(days: int = Query(7, ge=1, le=90), db = Depends(get_db)):
    """
    Get analytics trends over time.
    
    Args:
        days: Number of days to include
    
    Returns:
        Trend data
    """
    try:
        from app.database.models import RouteHistory
        from sqlalchemy import func

        start_date = (datetime.utcnow() - timedelta(days=days - 1)).date()
        rows = db.query(
            func.date(RouteHistory.timestamp).label("date"),
            func.count(RouteHistory.id).label("searches"),
            func.avg(RouteHistory.estimated_fare).label("avg_fare"),
        ).filter(
            func.date(RouteHistory.timestamp) >= start_date
        ).group_by(
            func.date(RouteHistory.timestamp)
        ).all()

        by_date = {
            str(row.date): {
                "date": str(row.date),
                "searches": row.searches,
                "avg_fare": round(row.avg_fare or 0, 2),
            }
            for row in rows
        }

        trends = []
        for offset in range(days):
            day = start_date + timedelta(days=offset)
            trends.append(by_date.get(str(day), {
                "date": str(day),
                "searches": 0,
                "avg_fare": 0,
            }))

        return {"period_days": days, "trends": trends}
    except Exception as e:
        logger.error(f"Error getting trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Info API
@router.get("/info/version")
async def get_version():
    """Get API version and info."""
    return {
        "app": "SmartCommute",
        "version": "1.0.0",
        "api_version": "v1",
        "features": [
            "multimodal_routing",
            "fare_prediction",
            "recommendation_engine",
            "transit_analytics",
            "real_time_transit_data"
        ]
    }

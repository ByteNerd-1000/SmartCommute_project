"""
FastAPI application for SmartCommute backend.
Main entry point and route initialization.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.config import CORS_ORIGINS, DEBUG
from app.database import init_db
from app.api import routes_api

# Configure logging
logging.basicConfig(
    level=logging.INFO if DEBUG else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="SmartCommute API",
    description="Intelligent Multi-Modal Transportation Optimization Platform",
    version="1.0.0"
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials="*" not in CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
try:
    init_db()
    logger.info("Database initialized")
except Exception as e:
    logger.warning(f"Database initialization skipped: {e}")

# Include routers
app.include_router(routes_api.router, prefix="/api", tags=["routes"])

@app.on_event("startup")
async def startup():
    """Initialize services on startup."""
    logger.info("SmartCommute backend starting up")
    try:
        from app.transit.gtfs_parser import get_gtfs_parser
        from app.transit.metro_parser import get_metro_parser
        from app.ml.fare_predictor import get_fare_model
        
        gtfs = get_gtfs_parser()
        logger.info(f"GTFS data loaded: {len(gtfs.get_all_stops())} stops")
        
        metro = get_metro_parser()
        logger.info(f"Metro data loaded: {len(metro.get_all_stops())} stations")
        
        model = get_fare_model()
        logger.info(f"Fare model loaded: trained={model.is_trained}")
    except Exception as e:
        logger.error(f"Error loading services: {e}", exc_info=True)

@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown."""
    logger.info("SmartCommute backend shutting down")

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "SmartCommute API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG
    )

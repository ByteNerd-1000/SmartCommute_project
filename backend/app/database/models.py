"""
Database models for SmartCommute.
Handles route history, recommendations, analytics.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from app.config import DATABASE_URL

Base = declarative_base()

class RouteHistory(Base):
    """Store user route searches for analytics."""
    __tablename__ = "route_history"
    
    id = Column(Integer, primary_key=True, index=True)
    source_lat = Column(Float, nullable=False)
    source_lng = Column(Float, nullable=False)
    dest_lat = Column(Float, nullable=False)
    dest_lng = Column(Float, nullable=False)
    source_name = Column(String, nullable=True)
    dest_name = Column(String, nullable=True)
    selected_route_id = Column(String, nullable=True)
    selected_mode = Column(String, nullable=True)  # bus, metro, walk, ride
    estimated_fare = Column(Float, nullable=True)
    estimated_duration = Column(Integer, nullable=True)  # seconds
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user_ip = Column(String, nullable=True)

class SavedRoute(Base):
    """Store user's saved routes."""
    __tablename__ = "saved_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    source_lat = Column(Float, nullable=False)
    source_lng = Column(Float, nullable=False)
    dest_lat = Column(Float, nullable=False)
    dest_lng = Column(Float, nullable=False)
    name = Column(String, nullable=False)
    route_data = Column(Text, nullable=True)  # JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    is_favorite = Column(Boolean, default=False)

class CachedRecommendation(Base):
    """Cache recommendations for faster response."""
    __tablename__ = "cached_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    source_hash = Column(String, unique=True, index=True)
    dest_hash = Column(String, index=True)
    recommendations_data = Column(Text, nullable=False)  # JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

class CommuteAnalytics(Base):
    """Track commute statistics for dashboard."""
    __tablename__ = "commute_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)  # YYYY-MM-DD
    total_searches = Column(Integer, default=0)
    avg_fare = Column(Float, nullable=True)
    avg_duration = Column(Integer, nullable=True)
    bus_count = Column(Integer, default=0)
    metro_count = Column(Integer, default=0)
    walk_count = Column(Integer, default=0)
    ride_count = Column(Integer, default=0)
    most_popular_route = Column(String, nullable=True)

# Database setup
engine_kwargs = {"echo": False}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_db():
    """Dependency for FastAPI to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)

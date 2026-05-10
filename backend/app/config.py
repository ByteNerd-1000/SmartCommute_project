"""
Configuration management for SmartCommute backend.
Handles dataset paths, environment variables, and app settings.
"""
from pathlib import Path
import os
from typing import Optional

# Determine project root and dataset locations
BACKEND_DIR = Path(__file__).parent.parent
PROJECT_DIR = BACKEND_DIR.parent
DATASET_DIR = BACKEND_DIR / "dataset"

# Dataset paths
GTFS_DIR = DATASET_DIR / "extracted_gtfs"
METRO_DATASET_DIR = DATASET_DIR / "metro_dataset"
FARE_DATASET_PATH = DATASET_DIR / "smartcommute_fare_dataset_v2.csv"

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BACKEND_DIR / 'smartcommute.db'}"
)

# API Keys
OPENROUTESERVICE_API_KEY = os.getenv("OPENROUTESERVICE_API_KEY", "")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

# App settings
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://127.0.0.1:5174,*").split(",")

# Pune coordinates (approximate center)
PUNE_CENTER_LAT = 18.5204
PUNE_CENTER_LNG = 73.8567

# Search constraints
MAX_WALKING_DISTANCE_KM = float(os.getenv("MAX_WALKING_DISTANCE_KM", "2.0"))
MAX_TRANSFER_COUNT = int(os.getenv("MAX_TRANSFER_COUNT", "3"))
DEFAULT_WALKING_SPEED_KMH = 5.0

# Validate dataset paths
def validate_datasets() -> bool:
    """Validate that all required datasets exist."""
    if not GTFS_DIR.exists():
        raise FileNotFoundError(f"GTFS dataset not found at {GTFS_DIR}")
    if not METRO_DATASET_DIR.exists():
        raise FileNotFoundError(f"Metro dataset not found at {METRO_DATASET_DIR}")
    if not FARE_DATASET_PATH.exists():
        raise FileNotFoundError(f"Fare dataset not found at {FARE_DATASET_PATH}")
    return True

# Validate on import
try:
    validate_datasets()
except FileNotFoundError as e:
    print(f"Warning: {e}")

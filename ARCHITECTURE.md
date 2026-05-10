# SmartCommute Architecture Documentation

## System Overview

SmartCommute is a full-stack multimodal transportation optimization platform. It intelligently combines multiple transit modes (buses, metro, walking, ride-sharing) to recommend optimal routes based on user preferences.

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│  (React 18 + TypeScript + TailwindCSS + Framer Motion)      │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/REST API
                         │
┌─────────────────────────┴────────────────────────────────────┐
│                    FASTAPI BACKEND                           │
│  (Python 3.9+ with modern async/await)                      │
│                                                              │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │ Route Search │ Fare Predict │ Transit Data │             │
│  │   Service    │   Service    │   Service    │             │
│  └──────────────┴──────────────┴──────────────┘             │
│                         │                                    │
│  ┌──────────────────────┴──────────────────────┐            │
│  │ Algorithms & Data Processing Layer          │            │
│  │ • Dijkstra/A* pathfinding                   │            │
│  │ • Graph construction                        │            │
│  │ • GTFS parsing                              │            │
│  │ • Metro data processing                     │            │
│  │ • ML fare prediction                        │            │
│  │ • Recommendation engine                     │            │
│  └──────────────────────┬──────────────────────┘            │
│                         │                                    │
│  ┌──────────────────────┴──────────────────────┐            │
│  │ Data Layer (PostgreSQL + Caching)           │            │
│  │ • Route history                             │            │
│  │ • User preferences                          │            │
│  │ • Analytics data                            │            │
│  └──────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────┴────────────────────────────────────┐
│                    EXTERNAL DATA SOURCES                     │
│ • PMPML GTFS (~/Coding/dataset/extracted_gtfs/)            │
│ • Pune Metro (~/Coding/dataset/metro_dataset/)             │
│ • Fare Dataset (~/Coding/dataset/smartcommute_fare...)     │
│ • OpenStreetMap (for map tiles)                            │
│ • OpenRouteService (for traffic-aware routing)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Layer 1: API Layer (`app/api/`)
**Responsibility**: HTTP request/response handling

```
FastAPI Application
│
├── Route Handlers
│   ├── /api/routes/search
│   ├── /api/fare/predict
│   ├── /api/transit/*
│   └── /api/analytics/*
│
└── Request/Response Models (Pydantic)
```

### Layer 2: Service Layer (`app/services/`)
**Responsibility**: Business logic and orchestration

#### RouteOptimizationService
```python
# Responsibilities:
- Coordinate route generation
- Combine transit modes
- Generate multimodal combinations
- Coordinate with transit parsers
- Use recommendation engine

# Key Methods:
- plan_routes()          # Main entry point
- _generate_walk_route()
- _generate_bus_route()
- _generate_metro_route()
- _generate_bus_metro_route()
- _generate_ride_route()
- _deduplicate_routes()
```

#### RecommendationEngine
```python
# Responsibilities:
- Score routes across dimensions
- Generate recommendations
- Compare routes

# Key Methods:
- generate_recommendations()
- _calculate_score()
- _score_cheapness()
- _score_speed()
- _score_comfort()
- _score_eco_friendliness()
```

### Layer 3: Data Processing (`app/transit/`, `app/algorithms/`, `app/ml/`)

#### Transit Parsers
- **GTFSParser**: Parses PMPML bus data
  - Reads: stops.txt, routes.txt, stop_times.txt, trips.txt, shapes.txt
  - Provides: stop lookup, routes for stops, shapes

- **MetroParser**: Parses Pune Metro data
  - Reads: metro_stops.csv, metro_routes.csv, metro_trips.csv, metro_stop_times.csv
  - Provides: station lookup, interchange detection

#### Graph Algorithms
```python
# TransitGraph: Represents multimodal network
├── Nodes: Bus stops, metro stations, transfer points
└── Edges: Bus connections, metro lines, walking paths

# DijkstraPathfinder: Finds shortest path
# AStarPathfinder: Finds optimal path with heuristic
```

#### Machine Learning (`app/ml/fare_predictor.py`)
```python
# FarePredictionModel
├── Algorithm: RandomForestRegressor
├── Features: 9 variables (distance, duration, traffic, etc.)
├── Training: 5000+ historical fares
├── Caching: Trained model persisted to disk
└── Fallback: Heuristic-based estimation if model unavailable
```

### Layer 4: Utilities (`app/utils/`)

#### Geolocation Utils
```python
- haversine_distance()         # Great-circle distance
- manhattan_distance()         # Approximation
- is_peak_hour()              # Time-based detection
- generate_hash()             # For caching
- CoordinateBounds            # Geographic bounds
```

### Layer 5: Database (`app/database/`)

```python
# Models:
├── RouteHistory           # Log searches
├── SavedRoute            # User saved routes
├── CachedRecommendation  # Cache recommendations
└── CommuteAnalytics      # Daily statistics
```

---

## Frontend Architecture

### State Management (Zustand)

```typescript
// SearchStore
├── source              // Current source location
├── destination         // Current destination location
├── routes             // List of route options
├── selectedRoute      // Currently selected route
├── loading            // Loading state
├── error              // Error message
└── isDarkMode         // Theme preference

// TransitStore
├── busStops           // All bus stops
├── metroStations      // All metro stations
├── busStopsLoaded     // Loading indicator
└── metroStationsLoaded

// AnalyticsStore
├── summary            // Daily analytics
└── trends            // Historical analytics
```

### Component Hierarchy

```
App
├── Header
│   ├── Navigation
│   └── DarkMode Toggle
│
├── Main Routes
│   ├── HomePage
│   │   ├── HeroSection
│   │   ├── FeaturesSection
│   │   ├── StatsSection
│   │   └── CTA Section
│   │
│   └── SearchPage
│       ├── SearchInterface
│       ├── RouteCard(s)
│       └── MapComponent
│           ├── Source Marker
│           ├── Destination Marker
│           ├── Bus Stop Markers
│           ├── Metro Station Markers
│           └── Route Polyline
│
└── Footer
```

### Data Flow

```
User Input (Search)
       ↓
[SearchInterface] → setSource, setDestination
       ↓
Call apiService.searchRoutes()
       ↓
Backend /api/routes/search
       ↓
Response: routes + recommendations
       ↓
setRoutes() → Update store
       ↓
[RouteCard] components render
       ↓
User clicks route
       ↓
setSelectedRoute() → MapComponent updates
```

### API Integration

```typescript
// services/api.ts
apiClient
├── searchRoutes()
├── predictFare()
├── getNearbyBusStops()
├── getNearbyMetroStations()
├── getAllBusStops()
├── getAllMetroStations()
├── getInterchangeStations()
├── getAnalyticsSummary()
└── getAnalyticsTrends()
```

---

## Data Flow: Route Search Example

### Complete Flow Diagram

```
1. USER INPUT
   ├─ Source: (18.5204, 73.8567) - Pune Station
   └─ Destination: (18.5432, 73.9123) - Phoenix Market

2. FRONTEND
   apiService.searchRoutes(source, dest)
   │
   └─> POST /api/routes/search

3. BACKEND - RouteOptimizationService
   plan_routes()
   │
   ├─ GTFSParser.get_stops_near_location(18.5204, 73.8567, 1km)
   │  └─> [Bus Stop A, Bus Stop B, ...]
   │
   ├─ MetroParser.get_stops_near_location(18.5204, 73.8567, 1km)
   │  └─> [Metro Station A, Metro Station B, ...]
   │
   ├─ Generate Routes
   │  ├─ Walking only (if < 2km)
   │  ├─ Bus routes (walk → bus → walk)
   │  ├─ Metro routes (walk → metro → walk)
   │  ├─ Mixed routes (walk → bus → metro → walk)
   │  └─ Ride routes
   │
   ├─ For each route:
   │  ├─ Calculate distance (haversine)
   │  ├─ Estimate duration
   │  └─ Predict fare (ML model)
   │
   ├─ Deduplicate similar routes
   │
   └─ RecommendationEngine
      ├─ Score each route
      ├─ Select Best Overall
      ├─ Select Cheapest
      ├─ Select Fastest
      └─ Select Eco-Friendly

4. RESPONSE
   {
     "routes": [ ... 5 routes ... ],
     "recommendations": {
       "best_overall": { ... },
       "cheapest": { ... },
       "fastest": { ... },
       "eco_friendly": { ... }
     }
   }

5. FRONTEND
   ├─ setRoutes(routes)
   ├─ Render RouteCards
   ├─ Render MapComponent with all options
   └─ Show recommendations

6. USER INTERACTION
   User clicks a route
   ├─ setSelectedRoute(route)
   └─ MapComponent shows polyline + stops for selected route

7. DATABASE (Optional)
   └─ RouteHistory.create(source, dest, selected_route, timestamp)
```

---

## Performance Considerations

### Backend Optimization
- **Data Loading**: Transit data loaded once on startup
- **Caching**: GTFS and Metro data cached in memory
- **ML Model**: Trained model loaded once, reused for all predictions
- **Database**: Query optimization, indexing on frequently accessed columns
- **Response Compression**: GZIP enabled for all responses

### Frontend Optimization
- **Code Splitting**: Components lazy loaded with React.lazy()
- **State Management**: Zustand for minimal re-renders
- **Memoization**: React.memo on expensive components
- **Bundle Size**: ~250KB gzipped (Vite optimized)
- **API Caching**: Map data cached after first load

---

## Scalability Plan

### Phase 1 (Current)
- Single backend instance
- PostgreSQL single node
- In-memory caching

### Phase 2 (Growth)
- Load balancer with multiple backend instances
- Redis for distributed caching
- Read replicas for database
- S3 for static assets

### Phase 3 (Scale)
- Microservices architecture
- Event streaming (Kafka)
- Graph database for transit network
- Advanced caching strategy

---

## Security Architecture

### Backend Security
```python
# CORS Protection
CORS_ORIGINS = ["http://localhost:5173", ...]

# Input Validation
Pydantic models for all requests

# SQL Injection Prevention
SQLAlchemy ORM (parameterized queries)

# Environment Variables
Sensitive data in .env, not in code
```

### Frontend Security
- No sensitive data stored in localStorage except theme preference
- API calls through backend (no direct external API calls)
- HTTPS ready for production

---

## Monitoring & Logging

### Logging Strategy
```python
# Backend: Python logging
logging.info(f"Route search: {source} → {destination}")
logging.warning(f"No routes found for {pair}")
logging.error(f"Database error: {exception}")
```

### Metrics to Track
- API response times
- Route generation success rate
- Database query performance
- ML model prediction accuracy
- User search patterns

---

## Integration Points

### External APIs (Future)
1. **OpenRouteService**
   - For real traffic-aware ETA
   - Current: Mocked/estimated

2. **Google Maps**
   - Geocoding
   - Street view

3. **Real Ride APIs**
   - Uber API
   - Ola API
   - Rapido API

### Data Sources
1. **PMPML GTFS** → Bus routes and schedules
2. **Pune Metro** → Metro stations and lines
3. **Historical Fares** → ML training data

---

## Deployment Architecture

### Development
```
Frontend (Vite)     Backend (Uvicorn)     Database (PostgreSQL)
localhost:5173      localhost:8000        localhost:5432
```

### Production (Example)
```
CDN (Cloudflare)
    ↓
Load Balancer (Nginx)
    ├─→ Backend Instance 1
    ├─→ Backend Instance 2
    └─→ Backend Instance 3
         ↓
    PostgreSQL (Primary)
         ↓
    Read Replicas
```

---

## Technology Choices Rationale

| Technology | Why | Alternative |
|------------|-----|-------------|
| FastAPI | Fast, async, automatic docs | Django, Flask |
| React | Component reusability, Vite | Vue, Angular |
| PostgreSQL | Reliability, JSON support | MySQL, MongoDB |
| Zustand | Lightweight state mgmt | Redux, Context |
| TailwindCSS | Utility-first, responsive | Bootstrap, Material-UI |
| Framer Motion | Smooth animations | React Spring |
| scikit-learn | ML simplicity | TensorFlow, PyTorch |

---

## Future Enhancements

1. **Real-Time Updates**: WebSocket for live bus tracking
2. **User Accounts**: Authentication and preferences
3. **Advanced ML**: Deep learning for better predictions
4. **Mobile App**: React Native or Flutter
5. **Social Features**: Carpool matching
6. **AR Features**: Augmented reality navigation
7. **Voice Interface**: Voice-based search
8. **Accessibility**: Screen reader support

---

## Conclusion

SmartCommute is built with clean architecture principles emphasizing:
- **Separation of Concerns**: Each layer has specific responsibility
- **Scalability**: Can handle growing data and traffic
- **Maintainability**: Clear code structure and documentation
- **Performance**: Optimized for speed and efficiency
- **User Experience**: Beautiful UI with smooth interactions

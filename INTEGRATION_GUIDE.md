# SmartCommute - Integration & Architecture Guide

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                            │
│                      http://localhost:5174                        │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              React 18 + TypeScript + Vite                  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Pages: Home, Search, Analytics                      │  │ │
│  │  ├──────────────────────────────────────────────────────┤  │ │
│  │  │ Components:                                          │  │ │
│  │  │ - SearchInterface (location input + autocomplete)   │  │ │
│  │  │ - RecommendationsDisplay (4 recommendation types)  │  │ │
│  │  │ - MapComponent (Leaflet-based visualization)        │  │ │
│  │  │ - AnalyticsDashboard (charts + summary cards)       │  │ │
│  │  │ - Header (navigation + dark mode toggle)            │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ State Management: Zustand Stores                    │  │ │
│  │  │ - SearchStore (routes, recommendations)             │  │ │
│  │  │ - ThemeStore (dark/light mode - persistent)         │  │ │
│  │  │ - TransitStore (bus/metro/stations)                 │  │ │
│  │  │ - AnalyticsStore (dashboard data)                   │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ API Client: axios (baseURL: /api)                  │  │ │
│  │  │ - searchRoutes()                                     │  │ │
│  │  │ - predictFare()                                      │  │ │
│  │  │ - getAnalyticsSummary()                              │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP REST
                       │ CORS enabled for localhost:5174
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                     BACKEND SERVER                               │
│              FastAPI on http://localhost:8000                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          API Routes (app/api/routes_api.py)               │ │
│  │                                                             │ │
│  │  POST /routes/search                                       │ │
│  │    └─> Input: source_lat, source_lng, dest_lat, dest_lng   │ │
│  │    └─> Output: { routes, recommendations }                 │ │
│  │                                                             │ │
│  │  POST /fare/predict                                        │ │
│  │    └─> Input: 9 route features                             │ │
│  │    └─> Output: predicted_fare                              │ │
│  │                                                             │ │
│  │  GET /transit/all-bus-stops                                │ │
│  │  GET /transit/all-metro-stations                           │ │
│  │  GET /analytics/summary                                    │ │
│  │  GET /analytics/trends?days=7                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            Services (app/services/)                        │ │
│  │                                                             │ │
│  │  route_optimization.py                                     │ │
│  │    └─> RouteOptimizer class                                │ │
│  │    └─> Dijkstra algorithm for pathfinding                  │ │
│  │    └─> Multi-factor scoring (time, fare, transfers)        │ │
│  │                                                             │ │
│  │  recommendation_engine.py                                  │ │
│  │    └─> RecommendationEngine class                          │ │
│  │    └─> Score calculation (0-1 scale)                       │ │
│  │    └─> 4 recommendation types:                             │ │
│  │       - best_overall (weighted average)                    │ │
│  │       - cheapest (lowest fare)                             │ │
│  │       - fastest (shortest duration)                        │ │
│  │       - eco_friendly (lowest transfers + walk)             │ │
│  │                                                             │ │
│  │  fare_predictor.py                                         │ │
│  │    └─> FarePredictor class (ML model)                      │ │
│  │    └─> RandomForestRegressor (trained on 6500 records)     │ │
│  │    └─> Features: distance, duration, traffic, time_of_day  │ │
│  │       weather, vehicle_type, peak_hour, transfers, type    │ │
│  │    └─> LabelEncoder for categorical features               │ │
│  │                                                             │ │
│  │  recommendation_engine.py                                  │ │
│  │    └─> Integration point with router                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Data Processing (app/transit/)                    │ │
│  │                                                             │ │
│  │  gtfs_parser.py                                            │ │
│  │    └─> Parse GTFS data (stop_times, stops, routes, etc)    │ │
│  │    └─> Build in-memory graph for route optimization        │ │
│  │    └─> 6353 bus stops, 1165 routes, 640K+ stop times      │ │
│  │                                                             │ │
│  │  metro_parser.py                                           │ │
│  │    └─> Parse metro data                                    │ │
│  │    └─> 30 stations, 2 lines                                │ │
│  │    └─> Interchange station detection                       │ │
│  │                                                             │ │
│  │  pathfinding.py                                            │ │
│  │    └─> Dijkstra algorithm                                  │ │
│  │    └─> Multi-source/multi-destination routing              │ │
│  │    └─> Handles transfers between modes                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Configuration (app/config.py)                     │ │
│  │                                                             │ │
│  │  - CORS_ORIGINS (localhost:5173, 5174, 127.0.0.1:5174)    │ │
│  │  - GTFS_DATA_PATH (/home/deepak/Coding/dataset/...)       │ │
│  │  - FARE_DATASET_PATH (smartcommute_fare_dataset_v2.csv)   │ │
│  │  - DATABASE_URL (PostgreSQL - optional, fails gracefully) │ │
│  │  - ML_MODEL_CACHE_PATH (/app/models/)                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Data Loading
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                      DATA SOURCES                                │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  GTFS Transit    │  │  Metro Data      │  │  Fare       │  │
│  │  (CSV Files)     │  │  (CSV Files)     │  │  Dataset    │  │
│  │                  │  │                  │  │             │  │
│  │ - stops.txt      │  │ - metro_st.csv   │  │ - 6500      │  │
│  │ - stop_times.txt │  │ - metro_line.csv │  │   records   │  │
│  │ - routes.txt     │  │                  │  │             │  │
│  │ - trips.txt      │  │ 30 stations      │  │ Features:   │  │
│  │ - shapes.txt     │  │ 2 lines          │  │ - distance  │  │
│  │                  │  │                  │  │ - duration  │  │
│  │ 6353 stops       │  │ Interchange:     │  │ - traffic   │  │
│  │ 1165 routes      │  │ Detect shared    │  │ - time_of   │  │
│  │ 640K+ stop_times │  │ stations         │  │   day       │  │
│  │ 15K+ trips       │  │                  │  │ - weather   │  │
│  │ 450K+ shapes     │  │                  │  │ - vehicle   │  │
│  │ (polylines)      │  │                  │  │ - peak_hour │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
│  Location: /home/deepak/Coding/dataset/                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoint Integration

### 1. Route Search with Recommendations

**Endpoint**: `POST /api/routes/search`

**Request**:
```json
{
  "source_lat": 18.544,
  "source_lng": 73.827,
  "dest_lat": 18.526,
  "dest_lng": 73.876
}
```

**Response**:
```json
{
  "routes": [
    {
      "id": "route_1",
      "mode": "bus",
      "start_location": "Pune Vidhyapeeth Gate",
      "end_location": "Pune Station Depot",
      "fare": 15.09,
      "duration": 26,
      "distance": 5.5,
      "route_name": "bus_46_1",
      "polyline": [...],
      "steps": [...]
    }
  ],
  "recommendations": {
    "best_overall": {
      "route": { ...route_1... },
      "score": { "overall": 0.9, "cheapness": 0.95, ... },
      "recommendation_type": "best_overall",
      "reason": "Best balance of fare and time"
    },
    "cheapest": { ...same_route... },
    "fastest": { ...different_route... },
    "eco_friendly": { ...same_route... }
  }
}
```

**Frontend Integration** ([/frontend/src/components/SearchInterface.tsx](frontend/src/components/SearchInterface.tsx#L1)):
```typescript
const handleSearch = async () => {
  const routes = response.data.routes;
  const recommendations = response.data.recommendations;
  
  setRoutes(routes);
  setRecommendations(recommendations);
};
```

---

### 2. ML Fare Prediction

**Endpoint**: `POST /api/fare/predict`

**Request**:
```json
{
  "distance_km": 5.5,
  "duration_min": 26,
  "traffic_level": "low",
  "time_of_day": "morning",
  "weather": "clear",
  "vehicle_type": "bus",
  "peak_hour": "no",
  "transfer_count": 0,
  "route_type": "bus"
}
```

**Response**:
```json
{
  "predicted_fare": 15.09,
  "confidence": 0.87,
  "model_version": "1.0"
}
```

**Backend Implementation** ([/backend/app/ml/fare_predictor.py](backend/app/ml/fare_predictor.py#L1)):
- RandomForestRegressor with 100 estimators
- Trained on 6500+ historical records
- 9-feature input with preprocessing
- ±15% prediction accuracy

---

### 3. Transit Data Endpoints

**Get All Bus Stops**:
```
GET /api/transit/all-bus-stops?limit=100&offset=0
```

**Get All Metro Stations**:
```
GET /api/transit/all-metro-stations
```

**Get Interchange Stations**:
```
GET /api/transit/interchanges
```

---

### 4. Analytics Endpoints

**Summary Statistics**:
```
GET /api/analytics/summary
```

**7-Day Trends**:
```
GET /api/analytics/trends?days=7
```

---

## 🎨 Frontend Component Integration

### SearchInterface Flow:
```
User Input (location)
    ↓
Autocomplete (filters 6000+ stops)
    ↓
User Selects Location
    ↓
User Clicks "Find Routes"
    ↓
API Call: searchRoutes()
    ↓
Receive: { routes[], recommendations{} }
    ↓
Store in ZustandStore
    ↓
Render: RecommendationsDisplay + RouteCards
    ↓
User Clicks "Select Route"
    ↓
Highlight on Map
```

### Dark Mode Flow:
```
User Clicks Toggle Button
    ↓
ThemeStore.toggleDarkMode()
    ↓
Update localStorage['theme-storage']
    ↓
Set isDarkMode state
    ↓
Document.documentElement.classList.add('dark')
    ↓
All components re-render with conditional classes
```

---

## 🔐 CORS Configuration

**Configured Origins**:
- http://localhost:3000
- http://localhost:5173
- http://localhost:5174
- http://127.0.0.1:5174

**Implementation** ([/backend/app/main.py](backend/app/main.py#L1)):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📦 Dependencies

### Frontend (package.json):
```json
{
  "dependencies": {
    "react": "^18",
    "typescript": "^5.2",
    "vite": "^5.4",
    "tailwindcss": "^3.4",
    "zustand": "^4.4",
    "framer-motion": "^10.16",
    "react-leaflet": "^4.2",
    "recharts": "^2.10",
    "axios": "^1.6",
    "lucide-react": "^0.263"
  }
}
```

### Backend (requirements.txt):
```
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pandas==2.1.3
numpy==1.26.2
scikit-learn==1.3.2
joblib==1.3.2
```

---

## 🚀 Deployment Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5174
- [ ] CORS configured for production domain
- [ ] ML model cached (/app/models/fare_model.joblib)
- [ ] GTFS data available (/home/deepak/Coding/dataset/)
- [ ] All API endpoints responding
- [ ] Dark mode localStorage working
- [ ] Recommendations displaying correctly
- [ ] Map rendering with polylines
- [ ] Analytics dashboard loading

---

## 📈 Performance Metrics

- **Route Search**: <500ms (Dijkstra)
- **Fare Prediction**: <100ms (ML model)
- **Frontend Bundle**: ~450KB (gzipped)
- **API Response**: <1000ms (all endpoints)

---

## 🔧 Extension Points

### Add New Transport Mode:
1. Update transit parsers to include new mode data
2. Add mode to route type enums
3. Update scoring algorithm in recommendation engine
4. Add icon/badge in RecommendationsDisplay

### Add New Analytics Metric:
1. Create metric calculation in analytics service
2. Add endpoint to routes_api.py
3. Add chart component to AnalyticsDashboard
4. Connect to API service

### Add New Recommendation Type:
1. Implement scoring function in recommendation_engine
2. Add recommendation_type to response
3. Create RecommendationCard variant
4. Update RecommendationsDisplay component

---

**Architecture Version**: 1.0.0
**Last Updated**: 2026-05-10
**Maintainer**: SmartCommute Team

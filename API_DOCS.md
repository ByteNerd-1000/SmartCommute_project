# SmartCommute API Documentation

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://api.smartcommute.app` (example)

## Authentication
Currently, the API is public. In production, implement JWT authentication.

---

## Route Search Endpoint

### POST `/api/routes/search`

Search for multimodal routes between source and destination.

**Request:**
```json
{
  "source": {
    "latitude": 18.5204,
    "longitude": 73.8567,
    "name": "Pune Railway Station"
  },
  "destination": {
    "latitude": 18.5432,
    "longitude": 73.9123,
    "name": "Phoenix Market City"
  },
  "max_options": 5
}
```

**Response (200 OK):**
```json
{
  "routes": [
    {
      "id": "route_abc123",
      "modes": ["walk", "metro", "walk"],
      "fare": 45.50,
      "duration_minutes": 38,
      "walking_distance_km": 1.2,
      "transfer_count": 0,
      "distance_km": 12.5,
      "stops": [
        {
          "type": "start",
          "lat": 18.5204,
          "lng": 73.8567
        },
        {
          "type": "metro_station",
          "lat": 18.5300,
          "lng": 73.8600,
          "name": "Civil Court"
        },
        {
          "type": "end",
          "lat": 18.5432,
          "lng": 73.9123
        }
      ]
    }
  ],
  "recommendations": {
    "best_overall": {
      "route": { ... },
      "score": {
        "overall": 82.5,
        "cheapness": 75.0,
        "speed": 88.0,
        "comfort": 85.0,
        "eco_friendliness": 90.0
      },
      "recommendation_type": "BEST_OVERALL",
      "reason": "Best balance..."
    },
    "cheapest": { ... },
    "fastest": { ... },
    "eco_friendly": { ... }
  },
  "source": {
    "lat": 18.5204,
    "lng": 73.8567
  },
  "destination": {
    "lat": 18.5432,
    "lng": 73.9123
  }
}
```

**Error Response (400):**
```json
{
  "detail": "Invalid coordinates"
}
```

---

## Fare Prediction Endpoint

### POST `/api/fare/predict`

Predict fare for given route parameters.

**Request:**
```json
{
  "distance_km": 10.5,
  "duration_min": 45,
  "traffic_level": 0.6,
  "time_of_day": "morning",
  "weather": "clear",
  "vehicle_type": "bus",
  "peak_hour": true,
  "transfer_count": 1,
  "route_type": "PMPML"
}
```

**Response (200 OK):**
```json
{
  "predicted_fare": 35.50,
  "currency": "INR"
}
```

---

## Transit Data Endpoints

### GET `/api/transit/bus-stops`

Get nearby bus stops.

**Query Parameters:**
- `latitude` (float, required): Center latitude
- `longitude` (float, required): Center longitude
- `radius_km` (float, optional, default=1.0, max=5.0): Search radius

**Response:**
```json
{
  "stops": [
    {
      "stop_id": "stops_123",
      "stop_name": "Deccan Gymkhana",
      "stop_lat": 18.5204,
      "stop_lon": 73.8567,
      "stop_desc": "Deccan Gymkhana Bus Stop",
      "distance_km": 0.25
    }
  ],
  "count": 1,
  "center": {
    "lat": 18.5204,
    "lng": 73.8567
  },
  "radius_km": 1.0
}
```

### GET `/api/transit/metro-stations`

Get nearby metro stations.

**Query Parameters:**
- `latitude` (float, required)
- `longitude` (float, required)
- `radius_km` (float, optional, default=1.0, max=5.0)

**Response:**
```json
{
  "stations": [
    {
      "stop_id": "M001",
      "stop_name": "Civil Court",
      "stop_lat": 18.5300,
      "stop_lon": 73.8600,
      "line": "Aqua Line",
      "distance_km": 0.35
    }
  ],
  "count": 1,
  "center": {
    "lat": 18.5204,
    "lng": 73.8567
  },
  "radius_km": 1.0
}
```

### GET `/api/transit/all-bus-stops`

Get all bus stops (for map visualization).

**Response:**
```json
{
  "stops": [
    {
      "stop_id": "stops_1",
      "stop_name": "Stop Name",
      "stop_lat": 18.5204,
      "stop_lon": 73.8567,
      "stop_desc": "Description"
    }
  ],
  "count": 2847
}
```

### GET `/api/transit/all-metro-stations`

Get all metro stations.

**Response:**
```json
{
  "stations": [
    {
      "stop_id": "M001",
      "stop_name": "Station Name",
      "stop_lat": 18.5300,
      "stop_lon": 73.8600,
      "line": "Aqua Line"
    }
  ],
  "count": 32
}
```

### GET `/api/transit/interchanges`

Get metro interchange stations.

**Response:**
```json
{
  "interchanges": [
    {
      "stop_name": "Civil Court",
      "stop_id": "M001",
      "stop_lat": 18.5300,
      "stop_lon": 73.8600,
      "lines": ["Aqua Line", "Purple Line"]
    }
  ],
  "count": 4
}
```

---

## Analytics Endpoints

### GET `/api/analytics/summary`

Get commute analytics summary.

**Response:**
```json
{
  "date": "2024-01-15",
  "total_searches": 245,
  "mode_distribution": {
    "bus": 120,
    "metro": 95,
    "walk": 20,
    "ride": 10
  },
  "average_fare": 28.50,
  "period": "today"
}
```

### GET `/api/analytics/trends`

Get analytics trends over time.

**Query Parameters:**
- `days` (int, optional, default=7, max=90): Number of days

**Response:**
```json
{
  "period_days": 7,
  "trends": [
    {
      "date": "2024-01-09",
      "searches": 180,
      "avg_fare": 27.30
    }
  ]
}
```

---

## Info Endpoints

### GET `/api/`

Root endpoint.

**Response:**
```json
{
  "name": "SmartCommute API",
  "version": "1.0.0",
  "status": "running"
}
```

### GET `/api/health`

Health check.

**Response:**
```json
{
  "status": "healthy"
}
```

### GET `/api/info/version`

Get API version and features.

**Response:**
```json
{
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
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting (Future)

- **Limit**: 100 requests per minute per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Data Types

### Location
```json
{
  "latitude": number,
  "longitude": number,
  "name": "optional string"
}
```

### Route
```json
{
  "id": "string",
  "modes": ["string"],
  "fare": number,
  "duration_minutes": integer,
  "walking_distance_km": number,
  "transfer_count": integer,
  "distance_km": number,
  "stops": [...]
}
```

### Score
```json
{
  "overall": number (0-100),
  "cheapness": number (0-100),
  "speed": number (0-100),
  "comfort": number (0-100),
  "eco_friendliness": number (0-100)
}
```

---

## Interactive API Documentation

Visit `http://localhost:8000/docs` for Swagger UI
Visit `http://localhost:8000/redoc` for ReDoc

---

## Curl Examples

### Search routes
```bash
curl -X POST http://localhost:8000/api/routes/search \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"latitude": 18.5204, "longitude": 73.8567},
    "destination": {"latitude": 18.5432, "longitude": 73.9123}
  }'
```

### Predict fare
```bash
curl -X POST http://localhost:8000/api/fare/predict \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 10.5,
    "duration_min": 45,
    "traffic_level": 0.6,
    "time_of_day": "morning",
    "weather": "clear",
    "vehicle_type": "bus",
    "peak_hour": true,
    "transfer_count": 1,
    "route_type": "PMPML"
  }'
```

### Get nearby bus stops
```bash
curl "http://localhost:8000/api/transit/bus-stops?latitude=18.5204&longitude=73.8567&radius_km=1.0"
```

---

## Versioning

API versions are indicated in the URL: `/api/v1/...`

Current version: `v1`

---

## Changelog

### v1.0.0 (Initial Release)
- Route search
- Fare prediction
- Transit data endpoints
- Analytics endpoints

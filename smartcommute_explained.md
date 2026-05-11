# SmartCommute — Complete Project Explanation

---

## 1. Problem Statement & Solution

### Problem
Pune commuters face a fragmented transportation system:
- No single platform shows **bus + metro + cab + auto + bike-taxi** options together
- Fare visibility is zero before boarding — no upfront estimates
- No comparison of cost vs. time vs. comfort across modes
- Rush-hour / peak-hour surges are unknown to users

**Example scenario**: You're in Hadapsar and want to reach Hinjewadi Phase 1 (IT hub). You don't know whether to:
- Take PMPML Bus (~₹30, 70 min, crowded)
- Take Rapido Bike taxi (~₹120, 45 min)
- Walk to metro + transfer + walk (~₹25, 55 min)
- Book Uber Go (~₹180, 40 min with surge)

### Solution — SmartCommute
SmartCommute is an **Intelligent Multimodal Route Optimizer** for Pune that:
1. Takes any two locations in Pune
2. Computes **all viable route combinations** (walk, bus, metro, bus+metro, Rapido, Auto, Ola, Uber)
3. Predicts **realistic fares** using ML + formulas
4. Ranks routes by **cheapest / fastest / eco-friendly / comfort**
5. Shows routes on an **interactive map** with stop-level details

**Concrete example (Hadapsar → Hinjewadi Phase 1):**
- 🚶 Walk: 28 km — skipped (>2 km threshold)
- 🚌 PMPML Bus: Board at Hadapsar ST, alight near Hinjewadi — ₹38, 65 min
- 🚇 Metro: Not applicable (no metro station near Hinjewadi yet)
- 🛵 Rapido Bike: ₹108, 44 min
- 🛺 Auto: ₹193, 48 min
- 🚗 Ola Mini: ₹178, 42 min
- 🚗 Uber Go: ₹196, 42 min
- **Smart Recommendation → PMPML Bus** (best fare/time balance)

---

## 2. Tech Stack — Frontend to Backend

### Frontend
| Layer | Technology | Purpose |
|---|---|---|
| Framework | **React 18 + TypeScript** | UI component system |
| Build Tool | **Vite 5** | Fast dev server & bundler |
| Styling | **TailwindCSS 3** | Utility CSS |
| Routing | **React Router DOM v6** | Page navigation |
| State Mgmt | **Zustand** | Global store (search, history, theme) |
| HTTP Client | **Axios** | API calls to backend |
| Maps | **React-Leaflet + Leaflet** | Interactive OSM maps |
| Charts | **Recharts** | Analytics dashboards |
| Animations | **Framer Motion** | Page transitions & micro-animations |
| Icons | **Lucide React** | Icon library |

### Backend
| Layer | Technology | Purpose |
|---|---|---|
| Framework | **FastAPI (Python)** | REST API, async, auto-docs |
| Server | **Uvicorn** | ASGI server |
| Data Layer | **SQLAlchemy ORM** | Database abstraction |
| Database | **SQLite** (dev) / **PostgreSQL** (prod) | Persistence |
| ML | **scikit-learn** | RandomForestRegressor |
| Data | **Pandas + NumPy** | Dataset processing |
| Model Save | **joblib** | Persist trained model |
| Validation | **Pydantic v2** | Request/Response models |
| CORS | **FastAPI CORSMiddleware** | Frontend ↔ Backend communication |

### Deployment
| Service | Tool |
|---|---|
| Backend (prod) | **Render** (render.yaml config) |
| Frontend (prod) | **Vercel** (vercel.json config) |
| Transit Data | GTFS files bundled with backend |

---

## 3. Algorithms — ML & Pathfinding

### Algorithm 1: Dijkstra (Shortest Path)
**File:** `backend/app/algorithms/pathfinding.py`

**Purpose:** Find the shortest path through the transit graph using **duration as the edge weight**.

**How it works:**
```
1. Build a graph: each bus stop / metro station = Node
2. Each connection = Edge with (duration_minutes, distance_km, mode)
3. Priority queue (min-heap) on current cumulative duration
4. Greedy expansion: always process the closest-in-time unvisited node
5. Stop when destination node is popped from heap
```

**Use case in this project:** Used internally when a direct transit graph path needs to be resolved (e.g., finding the single fastest path for a bus-only trip between two stops).

---

### Algorithm 2: A* (Heuristic-Guided Pathfinding)
**File:** `backend/app/algorithms/pathfinding.py`

**Purpose:** Same as Dijkstra but faster due to a **geographic heuristic** — it prefers expanding nodes that are physically closer to the destination.

**Heuristic formula:**
```
h(node) = (haversine_distance(node, goal) / 20 km/h) × 60 minutes
```
Assumes average transit speed of 20 km/h to estimate remaining time.

**f(n) = g(n) + h(n)**  
`g(n)` = actual cost from start  
`h(n)` = estimated cost to goal

**Use case:** More efficient route planning when graph is large (many bus stops). Finds the same optimal answer as Dijkstra but with fewer node expansions.

---

### Algorithm 3: Random Forest Regressor (ML Fare Prediction)
**File:** `backend/app/ml/fare_predictor.py`

**Purpose:** Predict the estimated fare for a trip given 9 input features.

**Model config:**
```python
RandomForestRegressor(
    n_estimators=100,   # 100 decision trees in the forest
    max_depth=15,       # Each tree can go 15 levels deep
    random_state=42,    # Reproducibility
    n_jobs=-1           # Use all CPU cores
)
```

**Input features:**
| Feature | Type | Example |
|---|---|---|
| distance_km | float | 8.5 |
| duration_min | int | 35 |
| traffic_level | float 0-1 | 0.75 |
| time_of_day | categorical | "morning" |
| weather | categorical | "clear" |
| vehicle_type | categorical | "bus" |
| peak_hour | binary | 1 |
| transfer_count | int | 1 |
| route_type | categorical | "PMPML" |

**Use case:** Predicts ₹ fare for any transit combination. The model is trained on 6,500 synthetic Pune commute records and saved as `fare_model.pkl` (40 MB).

---

### Algorithm 4: Weighted Multi-Criteria Scoring (Recommendation Engine)
**File:** `backend/app/services/recommendation_engine.py`

**Purpose:** Rank all generated routes across 4 dimensions.

**Score formula:**
```
Overall Score = (Cheapness × 0.25) + (Speed × 0.30) + (Comfort × 0.25) + (Eco × 0.20)
```

Each dimension is normalized to 0–100:
- **Cheapness:** `((200 - fare) / (200 - 10)) × 100`
- **Speed:** `((120 - duration) / (120 - 15)) × 100`
- **Comfort:** `100 - (transfers × 15) - (walk_km / 0.5 × 5) - (mode_changes × 10)`
- **Eco:** Average eco score of each mode × bonus for walking

**Mode eco scores:**
```
walk=1.0, metro=0.9, bus=0.8, rapido_bike=0.45, auto=0.35, ola/uber=0.3
```

**Use case:** Powers the "Best Overall / Cheapest / Fastest / Eco / Comfort" recommendation cards shown to the user.

---

### Algorithm 5: Haversine Distance Formula
**File:** `backend/app/utils/geolocation.py`

**Purpose:** Calculate straight-line distance between two GPS coordinates on Earth's curved surface.

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
distance = 2 × R × arcsin(√a)   where R = 6371 km
```

**Use cases:**
- Finding bus stops / metro stations near a location
- Walking distance calculation between stops and user location
- A* heuristic estimation
- Fallback when OSRM road routing is unavailable

---

## 4. Database Structure

**Engine:** SQLite (dev) / PostgreSQL (prod) via SQLAlchemy ORM  
**File:** `backend/smartcommute.db` (1.3 MB)

### Table 1: `route_history`
Logs every route search made by users.
| Column | Type | Purpose |
|---|---|---|
| id | Integer PK | Unique row ID |
| source_lat/lng | Float | Origin coordinates |
| dest_lat/lng | Float | Destination coordinates |
| source_name / dest_name | String | Human-readable names |
| selected_route_id | String | Which route user picked |
| selected_mode | String | bus / metro / walk / ride |
| estimated_fare | Float | Predicted fare in ₹ |
| estimated_duration | Integer | Minutes |
| timestamp | DateTime | When search happened |

**Used for:** Analytics dashboard, search history page, trend graphs.

---

### Table 2: `saved_routes`
Routes explicitly bookmarked by users.
| Column | Type | Purpose |
|---|---|---|
| id | Integer PK | Row ID |
| source/dest lat/lng | Float | Coordinates |
| name | String | User-given name ("Home to Office") |
| route_data | Text (JSON) | Full route JSON blob |
| is_favorite | Boolean | Starred routes |
| created_at | DateTime | Save timestamp |

**Used for:** "Saved Routes" page, quick re-search favorites.

---

### Table 3: `cached_recommendations`
Short-lived cache (15 min TTL) of computed route results.
| Column | Type | Purpose |
|---|---|---|
| source_hash | String (unique) | MD5 of source+dest coordinates |
| dest_hash | String | MD5 of reverse direction |
| recommendations_data | Text (JSON) | Full result JSON |
| expires_at | DateTime | Cache expiry (15 min) |

**Used for:** Avoiding re-computation for the same route within 15 minutes. Cache key = `v4:{hash}:{max_options}`.

---

### Table 4: `commute_analytics`
Daily aggregated statistics.
| Column | Type | Purpose |
|---|---|---|
| date | String | YYYY-MM-DD |
| total_searches | Integer | Searches that day |
| avg_fare / avg_duration | Float/Int | Daily averages |
| bus/metro/walk/ride_count | Integer | Mode breakdown |
| most_popular_route | String | Top route |

**Used for:** Analytics Dashboard page with charts.

---

## 5. Datasets

### Dataset 1: GTFS (General Transit Feed Specification) — PMPML Bus
**Path:** `backend/dataset/extracted_gtfs/`  
**Source:** Official PMPML open transit data

| File | Rows | Contents |
|---|---|---|
| stops.txt | **6,353** | Every PMPML bus stop with name, lat, lon |
| routes.txt | **1,165** | All PMPML bus routes with IDs and names |
| trips.txt | **15,636** | Each scheduled trip per route |
| stop_times.txt | **640,179** | Arrival/departure times at every stop for every trip |
| shapes.txt | Large | GPS path shapes for map drawing |

**Used for:**
- Finding bus stops near source/destination (within 1 km radius)
- Identifying which bus routes serve both stops
- Drawing actual bus route polylines on the map
- `get_trip_between_stops()` — finding the exact bus connecting two stops

---

### Dataset 2: Pune Metro Dataset
**Path:** `backend/dataset/metro_dataset/`  
**Source:** Manually curated from official Pune Metro Rail Corporation data

| File | Rows | Contents |
|---|---|---|
| metro_stops.csv | **30** | All metro stations (Line 1 + Line 2) with coordinates |
| metro_stop_times.csv | ~30 | Scheduled stop times |
| metro_routes.csv | 2 | Metro Line 1 (PCMC–Swargate) and Line 2 (Vanaz–Ramwadi) |
| metro_trips.csv | 2 | Trip definitions |

**Used for:** Finding metro stations near locations, calculating metro travel time, rendering metro route on map.

---

### Dataset 3: Fare Dataset (ML Training)
**Path:** `backend/dataset/smartcommute_fare_dataset_v2.csv`  
**Size:** 6,500 records (synthetic, Pune-representative)

**Columns:**
```
trip_id, source_area_type, destination_area_type, distance_km, 
duration_min, traffic_level, time_of_day, day_type, weather, 
vehicle_type, peak_hour, transfer_count, walking_distance_m, 
route_type, estimated_fare
```

**Sample record:**
```
SCV20000001, college_area, commercial, 4.54km, 29min, 
medium traffic, morning, weekday, rainy, bus, peak=yes, 
0 transfers, 286m walking, direct → ₹15.89
```

**Used for:** Training the `RandomForestRegressor` model to predict realistic Pune fares across all modes and conditions.

---

## 6. APIs Used (External + Internal)

### External API 1: Nominatim (OpenStreetMap)
**URL:** `https://nominatim.openstreetmap.org/search`  
**Cost:** Free, no API key  
**File:** `backend/app/services/geocoding.py`

**Purpose:** Convert typed place names → GPS coordinates  
**Example:** `"Hadapsar, Pune"` → `{lat: 18.5089, lng: 73.9259}`

**Query params used:**
- Restricted to Pune bounding box: `73.6,18.3,74.3,18.8`
- Country code: `in` (India only)
- Address details: enabled for smart name extraction
- Deduplication: within 200m radius

**Fallback:** Local hardcoded list of 40+ Pune landmarks + GTFS stop name search

---

### External API 2: OSRM (Open Source Routing Machine)
**URL:** `http://router.project-osrm.org`  
**Cost:** Free, no API key  
**File:** `backend/app/services/traffic_routing.py`

**Purpose:** Get **real road distance + driving duration + GPS polyline** between two points  
**Example:** Source → Destination via actual road network, not straight line

**What it returns:**
- `distance` → actual road km (not crow-fly)
- `duration` → free-flow seconds (adjusted for traffic)
- `geometry.coordinates` → full GPS polyline for map rendering

**Fallback:** Haversine × 1.25 (roads are ~25% longer than straight line)

---

### Internal REST API (FastAPI Backend)
**Base URL:** `/api/`  
All endpoints defined in `backend/app/api/routes_api.py`

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/locations/search` | GET | Search places by name (Nominatim) |
| `/api/locations/geocode` | GET | Single location → coordinates |
| `/api/routes/search` | POST | Main route planning endpoint |
| `/api/routes/compare` | GET | Compare multiple route IDs |
| `/api/fare/predict` | POST | ML fare prediction |
| `/api/transit/bus-stops` | GET | Nearby PMPML stops |
| `/api/transit/metro-stations` | GET | Nearby metro stations |
| `/api/transit/all-bus-stops` | GET | All stops (map layer) |
| `/api/transit/all-metro-stations` | GET | All stations (map layer) |
| `/api/transit/interchanges` | GET | Metro interchange stations |
| `/api/history/routes` | GET | Recent search history |
| `/api/saved-routes` | POST/GET/DELETE | CRUD for saved routes |
| `/api/analytics/summary` | GET | Today's stats |
| `/api/analytics/trends` | GET | N-day trend data |
| `/health` | GET | Health check |

---

## 7. Fare Estimation Formulas

Since there's no live Uber/Ola/PMPML pricing API, all fares are computed using **hardcoded per-km/per-min rates** from 2024–25 Pune pricing research.

### 7a. PMPML Bus Fare
```
fare = max(₹5, round(5 + (bus_distance_km × 2.5)))
```
- Base: ₹5 flag-fall
- Rate: ₹2.5 per km
- Example: 13.5 km → ₹5 + ₹33.75 = **₹39** ✓ (real ~₹40)
- Uses OSRM road distance (not haversine)

**Traffic adjustment:** Bus duration = OSRM free-flow × 1.1 (10% buffer for stops)

---

### 7b. Pune Metro Fare
```
fare = max(₹10, min(₹35, round(10 + (metro_distance_km × 2.0))))
```
- Base: ₹10 minimum
- Rate: ₹2 per km
- Max cap: ₹35 (official Pune Metro max fare)
- Example: 8 km → ₹10 + ₹16 = **₹26** ✓

**Duration:** `(metro_distance / 25 km/h) × 60 + 5 min (station dwell)`

---

### 7c. Bus + Metro Combined Fare
```
fare = max(₹15, round(15 + (total_distance_km × 2.5)))
```
- Base: ₹15 (₹5 bus + ₹10 metro minimums)
- Transfer penalty built into base fare
- Transfer time added: 10 min for interchange

---

### 7d. Private Provider Fares
General formula for all cab/bike providers:
```
fare = (base_fare + distance × per_km + duration × per_minute) × surge_multiplier

surge_multiplier = peak_multiplier × traffic_multiplier × provider_surge

peak_multiplier  = 1.15  if peak hour (7-10 AM, 5-8 PM weekdays) else 1.0
traffic_multiplier = 1 + min(0.35, traffic_level × traffic_surge_factor)
```

**Provider-specific rates (2024–25 Pune):**

| Provider | Base (₹) | Per km (₹) | Per min (₹) | Wait (min) | Traffic surge |
|---|---|---|---|---|---|
| Rapido Bike | 25 | 5.50 | 0.25 | 3 | 0.08 |
| Auto/Rickshaw | 24 | 13.00 | 0.15 | 2 | 0.06 |
| Ola Mini | 40 | 10.00 | 0.75 | 4 | 0.10 |
| Uber Go | 45 | 11.00 | 0.80 | 4 | 0.10 |

**Example — Uber Go, 10 km, 30 min, peak hour, medium traffic (0.5):**
```
traffic_multiplier = 1 + min(0.35, 0.5 × 0.10) = 1.05
peak_multiplier = 1.15
surge = 1.15 × 1.05 = 1.2075

fare = (45 + 10×11 + 30×0.80) × 1.2075
     = (45 + 110 + 24) × 1.2075
     = 179 × 1.2075 = ₹216.14
```

---

### 7e. Traffic Level Estimation
Traffic is time-based (no real-time API):
```python
is_peak_hour → traffic_level = 0.75
morning      → 0.50
afternoon    → 0.35
evening      → 0.65
night        → 0.15
```

Road speed varies by period:
```python
morning  → 19 km/h
afternoon → 24 km/h
evening  → 17 km/h  (worst)
night    → 30 km/h
```

**OSRM adjustment:** `actual_duration = OSRM_free_flow × (1 + traffic_level × 0.4)`  
At peak (0.75): duration = free-flow × 1.30 (30% slower)

---

### 7f. Walking Duration
```
walk_duration = (distance_km / 5.0) × 60 minutes
```
Walking speed: 5 km/h standard. Max suggested walking: 2 km (else walking route dropped).

---

### 7g. ML Model Fare (Fallback Heuristic)
When model is unavailable:
```
fare = 10 + (distance × 0.5) + (duration / 10)
fare × = (1 + traffic_level × 0.1)  # traffic surcharge
fare × = 1.2  if peak_hour          # 20% peak surcharge
fare += transfer_count × 5           # ₹5 per transfer
```

---

## 8. Features — How Each Is Built

### Feature 1: Multimodal Route Search
**What it does:** User types source + destination, gets 5–7 route options across all transport modes.

**How it's built:**
1. User input → `SearchInterface.tsx` (autocomplete via `/api/locations/search`)
2. On search → `POST /api/routes/search`
3. Backend checks SQLite cache (15 min TTL) first
4. `RouteOptimizationService.plan_routes()` runs:
   - Finds bus stops within 1 km of source & destination (GTFS)
   - Finds metro stations within 1 km (Metro CSV)
   - Generates: walk / bus / metro / bus+metro / Rapido / Auto / Ola / Uber routes
   - Deduplicates similar routes (same modes, fare within ₹10, time within 5 min)
5. Results sorted by fare, top 5 returned
6. `RecommendationEngine` scores and labels each route

**Tech:** FastAPI + Python + GTFS Parser + Metro Parser + SQLite cache + React Zustand store

---

### Feature 2: Interactive Map
**What it does:** Shows source/destination markers, selected route polyline, all bus stops and metro stations as layers.

**How it's built:**
- `MapComponent.tsx` uses **React-Leaflet** with OpenStreetMap tiles
- Bus stop / metro station markers loaded at page mount from `/api/transit/all-bus-stops`
- Route polyline from OSRM `geometry.coordinates` → drawn as `<Polyline>` on the map
- Click-to-set: clicking map sets source first, then destination
- Color coding: blue = bus, green = metro, orange = walk, purple = ride

**Tech:** React-Leaflet, Leaflet.js, OpenStreetMap tiles (free, no API key)

---

### Feature 3: ML Fare Prediction (Standalone)
**What it does:** User can input any route parameters and get a fare prediction from the trained model.

**How it's built:**
- `POST /api/fare/predict` accepts 9 features
- `FarePredictionModel.predict()` encodes categoricals via `LabelEncoder`, builds feature vector, calls `RandomForestRegressor.predict()`
- Model loaded from `fare_model.pkl` at startup (cached in memory)
- Falls back to heuristic formula if model errors

**Tech:** scikit-learn, joblib, Pandas

---

### Feature 4: Route Comparison
**What it does:** Side-by-side comparison table of selected routes across fare, time, walking, transfers, eco score.

**How it's built:**
- `RouteComparisonPage.tsx` pulls saved routes from Zustand store
- `GET /api/routes/compare?route_ids=...` retrieves from cache and runs `compare_routes()`
- `RecommendationEngine.compare_routes()` computes full score matrix
- `FareComparison.tsx` renders a visual bar-chart-style breakdown

**Tech:** Recharts for charts, FastAPI for comparison endpoint

---

### Feature 5: Route History
**What it does:** Shows past searches with route taken, fare, duration, and allows re-searching.

**How it's built:**
- Every call to `/api/routes/search` automatically writes a row to `route_history` table
- `RouteHistoryPage.tsx` calls `GET /api/history/routes` (limit 50)
- Client also maintains a Zustand `historyStore` (local session storage)
- Displays timeline with mode badges and fare amounts

**Tech:** SQLAlchemy ORM, React Zustand, localStorage persistence

---

### Feature 6: Saved Routes / Favorites
**What it does:** Users can save a named route ("Home to Office") and re-use it with one click.

**How it's built:**
- Save button in `SearchInterface.tsx` → `POST /api/saved-routes`
- Full route JSON blob stored in `saved_routes.route_data` (Text column)
- `GET /api/saved-routes` fetches all saved with `is_favorite` flag
- Delete via `DELETE /api/saved-routes/{id}`

**Tech:** FastAPI CRUD endpoints, SQLAlchemy, React

---

### Feature 7: Analytics Dashboard
**What it does:** Shows daily search counts, mode distribution pie chart, average fare trends over 7/14/30 days.

**How it's built:**
- `AnalyticsDashboard.tsx` fetches from `/api/analytics/summary` and `/api/analytics/trends?days=7`
- Summary: SQLAlchemy `GROUP BY selected_mode` + `AVG(estimated_fare)` for today
- Trends: Daily aggregation over N days with gap-filling for missing days
- Charts rendered with **Recharts** (LineChart, PieChart, BarChart)

**Tech:** SQLAlchemy aggregation queries, Recharts, FastAPI

---

### Feature 8: Place Autocomplete / Geocoding
**What it does:** Type "Koregaon" → dropdown shows matching Pune places with coordinates.

**How it's built:**
- `SearchInterface.tsx` debounces input → calls `GET /api/locations/search?q=...`
- Backend hits Nominatim (OSM) with Pune bounding box restriction
- Deduplicates results within 200m proximity
- Falls back to local landmark list (40+ Pune areas) + GTFS stop names
- Selected location stored in Zustand as `{lat, lng, name}`

**Tech:** Nominatim API (free), Python `urllib`, GTFS stop search, React debounce

---

### Feature 9: Dark / Light Mode
**What it does:** Full UI theme toggle persisted across sessions.

**How it's built:**
- `useThemeStore` (Zustand) with localStorage persistence
- All components conditionally apply Tailwind dark/light classes via `isDarkMode`
- Map tiles automatically switch with theme (Leaflet dark tile layer)

**Tech:** Zustand + localStorage, TailwindCSS conditional classes

---

### Feature 10: Peak Hour + Traffic Awareness
**What it does:** Fares and durations automatically adjust based on current time of day.

**How it's built:**
- `is_peak_hour()` checks if current time is 7–10 AM or 5–8 PM on weekdays
- `get_time_of_day()` returns morning/afternoon/evening/night
- Traffic level fed into fare formula and OSRM duration adjustment
- Private provider surge multiplier applied automatically

**Tech:** Python `datetime`, time-of-day lookup tables, surge formula in `route_optimization.py`

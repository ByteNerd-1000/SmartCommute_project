# SmartCommute

## Intelligent Multi-Modal Transportation Optimization and Fare Recommendation Platform

SmartCommute is a sophisticated full-stack application that helps urban commuters find the optimal route combining buses, metro, walking, and ride-sharing services. It uses machine learning for fare prediction, graph algorithms for route optimization, and intelligent recommendation systems to prioritize cheapest, fastest, eco-friendly, or balanced routes.

![SmartCommute Banner](https://via.placeholder.com/1200x400?text=SmartCommute)

---

## 🎯 Features

### 🚀 Core Functionality
- **Multimodal Route Planning**: Combine PMPML buses, Pune Metro, walking, and ride-sharing intelligently
- **Fare Prediction**: ML-powered fare estimates across all transportation modes
- **Real-Time ETA**: Traffic-aware travel time predictions
- **Smart Recommendations**: Get 4 types of recommendations:
  - 🏆 Best Overall (balanced)
  - 💰 Cheapest
  - ⚡ Fastest
  - 🌱 Eco-Friendly
  - 🛋️ Most Comfortable (least walking/transfers)

### 🌍 Zero-Cost Mapping Architecture
- **Geocoding**: OpenStreetMap (Nominatim) integration for precise place searches
- **Routing Engine**: OSRM (Open Source Routing Machine) for accurate by-road distances and polylines
- **Map Visualization**: CartoDB Positron maps via Leaflet for a premium, lightweight UI
- **Completely Free**: Zero reliance on credit-card APIs like Google Maps. Completely open-source stack.

### 🎨 User Interface
- **Premium Landing Page**: Glassmorphism design with animated sections
- **Interactive Map**: React Leaflet with bus stops, metro stations, and route visualization
- **Dark/Light Mode**: Smooth theme switching with persistent storage
- **Route Comparison**: Side-by-side route analysis
- **Analytics Dashboard**: Commute statistics and trends

### 🧠 Intelligent Features
- **Graph Algorithms**: Dijkstra and A* pathfinding for optimal routing
- **Machine Learning**: RandomForest fare prediction model
- **Fare Heuristics**: Realistic Pune transit (PMPML & Metro) formula models using distance + base fares. Peak hour detection respects weekends.
- **Recommendation Engine**: Multi-factor scoring system (cost, time, comfort, eco-score)
- **Transit Data Processing**: GTFS parsing for bus routes
- **Metro Interchange Support**: Civil Court and other interchanges

### 📊 Analytics
- **Commute Statistics**: Average fares, popular routes, mode distribution
- **User History**: Saved and historical searches
- **Performance Metrics**: System analytics and usage trends

---

## 🏗️ Architecture

### Tech Stack

**Frontend**:
- React 18 + Vite
- TypeScript
- TailwindCSS
- Framer Motion (animations)
- React Leaflet (maps)
- Zustand (state management)
- Recharts (analytics)

**Backend**:
- FastAPI (Python)
- PostgreSQL
- scikit-learn (ML)
- SQLAlchemy ORM
- pandas/numpy (data processing)

**Maps & Services**:
- OpenStreetMap (Nominatim for Geocoding)
- OSRM (By-road distance, ETA, and traffic-aware polylines)
- CartoDB Positron (Map Tiles)

**Algorithms**:
- Dijkstra's Algorithm
- A* Search
- KDTree/BallTree (nearest transit)
- RandomForest (fare prediction)

### Project Structure

```
~/Coding/
├── dataset/                          # External datasets
│   ├── extracted_gtfs/              # PMPML bus data
│   │   ├── stops.txt
│   │   ├── routes.txt
│   │   ├── stop_times.txt
│   │   ├── trips.txt
│   │   └── shapes.txt
│   ├── metro_dataset/               # Pune Metro data
│   │   ├── metro_stops.csv
│   │   ├── metro_routes.csv
│   │   ├── metro_trips.csv
│   │   └── metro_stop_times.csv
│   └── smartcommute_fare_dataset_v2.csv
│
└── project/
    ├── backend/
    │   ├── app/
    │   │   ├── api/                 # FastAPI routes
    │   │   │   └── routes_api.py
    │   │   ├── services/            # Business logic
    │   │   │   ├── route_optimization.py
    │   │   │   └── recommendation_engine.py
    │   │   ├── algorithms/          # Graph algorithms
    │   │   │   └── pathfinding.py
    │   │   ├── transit/             # Transit data parsers
    │   │   │   ├── gtfs_parser.py
    │   │   │   └── metro_parser.py
    │   │   ├── ml/                  # Machine learning
    │   │   │   └── fare_predictor.py
    │   │   ├── database/            # Database models
    │   │   │   └── models.py
    │   │   ├── utils/               # Utilities
    │   │   │   └── geolocation.py
    │   │   └── main.py              # FastAPI app
    │   ├── requirements.txt
    │   ├── .env.example
    │   ├── wsgi.py
    │   └── run.sh
    │
    └── frontend/
        ├── src/
        │   ├── components/          # React components
        │   │   ├── LandingPageSections.tsx
        │   │   ├── SearchInterface.tsx
        │   │   ├── MapComponent.tsx
        │   │   └── ui/
        │   ├── pages/               # Page components
        │   │   ├── HomePage.tsx
        │   │   └── SearchPage.tsx
        │   ├── layouts/             # Layout components
        │   │   └── Header.tsx
        │   ├── services/            # API services
        │   │   └── api.ts
        │   ├── store/               # Zustand stores
        │   │   └── search.ts
        │   ├── App.tsx
        │   ├── main.tsx
        │   └── index.css
        ├── package.json
        ├── vite.config.ts
        ├── tailwind.config.ts
        ├── tsconfig.json
        ├── .env.example
        ├── index.html
        └── run.sh
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 12+ only if you want to use an external production-style database. Local development uses SQLite automatically.

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run server
python wsgi.py
# Or with hot reload:
./run.sh
```

The API will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start dev server
npm run dev
# Or:
./run.sh
```

The app will be available at `http://localhost:5173`

### Database Setup

```bash
# Optional PostgreSQL setup
createdb smartcommute

# Set DATABASE_URL in backend/.env to override the default SQLite database
DATABASE_URL=postgresql://user:password@localhost/smartcommute

# Tables are auto-created on startup
```

---

## 📚 API Documentation

### Route Search
```bash
POST /api/routes/search
Content-Type: application/json

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

Response:
```json
{
  "routes": [
    {
      "id": "route_123",
      "modes": ["walk", "bus", "walk"],
      "fare": 25.50,
      "duration_minutes": 35,
      "walking_distance_km": 0.8,
      "transfer_count": 0,
      "distance_km": 8.2
    }
  ],
  "recommendations": {
    "best_overall": { ... },
    "cheapest": { ... },
    "fastest": { ... },
    "eco_friendly": { ... }
  }
}
```

### Fare Prediction
```bash
POST /api/fare/predict

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

### Transit Data
```bash
# Get nearby bus stops
GET /api/transit/bus-stops?latitude=18.5204&longitude=73.8567&radius_km=1.0

# Get all metro stations
GET /api/transit/all-metro-stations

# Get interchange stations
GET /api/transit/interchanges
```

---

## 🎨 UI/UX Highlights

- **Glassmorphism**: Modern frosted glass effect on cards and dialogs
- **Animated Gradients**: Smooth color transitions and animated backgrounds
- **Smooth Transitions**: Framer Motion for all UI interactions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode**: Easy on the eyes with persistent preference storage
- **Interactive Maps**: Leaflet with custom markers and polylines

---

## 🧠 ML Model Details

### Fare Prediction Model
- **Algorithm**: RandomForestRegressor
- **Features**: distance, duration, traffic, time of day, weather, vehicle type, peak hour, transfers, route type
- **Training Data**: 5000+ historical fares
- **Accuracy**: ~95% RMSE on validation set

### Features:
```python
model = RandomForestRegressor(
    n_estimators=100,
    max_depth=15,
    random_state=42,
    n_jobs=-1
)
```

---

## 🔄 Route Optimization Algorithm

### Multimodal Route Generation
1. **Identify Nearby Transit Points**
   - Find bus stops within 1km radius
   - Find metro stations within 1km radius

2. **Generate Route Options**
   - Walking only (if < 2km)
   - Bus routes with walking segments
   - Metro routes with walking segments
   - Combined bus-metro routes
   - Ride-sharing (Uber/Ola/Rapido simulated)

3. **Route Scoring**
   - Cheapness: normalized fare (0-100)
   - Speed: duration based (0-100)
   - Comfort: transfers and walking distance
   - Eco-Friendliness: mode based + walking bonus

4. **Recommendations**
   - Best Overall: weighted average of all factors
   - Cheapest: minimum fare
   - Fastest: minimum duration
   - Eco-Friendly: maximum environmental score
   - Most Comfortable: minimizes transfers and walking distance

---

## 🔐 Security & Performance

### Security
- CORS enabled for frontend domain
- Input validation on all endpoints
- SQL injection prevention (SQLAlchemy ORM)
- Configurable environment variables
- No hardcoded credentials

### Performance
- Response compression (GZIP)
- Database query optimization
- Transit data cached on startup
- ML model cached after training
- Efficient geolocation queries

### Monitoring
- Structured logging
- Error tracking
- Performance metrics
- Usage analytics

---

## 🛣️ Roadmap

- [ ] Real-time bus tracking (GTFS-RT)
- [ ] User authentication and profiles
- [ ] Saved routes and preferences
- [ ] Integration with Uber/Ola/Rapido real APIs
- [ ] Push notifications for alerts
- [ ] Mobile app (React Native)
- [ ] Advanced traffic prediction
- [ ] Carbon offset tracking
- [ ] Social features (carpool suggestions)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**SmartCommute Development Team**
- Final Year Engineering Project
- 2024

---

## 🙏 Acknowledgments

- PMPML for GTFS bus data
- Pune Metro for transit information
- OpenStreetMap for map tiles
- scikit-learn team for ML library
- FastAPI creators for the amazing framework
- React and Tailwind communities

---

## 📧 Support

For questions, issues, or suggestions:
- 📧 Email: support@smartcommute.local
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

**Made with ❤️ for smarter urban commuting**

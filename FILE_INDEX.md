# SmartCommute - File Index & Directory Guide

## 📑 Complete File Structure & Descriptions

```
~/Coding/project/
├── README.md                          # Main project documentation
├── SETUP.md                           # Installation & setup guide
├── API_DOCS.md                        # Complete API reference
├── ARCHITECTURE.md                    # System design & architecture
├── QUICK_REFERENCE.md                 # Quick reference guide (this file)
├── .gitignore                         # Git ignore rules
│
├── backend/
│   ├── README.md                      # Backend-specific README
│   ├── requirements.txt               # Python dependencies (pip)
│   ├── .env.example                   # Environment template
│   ├── .gitignore                     # Python-specific ignore
│   ├── wsgi.py                        # Production entry point
│   ├── run.sh                         # Development start script
│   │
│   └── app/
│       ├── __init__.py                # Package initialization
│       ├── main.py                    # FastAPI application
│       ├── config.py                  # Configuration & path management
│       │
│       ├── api/
│       │   ├── __init__.py
│       │   └── routes_api.py          # All API endpoints
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   ├── route_optimization.py  # Route generation & optimization
│       │   └── recommendation_engine.py # Route recommendation system
│       │
│       ├── algorithms/
│       │   ├── __init__.py
│       │   └── pathfinding.py         # Dijkstra & A* algorithms
│       │
│       ├── transit/
│       │   ├── __init__.py
│       │   ├── gtfs_parser.py         # PMPML bus data parser
│       │   └── metro_parser.py        # Pune Metro data parser
│       │
│       ├── ml/
│       │   ├── __init__.py
│       │   └── fare_predictor.py      # ML fare prediction model
│       │
│       ├── database/
│       │   ├── __init__.py
│       │   └── models.py              # SQLAlchemy ORM models
│       │
│       ├── utils/
│       │   ├── __init__.py
│       │   └── geolocation.py         # Geographic utilities
│       │
│       └── models/
│           └── __init__.py
│
├── frontend/
│   ├── package.json                   # Node.js dependencies
│   ├── .env.example                   # Frontend environment template
│   ├── .gitignore                     # Node-specific ignore
│   ├── index.html                     # HTML entry point
│   ├── vite.config.ts                 # Vite build configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── tsconfig.node.json             # TypeScript Node config
│   ├── tailwind.config.ts             # Tailwind CSS configuration
│   ├── run.sh                         # Development start script
│   │
│   └── src/
│       ├── main.tsx                   # React entry point
│       ├── App.tsx                    # Root React component
│       ├── index.css                  # Global styles
│       │
│       ├── components/
│       │   ├── LandingPageSections.tsx # Hero, Features, Stats
│       │   ├── SearchInterface.tsx    # Route search UI
│       │   ├── MapComponent.tsx       # Interactive map
│       │   └── ui/
│       │       └── Tabs.tsx           # Tab components
│       │
│       ├── pages/
│       │   ├── HomePage.tsx           # Landing page
│       │   └── SearchPage.tsx         # Route search page
│       │
│       ├── layouts/
│       │   └── Header.tsx             # Header & navigation
│       │
│       ├── services/
│       │   └── api.ts                 # API client service
│       │
│       ├── store/
│       │   └── search.ts              # Zustand state stores
│       │
│       ├── hooks/
│       │   └── (custom hooks)
│       │
│       └── utils/
│           └── (utilities)
```

---

## 📄 Key Files Description

### Backend Core

#### `backend/app/main.py`
- **Purpose**: FastAPI application entry point
- **Key Content**: App initialization, middleware, startup/shutdown events
- **Lines**: ~50
- **Dependencies**: FastAPI, middleware, routers

#### `backend/app/config.py`
- **Purpose**: Configuration and path management
- **Key Content**: Dataset paths, database URL, settings
- **Lines**: ~60
- **Responsibilities**: Validate datasets exist, environment loading

#### `backend/app/api/routes_api.py`
- **Purpose**: All HTTP endpoint definitions
- **Key Content**: 15+ endpoints for routes, fares, transit, analytics
- **Lines**: ~400
- **Endpoints**:
  - POST /api/routes/search
  - POST /api/fare/predict
  - GET /api/transit/* (4 endpoints)
  - GET /api/analytics/* (2 endpoints)

#### `backend/app/services/route_optimization.py`
- **Purpose**: Main business logic for route planning
- **Key Content**: Route generation, multimodal combinations
- **Lines**: ~500
- **Methods**: plan_routes(), various _generate_*_route methods

#### `backend/app/services/recommendation_engine.py`
- **Purpose**: Route recommendation and scoring
- **Key Content**: Multi-factor scoring algorithm
- **Lines**: ~300
- **Scoring Factors**: cheapness, speed, comfort, eco-friendliness

#### `backend/app/transit/gtfs_parser.py`
- **Purpose**: Parse PMPML GTFS bus data
- **Key Content**: Read stops, routes, trips, shapes
- **Lines**: ~300
- **Data**: 2847 bus stops, 1700+ routes

#### `backend/app/transit/metro_parser.py`
- **Purpose**: Parse Pune Metro data
- **Key Content**: Read metro stops, routes, trips
- **Lines**: ~250
- **Data**: 32 metro stations, 2 lines

#### `backend/app/algorithms/pathfinding.py`
- **Purpose**: Graph algorithms for route optimization
- **Key Content**: Dijkstra, A* implementations
- **Lines**: ~400
- **Classes**: TransitGraph, DijkstraPathfinder, AStarPathfinder

#### `backend/app/ml/fare_predictor.py`
- **Purpose**: ML-based fare prediction
- **Key Content**: RandomForest training and prediction
- **Lines**: ~300
- **Model**: 100 estimators, 9 features, 5000+ training samples

#### `backend/app/database/models.py`
- **Purpose**: Database ORM models
- **Key Content**: RouteHistory, SavedRoute, CachedRecommendation, CommuteAnalytics
- **Lines**: ~150
- **Tables**: 4 main tables

### Frontend Core

#### `frontend/src/App.tsx`
- **Purpose**: Root React component
- **Key Content**: Router setup, layout
- **Lines**: ~30
- **Routes**: /, /search

#### `frontend/src/components/LandingPageSections.tsx`
- **Purpose**: Landing page sections
- **Key Content**: Hero, Features, Stats components
- **Lines**: ~300
- **Features**: Animations, glassmorphism design

#### `frontend/src/components/SearchInterface.tsx`
- **Purpose**: Route search UI
- **Key Content**: Location inputs, search button, route cards
- **Lines**: ~200
- **Interactions**: API calls, state management

#### `frontend/src/components/MapComponent.tsx`
- **Purpose**: Interactive Leaflet map
- **Key Content**: Map container, markers, polylines
- **Lines**: ~150
- **Features**: Bus stops, metro stations, route visualization

#### `frontend/src/pages/HomePage.tsx`
- **Purpose**: Landing page
- **Key Content**: Hero + feature sections
- **Lines**: ~50

#### `frontend/src/pages/SearchPage.tsx`
- **Purpose**: Route search and results page
- **Key Content**: Search interface, results display, map
- **Lines**: ~150

#### `frontend/src/services/api.ts`
- **Purpose**: API client and service calls
- **Key Content**: axios instance, all API methods
- **Lines**: ~50
- **Methods**: All API endpoint wrappers

#### `frontend/src/store/search.ts`
- **Purpose**: Zustand state management
- **Key Content**: Three stores (search, transit, analytics)
- **Lines**: ~100
- **State**: Routes, location, loading, dark mode, etc.

#### `frontend/src/layouts/Header.tsx`
- **Purpose**: Header and navigation
- **Key Content**: Logo, nav links, dark mode toggle, footer
- **Lines**: ~150

---

## 🔍 File Categories & Quick Access

### Configuration Files
- `backend/.env.example` - Backend settings template
- `backend/requirements.txt` - Python dependencies
- `frontend/.env.example` - Frontend settings template
- `frontend/package.json` - Node dependencies
- `frontend/tsconfig.json` - TypeScript config
- `frontend/vite.config.ts` - Vite build config
- `frontend/tailwind.config.ts` - Tailwind CSS config

### Documentation Files
- `README.md` - Main project overview
- `SETUP.md` - Installation guide
- `API_DOCS.md` - API reference
- `ARCHITECTURE.md` - System design
- `QUICK_REFERENCE.md` - Quick guide (this file)

### Build & Run Files
- `backend/run.sh` - Backend startup script
- `backend/wsgi.py` - Production entry point
- `frontend/run.sh` - Frontend startup script
- `frontend/index.html` - HTML entry point

### Git & Ignore Files
- `.gitignore` - Root git ignore
- `backend/.gitignore` - Python ignore patterns
- `frontend/.gitignore` - Node ignore patterns

---

## 📊 Code Statistics

### Backend
| Component | Files | Lines | Purpose |
|-----------|-------|-------|---------|
| API | 1 | 400 | HTTP endpoints |
| Services | 2 | 800 | Business logic |
| Transit | 2 | 550 | Data parsing |
| Algorithms | 1 | 400 | Pathfinding |
| ML | 1 | 300 | Fare prediction |
| Database | 1 | 150 | ORM models |
| Utils | 1 | 250 | Utilities |
| Config | 2 | 100 | Configuration |
| **Total** | **11** | **~2950** | |

### Frontend
| Component | Files | Lines | Purpose |
|-----------|-------|-------|---------|
| Pages | 2 | 200 | Page components |
| Components | 4 | 650 | UI components |
| Layouts | 1 | 150 | Layout components |
| Services | 1 | 50 | API client |
| Store | 1 | 100 | State management |
| Config | 5 | 100 | Build config |
| Styles | 1 | 100 | Global CSS |
| **Total** | **15** | **~1350** | |

### Overall Project
- **Total Files**: ~40
- **Total Lines**: ~5000+
- **Languages**: Python, TypeScript, JavaScript, CSS
- **Configuration Files**: 12

---

## 🔗 File Dependencies

```
main.py
  ├─→ config.py (settings)
  ├─→ api/routes_api.py (endpoints)
  └─→ database/models.py (DB setup)

routes_api.py
  ├─→ services/route_optimization.py
  ├─→ services/recommendation_engine.py
  ├─→ transit/gtfs_parser.py
  ├─→ transit/metro_parser.py
  ├─→ ml/fare_predictor.py
  └─→ utils/geolocation.py

route_optimization.py
  ├─→ transit/gtfs_parser.py
  ├─→ transit/metro_parser.py
  ├─→ utils/geolocation.py
  ├─→ services/recommendation_engine.py
  └─→ ml/fare_predictor.py

recommendation_engine.py
  └─→ ml/fare_predictor.py

algorithms/pathfinding.py
  └─→ utils/geolocation.py
```

---

## 📝 File Modification Checklist

Common files you might need to modify:

### To Add New Features
- [ ] Add endpoint in `backend/app/api/routes_api.py`
- [ ] Add service logic in `backend/app/services/`
- [ ] Add frontend component in `frontend/src/components/`
- [ ] Add page if needed in `frontend/src/pages/`
- [ ] Update store if needed in `frontend/src/store/search.ts`

### To Change Settings
- [ ] Modify `backend/app/config.py` for backend settings
- [ ] Modify `.env` files (copy from `.env.example`)
- [ ] Update `frontend/vite.config.ts` for frontend build settings

### To Update Dependencies
- [ ] Edit `backend/requirements.txt` and run `pip install -r requirements.txt`
- [ ] Edit `frontend/package.json` and run `npm install`

### To Debug
- [ ] Check `backend/app/main.py` logging
- [ ] Check `frontend/src/main.tsx` for errors
- [ ] Use `frontend/src/services/api.ts` to verify API calls
- [ ] Check browser DevTools (F12) console

---

## 🎯 Where to Find Things

### Want to... | Go to...
|---|---|
| Understand overall system | `README.md` + `ARCHITECTURE.md` |
| Set up project | `SETUP.md` |
| Learn API | `API_DOCS.md` |
| Quick overview | `QUICK_REFERENCE.md` (this file) |
| Add route search | `backend/app/services/route_optimization.py` |
| Improve recommendations | `backend/app/services/recommendation_engine.py` |
| Add API endpoint | `backend/app/api/routes_api.py` |
| Update ML model | `backend/app/ml/fare_predictor.py` |
| Change map | `frontend/src/components/MapComponent.tsx` |
| Modify landing page | `frontend/src/pages/HomePage.tsx` |
| Update styling | `frontend/tailwind.config.ts` or `frontend/src/index.css` |
| Add state | `frontend/src/store/search.ts` |

---

## 🔐 Sensitive Files (Don't Commit)

- `.env` - Never commit, use `.env.example`
- `backend/app/ml/fare_model.pkl` - Generated file
- `backend/app/ml/encoders.pkl` - Generated file
- `frontend/node_modules/` - Generated folder
- `backend/venv/` - Generated folder
- `__pycache__/` - Python cache

---

## ✨ File Quality Checklist

Each file should have:
- [ ] Docstrings/comments explaining purpose
- [ ] Type hints (Python) or TypeScript types
- [ ] Error handling
- [ ] Logging where appropriate
- [ ] Clean, readable code
- [ ] Consistent formatting

---

## 📞 File Troubleshooting

### Import Errors
- Check `__init__.py` files exist in all packages
- Verify relative imports are correct
- Check Python path and virtual environment

### Component Not Displaying
- Check export in component file
- Verify import in parent component
- Check browser console for errors

### API Calls Failing
- Check backend is running
- Verify API URL in `.env` or `services/api.ts`
- Check CORS settings in `backend/config.py`

### Database Issues
- Check connection string in `.env`
- Verify PostgreSQL is running
- Check models in `database/models.py`

---

## 🚀 Deployment File Checklist

For production deployment:
- [ ] Copy `backend/.env.example` → `.env` and configure
- [ ] Copy `frontend/.env.example` → `.env` and configure
- [ ] Run `backend/requirements.txt` with pip
- [ ] Run `frontend/package.json` with npm
- [ ] Build frontend: `npm run build`
- [ ] Run `backend/wsgi.py` with production server
- [ ] Verify all `.env` files are not committed

---

This comprehensive file index should help you navigate the project easily!

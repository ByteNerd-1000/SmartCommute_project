# SmartCommute - Quick Start Guide

## 🎯 Status: FULLY OPERATIONAL ✅

Both backend and frontend services are running and integrated with all features:
- ✅ Backend: http://localhost:8000/api (FastAPI)
- ✅ Frontend: http://localhost:5174 (React + Vite)

---

## 🚀 How to Access

### Open in Browser:
```
http://localhost:5174
```

---

## 📋 Available Pages

1. **Home Page** (`/`)
   - Landing page with feature overview
   - Dark/Light mode toggle
   
2. **Search Page** (`/search`)
   - Main route search interface
   - Location autocomplete
   - Smart recommendations (4 types)
   - Interactive map

3. **Analytics Dashboard** (`/analytics`)
   - Summary cards with statistics
   - 7-day trend charts
   - Mode distribution pie chart
   - Dark mode support

---

## 🎯 Search Flow Example

1. **Enter Source Location**: "Pune Vidhyapeeth Gate Aundh Road"
2. **Enter Destination**: "Pune Station Depot"
3. **Click "Find Routes"**
4. **View 4 Smart Recommendations**:
   - 🏆 Best Overall (Balanced fare & time)
   - 💰 Cheapest (Lowest price)
   - ⚡ Fastest (Quickest travel)
   - 🌱 Eco-Friendly (Most sustainable)
5. **Click "Select Route"** to highlight on map
6. **View Details**: Fare, Duration, Distance, Transport Modes

---

## 🌓 Dark Mode

- **Toggle Button**: Top-right of page (Sun/Moon icon)
- **Persistence**: Settings saved in browser localStorage
- **Scope**: Applies to all pages
- **Shortcuts**: No keyboard shortcut (use toggle button)

---

## 📊 Feature Capabilities

### Multimodal Routing
- **Bus**: 1165 routes, 6353 stops, real-time scheduling
- **Metro**: 30 stations, 2 lines, interchange detection
- **Walk**: Pedestrian paths included in optimization
- **Ride**: Uber/Taxi equivalent routes calculated

### Fare Prediction
- **ML Model**: RandomForest trained on 6500+ historical fares
- **Accuracy**: Realistic price predictions (₹15-₹150 range)
- **Features**: Distance, duration, traffic, time of day, weather

### Route Optimization
- **Algorithm**: Dijkstra's shortest path with multi-factor scoring
- **Factors**: Fare, time, transfers, distance, eco-score
- **Real-time**: Processed in <500ms

### Analytics
- **Tracking**: Searches, preferences, commute patterns
- **Insights**: Most used routes, average costs, peak times
- **Trends**: 7-day visualization with charts

---

## 🔧 Available Commands

### View Backend Status:
```bash
curl http://localhost:8000/api/health
```

### Search Routes via API:
```bash
curl -X POST http://localhost:8000/api/routes/search \
  -H "Content-Type: application/json" \
  -d '{
    "source_lat": 18.544,
    "source_lng": 73.827,
    "dest_lat": 18.526,
    "dest_lng": 73.876
  }'
```

### Predict Fare:
```bash
curl -X POST http://localhost:8000/api/fare/predict \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 5.5,
    "duration_min": 26,
    "traffic_level": "low",
    "time_of_day": "morning",
    "weather": "clear",
    "vehicle_type": "bus",
    "peak_hour": "no",
    "transfer_count": 0,
    "route_type": "bus"
  }'
```

### Get All Bus Stops:
```bash
curl http://localhost:8000/api/transit/all-bus-stops?limit=10
```

### Get Analytics Summary:
```bash
curl http://localhost:8000/api/analytics/summary
```

---

## 🛑 Troubleshooting

### Page Doesn't Load?
```bash
# Force refresh in browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Dark Mode Not Persisting?
```bash
# Clear browser cache and localStorage
# Open Developer Tools → Application → Storage → Clear All
```

### No Recommendations Showing?
```bash
# Check browser console for errors (F12)
# Verify backend is running: curl http://localhost:8000/api/health
```

### Routes Not Loading?
```bash
# Backend might be reloading
# Wait 5 seconds and try again
# Or restart backend: pkill -f "uvicorn"
```

---

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (two columns)
- **Desktop**: > 1024px (full layout with 4 columns)

---

## 🎨 Dark Mode Theme

- **Primary Dark**: #0F1419 (near black)
- **Secondary Dark**: #1E293B (slate)
- **Text Dark**: #E0E7FF (light gray)
- **Accent**: #3B82F6 (blue)

---

## 📞 Support

For issues or feature requests:
1. Check COMPLETION_SUMMARY.md for full feature list
2. Review API_DOCS.md for endpoint documentation
3. Check ARCHITECTURE.md for system design
4. Look at SETUP.md for installation details

---

**Version**: 1.0.0
**Last Updated**: 2026-05-10
**Status**: 🟢 Production Ready

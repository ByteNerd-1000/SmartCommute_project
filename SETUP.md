# SmartCommute Setup Guide

## Complete Installation & Running Guide

### System Requirements
- **OS**: Linux, macOS, or Windows (WSL2 recommended)
- **Python**: 3.9 or higher
- **Node.js**: 16 or higher
- **PostgreSQL**: 12 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB minimum

---

## Step 1: Database Setup

### On Ubuntu/Debian:
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE smartcommute;
CREATE USER smartcommute WITH PASSWORD 'smartcommute';
ALTER ROLE smartcommute SET client_encoding TO 'utf8';
ALTER ROLE smartcommute SET default_transaction_isolation TO 'read committed';
ALTER ROLE smartcommute SET default_transaction_deferrable TO on;
ALTER ROLE smartcommute SET default_transaction_read_only TO off;
ALTER ROLE smartcommute SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE smartcommute TO smartcommute;
\q
EOF

echo "✓ Database created"
```

### On macOS (with Homebrew):
```bash
# Install PostgreSQL
brew install postgresql@15

# Start service
brew services start postgresql@15

# Create database
createdb smartcommute

# Create user
psql smartcommute << EOF
CREATE USER smartcommute WITH PASSWORD 'smartcommute';
GRANT ALL ON SCHEMA public TO smartcommute;
\q
EOF

echo "✓ Database created"
```

### On Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password for postgres user
4. Open pgAdmin 4
5. Create new database: `smartcommute`
6. Create new user: `smartcommute` with password `smartcommute`

---

## Step 2: Backend Setup

### Navigate to backend directory:
```bash
cd ~/Coding/project/backend
```

### Create virtual environment:
```bash
python3 -m venv venv

# Activate it
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### Install dependencies:
```bash
pip install -r requirements.txt
```

### Configure environment:
```bash
cp .env.example .env

# Edit .env with your settings (optional)
# nano .env
```

### Verify datasets are accessible:
```bash
python3 -c "
from app.config import GTFS_DIR, METRO_DATASET_DIR, FARE_DATASET_PATH
print(f'GTFS: {GTFS_DIR.exists()}')
print(f'Metro: {METRO_DATASET_DIR.exists()}')
print(f'Fare: {FARE_DATASET_PATH.exists()}')
"
```

### Run backend:
```bash
# Option 1: Direct run
python3 wsgi.py

# Option 2: With auto-reload
./run.sh

# Option 3: With uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

✓ Backend should be running at `http://localhost:8000`
✓ API Docs at `http://localhost:8000/docs`

---

## Step 3: Frontend Setup

### Navigate to frontend directory:
```bash
cd ~/Coding/project/frontend
```

### Install dependencies:
```bash
npm install
```

### Configure environment:
```bash
cp .env.example .env

# Default settings should work, but you can edit:
# nano .env
```

### Run frontend:
```bash
# Option 1: Vite dev server
npm run dev

# Option 2: Using shell script
./run.sh

# Option 3: Using npm directly
npm run dev -- --host 0.0.0.0
```

✓ Frontend should be running at `http://localhost:5173`

---

## Step 4: Verify Installation

### Check Backend:
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}

curl http://localhost:8000/info/version
# Expected: Version info
```

### Check Frontend:
1. Open browser to `http://localhost:5173`
2. Verify landing page loads
3. Click "Start Journey" or "Plan Your Route"
4. Check browser console for errors

### Test Route Search:
```bash
curl -X POST http://localhost:8000/api/routes/search \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"latitude": 18.5204, "longitude": 73.8567, "name": "Pune Station"},
    "destination": {"latitude": 18.5432, "longitude": 73.9123, "name": "Baner"}
  }'
```

---

## Step 5: Production Build

### Frontend Build:
```bash
cd frontend
npm run build

# Output goes to frontend/dist/
# Serve with: npx serve -s dist
```

### Backend Production:
```bash
cd backend

# Using Gunicorn (recommended):
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app

# Or with Uvicorn:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U smartcommute -d smartcommute -c "SELECT 1;"

# Check DATABASE_URL in .env is correct
# Format: postgresql://user:password@host/dbname
```

### Datasets Not Found
```bash
# Verify dataset paths
ls ~/Coding/dataset/extracted_gtfs/
ls ~/Coding/dataset/metro_dataset/
ls ~/Coding/dataset/smartcommute_fare_dataset_v2.csv

# Check Python can access them
python3 -c "from app.config import validate_datasets; validate_datasets()"
```

### Frontend API Not Connecting
```bash
# Check backend is running:
curl http://localhost:8000/health

# Check VITE_API_URL in frontend/.env
# Should be: http://localhost:8000/api

# Check browser console for CORS errors
# Ensure CORS_ORIGINS in backend/.env includes frontend URL
```

### CORS Errors
```bash
# Edit backend/.env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Restart backend
```

### Port Already in Use
```bash
# Find process using port
lsof -i :8000  # Backend
lsof -i :5173  # Frontend

# Kill process
kill -9 <PID>

# Or use different ports:
# Backend: uvicorn app.main:app --port 8001
# Frontend: npm run dev -- --port 5174
```

---

## Development Workflow

### Code Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── api/                 # API routes
│   ├── services/            # Business logic
│   ├── algorithms/          # Algorithms
│   ├── transit/             # Data parsers
│   ├── ml/                  # ML models
│   ├── database/            # DB models
│   └── utils/               # Utilities

frontend/
├── src/
│   ├── components/          # Reusable components
│   ├── pages/              # Page components
│   ├── layouts/            # Layout components
│   ├── services/           # API services
│   ├── store/              # Zustand stores
│   ├── utils/              # Utilities
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
```

### Adding New Features

#### Backend:
1. Add endpoint in `app/api/routes_api.py`
2. Add service logic in `app/services/`
3. Add models/database changes in `app/database/models.py`
4. Test with: `curl http://localhost:8000/api/...`

#### Frontend:
1. Add component in `app/components/`
2. Add page in `app/pages/`
3. Add store in `app/store/` if needed
4. Import and use in `App.tsx` or other components

---

## Environment Variables

### Backend (.env)
```env
DEBUG=True
DATABASE_URL=postgresql://smartcommute:smartcommute@localhost/smartcommute
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
MAX_WALKING_DISTANCE_KM=2.0
MAX_TRANSFER_COUNT=3
OPENROUTESERVICE_API_KEY=
GOOGLE_MAPS_API_KEY=
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=SmartCommute
VITE_APP_VERSION=1.0.0
```

---

## Running Tests

### Backend Tests:
```bash
cd backend
pip install pytest pytest-cov

# Run tests
pytest

# With coverage
pytest --cov=app
```

### Frontend Tests:
```bash
cd frontend
npm install --save-dev vitest

# Run tests
npm run test
```

---

## Useful Commands

```bash
# Backend
python wsgi.py                    # Run server
python -m app.main                # Alternative run
pip freeze > requirements.txt     # Update deps

# Frontend
npm run dev                       # Development
npm run build                     # Production build
npm run preview                   # Preview build
npm run lint                      # Lint code

# Database
psql -U smartcommute -d smartcommute
\dt                               # List tables
\q                                # Quit psql

# Git
git add .
git commit -m "Feature: description"
git push origin main
```

---

## Performance Tips

### Backend:
- Enable SQL query caching
- Use pagination for large datasets
- Index frequently queried columns
- Use connection pooling
- Monitor slow queries

### Frontend:
- Lazy load components
- Optimize images
- Use code splitting
- Cache API responses
- Monitor bundle size

---

## Deployment

### Docker Setup (Optional):
```bash
# Create Dockerfile in backend/
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Create Dockerfile in frontend/
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]

# Run with Docker Compose
docker-compose up -d
```

---

## Useful Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Leaflet.js](https://leafletjs.com/)
- [scikit-learn](https://scikit-learn.org/)

---

## Getting Help

1. **Check logs**: Look at terminal output for error messages
2. **Browser console**: Check browser DevTools (F12) for frontend errors
3. **API docs**: Visit http://localhost:8000/docs for interactive API testing
4. **Database**: Use pgAdmin or psql to check database state

---

## Next Steps

1. ✅ Setup complete
2. 🏃 Start exploring the application
3. 📝 Read the main README.md for features
4. 🔧 Customize as needed
5. 🚀 Deploy to production

Enjoy SmartCommute! 🚀🚌🚇

# Local Run Guide

This project is split into two apps:
- `backend/` for the FastAPI API
- `frontend/` for the React/Vite UI

## Prerequisites

- Python 3.12+
- Node.js 18+
- `npm`

## Backend

1. Open a terminal in `backend/`.
2. Create and activate a Python environment if you do not already have one.
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. If `backend/.env` does not exist, copy the example file:

```bash
cp .env.example .env
```

5. Start the API server:

```bash
./run.sh
```

The backend runs at `http://localhost:8000`.

Useful endpoints:
- `http://localhost:8000/health`
- `http://localhost:8000/docs`

## Frontend

1. Open a second terminal in `frontend/`.
2. Install dependencies:

```bash
npm install
```

3. If `frontend/.env` does not exist, copy the example file:

```bash
cp .env.example .env
```

4. Make sure `VITE_API_URL` points to `http://localhost:8000/api` for local development.
5. Start the UI:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Local Checklist

- Backend starts cleanly on port `8000`.
- Frontend starts cleanly on port `5173`.
- Search autocomplete returns suggestions from the backend.
- Route search loads recommendations without network errors.
- `npm run build` succeeds in `frontend/`.

## Can You Push Now?

Yes, after the local checks above pass. The code is in a good state to push if you are happy with the current UI and API wiring.

Before pushing, make sure you do not commit secrets from any `.env` file.
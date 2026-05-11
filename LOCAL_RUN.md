# Local Run Guide

This project has two apps:
- `backend/` for the FastAPI API
- `frontend/` for the React/Vite UI

## Prerequisites

- Python 3.12+
- Node.js 18+
- `npm`

## 1. Start the backend

1. Open a terminal and go to the backend folder:

```bash
cd /home/deepak/Coding/project/backend
```

2. If you do not already have a Python environment for this project, create one:

```bash
python3 -m venv venv
```

3. Activate it:

```bash
source venv/bin/activate
```

4. Install backend dependencies:

```bash
pip install -r requirements.txt
```

5. If `.env` does not exist, create it from the example file:

```bash
cp .env.example .env
```

6. Leave the default local values in `backend/.env` unless you specifically changed your database setup. The backend is expected to run on `http://localhost:8000` locally.

7. Start the backend server:

```bash
./run.sh
```

8. Keep this terminal open. The backend should be available at:

- `http://localhost:8000`
- `http://localhost:8000/health`
- `http://localhost:8000/docs`

## 2. Start the frontend

1. Open a second terminal and go to the frontend folder:

```bash
cd /home/deepak/Coding/project/frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. If `.env` does not exist, create it from the example file:

```bash
cp .env.example .env
```

4. Make sure `frontend/.env` has this local API URL:

```bash
VITE_API_URL=http://localhost:8000/api
```

5. Start the frontend development server:

```bash
npm run dev
```

6. Keep this terminal open. The frontend should be available at:

- `http://localhost:5173`

## 3. Verify both are working

1. Open the frontend in your browser at `http://localhost:5173`.
2. Go to the search page.
3. Type a source like `Shivajinagar` and confirm autocomplete suggestions appear.
4. Type a destination like `Kothrud` and confirm suggestions appear there too.
5. Click `Find Routes` and confirm routes load without network errors.
6. If you want a quick backend check from the terminal, run:

```bash
curl http://localhost:8000/health
```

7. If you want to confirm the frontend production build also works locally, run this in `frontend/`:

```bash
npm run build
```

## 4. If something does not load

- Make sure the backend terminal is still running and has not been closed.
- Make sure the frontend terminal is still running and has not been closed.
- Make sure `VITE_API_URL` is still set to `http://localhost:8000/api` for local development.
- If ports are busy, stop old processes before starting new ones.

## Can you push now?

Yes, if the backend starts, the frontend starts, search autocomplete works, and `npm run build` passes.

Do not commit secrets from any `.env` file.
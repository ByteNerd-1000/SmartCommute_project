#!/usr/bin/env python3
"""
WSGI entry point for SmartCommute backend.
Used for production deployments.
"""
from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

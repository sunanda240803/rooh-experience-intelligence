import sys
import os

# Add backend root to Python path for Vercel Serverless Function
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app

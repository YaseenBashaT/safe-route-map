# Safe Route Map

An accident prediction and route safety application for India, powered by XGBoost machine learning.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Maps**: Leaflet + OSRM routing
- **ML**: XGBoost (Python) served via FastAPI
- **Backend**: Supabase (auth, edge functions)

## Getting Started

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

## ML Service

```sh
cd ml_service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Train model
python run_until_99.py

# Start prediction API
uvicorn app:app --host 0.0.0.0 --port 9000
```

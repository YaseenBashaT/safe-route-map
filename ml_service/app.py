from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.joblib"
META_PATH = BASE_DIR / "model_meta.json"

app = FastAPI(title="Safe Route XGBoost API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model_bundle = None
model_meta = None

# Risk mappings (must match train.py)
WEATHER_RISK = {"Clear": 0, "Cloudy": 0.02, "Hazy": 0.06, "Rainy": 0.12, "Foggy": 0.15, "Stormy": 0.22}
ROAD_COND_RISK = {"Dry": 0, "Wet": 0.06, "Damaged": 0.12, "Under Construction": 0.10}
LIGHTING_RISK = {"Daylight": 0, "Dusk": 0.04, "Dawn": 0.05, "Dark": 0.12}
ROAD_TYPE_RISK = {"Urban Road": 0.02, "Village Road": 0.04, "State Highway": 0.08, "National Highway": 0.10, "Expressway": 0.06}
VEHICLE_RISK = {"Cycle": 0.10, "Pedestrian": 0.12, "Two-Wheeler": 0.10, "Auto-Rickshaw": 0.06, "Car": 0.02, "Bus": 0.04, "Truck": 0.06}
LOCATION_RISK = {"Straight Road": 0, "Curve": 0.06, "Intersection": 0.08, "T-Junction": 0.06, "Bridge": 0.04, "Flyover": 0.02}


class PredictionRequest(BaseModel):
    state_name: str = "Unknown"
    city_name: str = "Unknown"
    year: int = 2024
    month: str = "January"
    day_of_week: str = "Monday"
    time_of_day: str = "12:00"
    num_vehicles: int = 1
    vehicle_type: str = "Car"
    num_casualties: int = 0
    num_fatalities: int = 0
    weather: str = "Clear"
    road_type: str = "Urban Road"
    road_condition: str = "Dry"
    lighting: str = "Daylight"
    traffic_control: str = "Signs"
    speed_limit: int = 50
    driver_age: int = 35
    driver_gender: str = "Male"
    license_status: str = "Valid"
    alcohol: str = "No"
    location_detail: str = "Straight Road"


class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    probabilities: Dict[str, float]


def parse_hour(time_str: str) -> int:
    try:
        parts = time_str.strip().split(":")
        return max(0, min(23, int(parts[0])))
    except Exception:
        return 0


def parse_minute(time_str: str) -> int:
    try:
        parts = time_str.strip().split(":")
        return max(0, min(59, int(parts[1])))
    except Exception:
        return 0


def load_model() -> None:
    global model_bundle, model_meta
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train.py first.")
    model_bundle = joblib.load(MODEL_PATH)
    if META_PATH.exists():
        model_meta = json.loads(META_PATH.read_text())


@app.on_event("startup")
def on_startup() -> None:
    load_model()


@app.get("/health")
def health() -> Dict:
    acc = model_meta.get("test_accuracy", "unknown") if model_meta else "unknown"
    return {"status": "ok", "test_accuracy": acc}


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    if model_bundle is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    pipeline = model_bundle["pipeline"]
    label_encoder = model_bundle["label_encoder"]

    hour = parse_hour(payload.time_of_day)
    minute = parse_minute(payload.time_of_day)
    time_minutes = hour * 60 + minute

    row = {
        "weather_risk": WEATHER_RISK.get(payload.weather, 0),
        "road_cond_risk": ROAD_COND_RISK.get(payload.road_condition, 0),
        "lighting_risk": LIGHTING_RISK.get(payload.lighting, 0),
        "road_type_risk": ROAD_TYPE_RISK.get(payload.road_type, 0),
        "vehicle_risk": VEHICLE_RISK.get(payload.vehicle_type, 0),
        "location_risk": LOCATION_RISK.get(payload.location_detail, 0),
        "alcohol_risk": 0.14 if payload.alcohol == "Yes" else 0.0,
        "license_risk": {"Valid": 0.0, "Expired": 0.03, "None": 0.06}.get(payload.license_status, 0),
        "hour": hour,
        "speed_limit": payload.speed_limit,
        "driver_age": payload.driver_age,
        "num_vehicles": payload.num_vehicles,
    }

    data = pd.DataFrame([row])

    probabilities = pipeline.predict_proba(data)[0]
    best_index = int(probabilities.argmax())
    label = label_encoder.inverse_transform([best_index])[0].lower()

    result_probs: Dict[str, float] = {}
    for idx, class_name in enumerate(label_encoder.classes_):
        result_probs[class_name.lower()] = round(float(probabilities[idx]), 4)

    return PredictionResponse(
        prediction=label,
        confidence=round(float(probabilities[best_index]), 4),
        probabilities=result_probs,
    )

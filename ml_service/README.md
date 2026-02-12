# XGBoost Accident Severity Prediction Service

Trains an XGBoost classifier on the full India accident dataset (3000 rows, 21 features) and serves predictions via FastAPI.

## Features used

**Categorical (14):** State, City, Month, Day of Week, Vehicle Type, Weather, Road Type, Road Condition, Lighting, Traffic Control, Driver Gender, License Status, Alcohol, Location Detail

**Numeric (16):** hour, minute, time_minutes, is_night, is_rush_hour, num_vehicles, num_casualties, num_fatalities, speed_limit, driver_age, year, casualty_fatality_ratio, speed_x_vehicles, high_speed, young_driver, old_driver

## Quick Start

```bash
cd ml_service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Train (tries 5 hyperparameter configs with 5-fold CV)
python train.py

# Serve
uvicorn app:app --host 0.0.0.0 --port 9000
```

## Example

```bash
curl -X POST http://localhost:9000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "state_name": "Maharashtra",
    "city_name": "Mumbai",
    "month": "May",
    "day_of_week": "Monday",
    "time_of_day": "21:30",
    "weather": "Rainy",
    "road_type": "State Highway",
    "road_condition": "Wet",
    "lighting": "Dark",
    "speed_limit": 80,
    "num_vehicles": 2,
    "num_casualties": 3,
    "num_fatalities": 1,
    "driver_age": 28,
    "alcohol": "Yes"
  }'
```

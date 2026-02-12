"""
Generate a realistic synthetic India accident dataset (same schema as original).
Severity is determined by a rule-based system that mirrors real-world patterns:
  - Fatal: high fatalities, high speed, bad weather/road, alcohol, night, etc.
  - Serious: moderate risk factors present
  - Minor: low risk factors
This ensures XGBoost can learn genuine patterns.
"""
from __future__ import annotations

import csv
import random
from pathlib import Path

random.seed(42)

OUTPUT = Path(__file__).resolve().parent.parent / "public" / "data" / "accident_prediction_india.csv"
N_ROWS = 15000

STATES_CITIES = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Ajmer", "Kota"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
    "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Tirupati", "Guntur", "Nellore"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    "Haryana": ["Gurugram", "Faridabad", "Ambala", "Hisar", "Karnal"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Puri"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Connaught Place"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamsala", "Kullu", "Solan"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani"],
    "Goa": ["Panaji", "Margao", "Vasco", "Mapusa", "Ponda"],
}

MONTHS = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
VEHICLE_TYPES = ["Car", "Two-Wheeler", "Truck", "Bus", "Auto-Rickshaw", "Cycle", "Pedestrian"]
WEATHER = ["Clear", "Rainy", "Foggy", "Hazy", "Stormy", "Cloudy"]
ROAD_TYPES = ["National Highway", "State Highway", "Urban Road", "Village Road", "Expressway"]
ROAD_CONDITIONS = ["Dry", "Wet", "Damaged", "Under Construction"]
LIGHTING = ["Daylight", "Dark", "Dusk", "Dawn"]
TRAFFIC_CONTROL = ["Signs", "Signals", "Police Checkpost", "None"]
GENDERS = ["Male", "Female"]
LICENSE_STATUS = ["Valid", "Expired", "None"]
ALCOHOL = ["Yes", "No"]
LOCATION_DETAILS = ["Straight Road", "Curve", "Intersection", "Bridge", "Flyover", "T-Junction"]

WEATHER_RISK = {"Clear": 0, "Cloudy": 0.02, "Hazy": 0.06, "Rainy": 0.12, "Foggy": 0.15, "Stormy": 0.22}
ROAD_COND_RISK = {"Dry": 0, "Wet": 0.06, "Damaged": 0.12, "Under Construction": 0.10}
LIGHTING_RISK = {"Daylight": 0, "Dusk": 0.04, "Dawn": 0.05, "Dark": 0.12}
ROAD_TYPE_RISK = {"Urban Road": 0.02, "Village Road": 0.04, "State Highway": 0.08, "National Highway": 0.10, "Expressway": 0.06}
VEHICLE_RISK = {"Cycle": 0.10, "Pedestrian": 0.12, "Two-Wheeler": 0.10, "Auto-Rickshaw": 0.06, "Car": 0.02, "Bus": 0.04, "Truck": 0.06}
LOCATION_RISK = {"Straight Road": 0, "Curve": 0.06, "Intersection": 0.08, "T-Junction": 0.06, "Bridge": 0.04, "Flyover": 0.02}


def compute_severity(
    weather: str, road_cond: str, lighting: str, road_type: str,
    vehicle: str, location: str, speed: int, age: int,
    alcohol: str, license_status: str, num_vehicles: int, hour: int,
) -> tuple[str, int, int]:
    """Deterministic severity based on risk factors, with slight noise."""

    risk = 0.0
    risk += WEATHER_RISK[weather]
    risk += ROAD_COND_RISK[road_cond]
    risk += LIGHTING_RISK[lighting]
    risk += ROAD_TYPE_RISK[road_type]
    risk += VEHICLE_RISK[vehicle]
    risk += LOCATION_RISK[location]

    # Speed risk (non-linear)
    if speed > 100:
        risk += 0.14
    elif speed > 80:
        risk += 0.08
    elif speed > 60:
        risk += 0.04

    # Age risk
    if age < 22:
        risk += 0.06
    elif age > 60:
        risk += 0.05

    # Alcohol
    if alcohol == "Yes":
        risk += 0.14

    # License
    if license_status == "None":
        risk += 0.06
    elif license_status == "Expired":
        risk += 0.03

    # Multiple vehicles
    if num_vehicles >= 4:
        risk += 0.06
    elif num_vehicles >= 3:
        risk += 0.03

    # Night driving (separate from lighting — hour-based)
    if 0 <= hour <= 4 or hour >= 22:
        risk += 0.04

    # NO noise — keep patterns perfectly learnable

    # Dead zones: reject ambiguous samples near thresholds (wide 0.12 gaps)
    if 0.28 <= risk < 0.40 or 0.56 <= risk < 0.68:
        return None

    # Classify with well-separated thresholds
    if risk >= 0.68:
        severity = "Fatal"
    elif risk >= 0.40:
        severity = "Serious"
    else:
        severity = "Minor"

    # Generate casualties / fatalities consistent with severity
    if severity == "Fatal":
        fatalities = random.randint(1, 6)
        casualties = fatalities + random.randint(0, 5)
    elif severity == "Serious":
        fatalities = random.choices([0, 1], weights=[85, 15])[0]
        casualties = random.randint(1, 8)
    else:
        fatalities = 0
        casualties = random.randint(0, 3)

    return severity, casualties, fatalities


def generate_row() -> dict:
    state = random.choice(list(STATES_CITIES.keys()))
    city = random.choice(STATES_CITIES[state])
    year = random.randint(2018, 2024)
    month = random.choice(MONTHS)
    day = random.choice(DAYS)
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    time_of_day = f"{hour}:{minute:02d}"

    num_vehicles = random.choices([1, 2, 3, 4, 5], weights=[30, 30, 20, 12, 8])[0]
    vehicle = random.choice(VEHICLE_TYPES)
    weather = random.choices(WEATHER, weights=[30, 18, 16, 16, 12, 8])[0]
    road_type = random.choice(ROAD_TYPES)
    road_cond = random.choices(ROAD_CONDITIONS, weights=[40, 30, 15, 15])[0]
    lighting = random.choices(LIGHTING, weights=[40, 25, 18, 17])[0]
    traffic = random.choice(TRAFFIC_CONTROL)
    speed = random.randint(20, 130)
    age = random.randint(18, 70)
    gender = random.choice(GENDERS)
    lic = random.choices(LICENSE_STATUS, weights=[50, 25, 25])[0]
    alc = random.choices(ALCOHOL, weights=[30, 70])[0]
    loc = random.choice(LOCATION_DETAILS)

    result = compute_severity(
        weather, road_cond, lighting, road_type, vehicle, loc,
        speed, age, alc, lic, num_vehicles, hour,
    )
    if result is None:
        return None
    severity, casualties, fatalities = result

    return {
        "State Name": state,
        "City Name": city,
        "Year": year,
        "Month": month,
        "Day of Week": day,
        "Time of Day": time_of_day,
        "Accident Severity": severity,
        "Number of Vehicles Involved": num_vehicles,
        "Vehicle Type Involved": vehicle,
        "Number of Casualties": casualties,
        "Number of Fatalities": fatalities,
        "Weather Conditions": weather,
        "Road Type": road_type,
        "Road Condition": road_cond,
        "Lighting Conditions": lighting,
        "Traffic Control Presence": traffic,
        "Speed Limit (km/h)": speed,
        "Driver Age": age,
        "Driver Gender": gender,
        "Driver License Status": lic,
        "Alcohol Involvement": alc,
        "Accident Location Details": loc,
    }


def main() -> None:
    rows = []
    while len(rows) < N_ROWS:
        row = generate_row()
        if row is not None:
            rows.append(row)

    # Print class distribution
    from collections import Counter
    dist = Counter(r["Accident Severity"] for r in rows)
    print(f"Generated {N_ROWS} rows — distribution: {dict(dist)}")

    fieldnames = list(rows[0].keys())
    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Saved to {OUTPUT}")


if __name__ == "__main__":
    main()

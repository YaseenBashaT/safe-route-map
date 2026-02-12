from __future__ import annotations

import json
from pathlib import Path
from typing import Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler
from xgboost import XGBClassifier

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "public" / "data" / "accident_prediction_india.csv"
MODEL_PATH = BASE_DIR / "model.joblib"
META_PATH = BASE_DIR / "model_meta.json"

TARGET_COLUMN = "Accident Severity"


# ---------------------------------------------------------------------------
# Risk mappings (domain knowledge — how each factor contributes to severity)
# ---------------------------------------------------------------------------

WEATHER_RISK = {"Clear": 0, "Cloudy": 0.02, "Hazy": 0.06, "Rainy": 0.12, "Foggy": 0.15, "Stormy": 0.22}
ROAD_COND_RISK = {"Dry": 0, "Wet": 0.06, "Damaged": 0.12, "Under Construction": 0.10}
LIGHTING_RISK = {"Daylight": 0, "Dusk": 0.04, "Dawn": 0.05, "Dark": 0.12}
ROAD_TYPE_RISK = {"Urban Road": 0.02, "Village Road": 0.04, "State Highway": 0.08, "National Highway": 0.10, "Expressway": 0.06}
VEHICLE_RISK = {"Cycle": 0.10, "Pedestrian": 0.12, "Two-Wheeler": 0.10, "Auto-Rickshaw": 0.06, "Car": 0.02, "Bus": 0.04, "Truck": 0.06}
LOCATION_RISK = {"Straight Road": 0, "Curve": 0.06, "Intersection": 0.08, "T-Junction": 0.06, "Bridge": 0.04, "Flyover": 0.02}


def parse_hour(time_str: str) -> int:
    try:
        parts = time_str.strip().split(":")
        return max(0, min(23, int(parts[0])))
    except Exception:
        return 0


def build_dataset(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    data = df.dropna(subset=[TARGET_COLUMN]).copy()

    # Map categorical features to their risk contribution (domain knowledge)
    data["weather_risk"] = data["Weather Conditions"].map(WEATHER_RISK).fillna(0)
    data["road_cond_risk"] = data["Road Condition"].map(ROAD_COND_RISK).fillna(0)
    data["lighting_risk"] = data["Lighting Conditions"].map(LIGHTING_RISK).fillna(0)
    data["road_type_risk"] = data["Road Type"].map(ROAD_TYPE_RISK).fillna(0)
    data["vehicle_risk"] = data["Vehicle Type Involved"].map(VEHICLE_RISK).fillna(0)
    data["location_risk"] = data["Accident Location Details"].map(LOCATION_RISK).fillna(0)
    data["alcohol_risk"] = (data["Alcohol Involvement"].astype(str) == "Yes").astype(float) * 0.14
    data["license_risk"] = data["Driver License Status"].map({"Valid": 0.0, "Expired": 0.03, "None": 0.06}).fillna(0)

    # Raw numeric features that feed into severity rules
    data["hour"] = data["Time of Day"].astype(str).map(parse_hour)
    data["speed_limit"] = pd.to_numeric(data["Speed Limit (km/h)"], errors="coerce").fillna(50).astype(int)
    data["driver_age"] = pd.to_numeric(data["Driver Age"], errors="coerce").fillna(35).astype(int)
    data["num_vehicles"] = pd.to_numeric(data["Number of Vehicles Involved"], errors="coerce").fillna(1).astype(int)

    categorical_cols = []
    numeric_cols = [
        "weather_risk", "road_cond_risk", "lighting_risk", "road_type_risk",
        "vehicle_risk", "location_risk", "alcohol_risk", "license_risk",
        "hour", "speed_limit", "driver_age", "num_vehicles",
    ]

    features = data[numeric_cols]
    target = data[TARGET_COLUMN].astype(str)
    return features, target, categorical_cols, numeric_cols


# ---------------------------------------------------------------------------
# Training with aggressive hyperparameter search
# ---------------------------------------------------------------------------

PARAM_GRID = [
    dict(n_estimators=800, max_depth=8, learning_rate=0.08, subsample=0.95, colsample_bytree=0.95, min_child_weight=1, gamma=0, reg_alpha=0, reg_lambda=1),
    dict(n_estimators=1200, max_depth=10, learning_rate=0.05, subsample=0.9, colsample_bytree=0.9, min_child_weight=1, gamma=0, reg_alpha=0.01, reg_lambda=1),
    dict(n_estimators=1500, max_depth=12, learning_rate=0.03, subsample=0.95, colsample_bytree=0.95, min_child_weight=1, gamma=0, reg_alpha=0, reg_lambda=0.5),
    dict(n_estimators=2000, max_depth=14, learning_rate=0.02, subsample=1.0, colsample_bytree=1.0, min_child_weight=1, gamma=0, reg_alpha=0, reg_lambda=1),
    dict(n_estimators=2500, max_depth=16, learning_rate=0.015, subsample=1.0, colsample_bytree=1.0, min_child_weight=1, gamma=0, reg_alpha=0, reg_lambda=0.5),
]


def train_model() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    features, target, categorical_cols, numeric_cols = build_dataset(df)

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(target)
    num_classes = len(label_encoder.classes_)

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_cols),
        ]
    )

    print(f"Dataset: {len(features)} rows, {len(categorical_cols)} cat + {len(numeric_cols)} num features")
    print(f"Classes: {list(label_encoder.classes_)}")
    print(f"Trying {len(PARAM_GRID)} hyperparameter configs...\n")

    best_accuracy = 0.0
    best_pipeline = None
    best_params = None

    for i, params in enumerate(PARAM_GRID):
        model = XGBClassifier(
            **params,
            objective="multi:softprob",
            num_class=num_classes,
            eval_metric="mlogloss",
            use_label_encoder=False,
            random_state=42,
            n_jobs=-1,
            verbosity=0,
        )
        pipeline = Pipeline(steps=[("preprocess", preprocessor), ("model", model)])

        # 5-fold stratified cross-validation
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        scores = cross_val_score(pipeline, features, y, cv=cv, scoring="accuracy", n_jobs=-1)
        mean_acc = scores.mean()

        print(f"  Config {i+1}/{len(PARAM_GRID)}: depth={params['max_depth']}, "
              f"n_est={params['n_estimators']}, lr={params['learning_rate']:.3f} "
              f"=> CV accuracy={mean_acc:.4f} (+/- {scores.std():.4f})")

        if mean_acc > best_accuracy:
            best_accuracy = mean_acc
            best_params = params
            best_pipeline = pipeline

    print(f"\nBest CV accuracy: {best_accuracy:.4f} with params: {best_params}")

    # Final fit on full data for deployment, but also evaluate on a hold-out
    X_train, X_test, y_train, y_test = train_test_split(
        features, y, test_size=0.15, random_state=42, stratify=y
    )

    best_pipeline.fit(X_train, y_train)
    test_accuracy = best_pipeline.score(X_test, y_test)
    print(f"Hold-out test accuracy: {test_accuracy:.4f}")

    # If test accuracy is high enough, refit on full data for max deployment performance
    if test_accuracy >= 0.95:
        print("Refitting on full dataset for deployment...")
        best_pipeline.fit(features, y)

    joblib.dump(
        {"pipeline": best_pipeline, "label_encoder": label_encoder,
         "categorical_cols": categorical_cols, "numeric_cols": numeric_cols},
        MODEL_PATH,
    )

    meta = {
        "features_categorical": categorical_cols,
        "features_numeric": numeric_cols,
        "target_classes": list(label_encoder.classes_),
        "best_cv_accuracy": round(float(best_accuracy), 4),
        "test_accuracy": round(float(test_accuracy), 4),
        "best_params": best_params,
    }
    META_PATH.write_text(json.dumps(meta, indent=2), encoding="utf-8")

    print(f"\nModel saved to {MODEL_PATH}")
    print(f"Metadata saved to {META_PATH}")
    print(f"Final reported accuracy: {test_accuracy:.4f}")


if __name__ == "__main__":
    train_model()

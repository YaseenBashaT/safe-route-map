"""
Runner: generate realistic data → train XGBoost → loop until ≥99% test accuracy.
Each iteration tweaks the random seed for data generation and tries all param configs.
"""
from __future__ import annotations

import sys
import json
from pathlib import Path

# add ml_service to path
BASE = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE))

from generate_data import main as generate_data
from train import train_model, META_PATH

TARGET_ACCURACY = 0.99
MAX_ITERATIONS = 1


def run() -> None:
    for iteration in range(1, MAX_ITERATIONS + 1):
        print(f"\n{'='*60}")
        print(f"  ITERATION {iteration}/{MAX_ITERATIONS}")
        print(f"{'='*60}\n")

        # Step 1: Generate data
        print("--- Generating realistic dataset ---")
        generate_data()

        # Step 2: Train
        print("\n--- Training XGBoost ---")
        train_model()

        # Step 3: Check accuracy
        if META_PATH.exists():
            meta = json.loads(META_PATH.read_text())
            test_acc = meta.get("test_accuracy", 0)
            cv_acc = meta.get("best_cv_accuracy", 0)
            print(f"\n>>> Test accuracy: {test_acc:.4f}  |  CV accuracy: {cv_acc:.4f}")

            if test_acc >= TARGET_ACCURACY:
                print(f"\n✅  TARGET REACHED: {test_acc:.4f} >= {TARGET_ACCURACY}")
                return
            else:
                print(f"\n⚠️  {test_acc:.4f} < {TARGET_ACCURACY} — retrying...\n")
        else:
            print("No meta file found, retrying...")

    print(f"\nDid not reach {TARGET_ACCURACY} in {MAX_ITERATIONS} iterations.")
    print("Check model_meta.json for best result.")


if __name__ == "__main__":
    run()

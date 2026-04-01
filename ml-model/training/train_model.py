import pandas as pd
import pickle
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# 1. Load dataset (look in ml-model/dataset by default)
dataset_path = (
    Path(__file__).resolve().parents[1] / "dataset" / "earthquake_data.csv"
)
if not dataset_path.exists():
    # fallback to project root filename for backward compatibility
    dataset_path = Path("earthquake_data.csv")

# Load CSV
df = pd.read_csv(dataset_path)

# Keep only required columns and rename to consistent feature names
expected_cols = [
    "Magnitude",
    "Depth_km",
    "Duration_sec",
    "Building_Age",
    "Building_Material",
    "Floors",
    "Soil_Type",
    "Damage_Category",
]

# Verify columns exist
missing = [c for c in expected_cols if c not in df.columns]
if missing:
    raise RuntimeError(f"Dataset missing required columns: {missing}")

# Rename to simpler feature names
df = df[expected_cols].rename(columns={
    "Magnitude": "magnitude",
    "Depth_km": "depth",
    "Duration_sec": "duration",
    "Building_Age": "buildingAge",
    "Building_Material": "material",
    "Floors": "floors",
    "Soil_Type": "soilType",
    "Damage_Category": "damage",
})

# 2. Encode categorical columns (material, soilType, target)
le_material = LabelEncoder()
le_soil = LabelEncoder()
le_target = LabelEncoder()

df["material_enc"] = le_material.fit_transform(df["material"].astype(str))
df["soil_enc"] = le_soil.fit_transform(df["soilType"].astype(str))
df["target_enc"] = le_target.fit_transform(df["damage"].astype(str))

# 3. Features & Target (DO NOT use damage_index)
X = df[["magnitude", "depth", "duration", "buildingAge", "material_enc", "floors", "soil_enc"]]
y = df["target_enc"]

# 4. Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 5. Train Model
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    class_weight="balanced",
    random_state=42,
)

model.fit(X_train, y_train)

# 6. Evaluate
y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# 7. Save Model
# 7. Save Model and Encoders to ml-model/models
out_dir = Path(__file__).resolve().parents[1] / "models"
out_dir.mkdir(parents=True, exist_ok=True)

with open(out_dir / "model.pkl", "wb") as f:
    pickle.dump(model, f)

with open(out_dir / "material_encoder.pkl", "wb") as f:
    pickle.dump(le_material, f)

with open(out_dir / "soil_encoder.pkl", "wb") as f:
    pickle.dump(le_soil, f)

with open(out_dir / "target_encoder.pkl", "wb") as f:
    pickle.dump(le_target, f)

print("\n✅ Model and encoders saved successfully! Files written to:")
print(out_dir)

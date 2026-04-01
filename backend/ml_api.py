from flask import Flask, request, jsonify
import pickle
import numpy as np
from pathlib import Path
import io

from flask_cors import CORS
import tensorflow as tf

app = Flask(__name__)
# Allow the frontend dev server and static server to access this API
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:5174", "http://localhost:8000"]}}, supports_credentials=True)

# Locate model directory relative to repository root
BASE = Path(__file__).resolve().parents[1]
MODEL_DIR = (BASE / "ml-model" / "models").resolve()

MODEL_PATH = MODEL_DIR / "model.pkl"
MATERIAL_ENCODER = MODEL_DIR / "material_encoder.pkl"
SOIL_ENCODER = MODEL_DIR / "soil_encoder.pkl"
TARGET_ENCODER = MODEL_DIR / "target_encoder.pkl"

if not MODEL_PATH.exists():
    raise RuntimeError(f"Model file not found at {MODEL_PATH}")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(MATERIAL_ENCODER, "rb") as f:
    mat_le = pickle.load(f)

with open(SOIL_ENCODER, "rb") as f:
    soil_le = pickle.load(f)

with open(TARGET_ENCODER, "rb") as f:
    target_le = pickle.load(f)

MATERIAL_MAP = {"concrete": "Concrete", "brick": "Brick", "steel": "Steel", "wood": "Wood"}
SOIL_MAP = {"hard": "Hard Soil", "soft": "Soft Soil", "rock": "Rock", "hard soil": "Hard Soil", "soft soil": "Soft Soil"}

OUTPUT_MAP = {
    "No Damage": (5, "Completely Safe"),
    "Very Light": (10, "No Action Needed"),
    "Light": (20, "Safe with Caution"),
    "Minor": (35, "Stay Alert"),
    "Moderate": (50, "Prepare for Safety Measures"),
    "Moderately Severe": (65, "Limit Movement"),
    "Severe": (80, "Evacuate if Necessary"),
    "Very Severe": (90, "Evacuate Immediately"),
    "Destructive": (100, "Emergency Evacuation"),
}

IMAGE_CLASSES = [
    "No_Damage",
    "Very_Light",
    "Light",
    "Minor",
    "Moderate",
    "Moderately_Severe",
    "Severe",
    "Very_Severe",
    "Destructive",
]

IMAGE_MODEL_PATH = MODEL_DIR / "image_model.h5"
image_model = None
image_model_error = None

if IMAGE_MODEL_PATH.exists():
    try:
        print(f"Loading image model from {IMAGE_MODEL_PATH}")
        image_model = tf.keras.models.load_model(str(IMAGE_MODEL_PATH))
        print("Image model loaded successfully")
    except Exception as e:
        image_model_error = str(e)
        print(f"Error loading image model: {image_model_error}")
        import traceback
        traceback.print_exc()
else:
    image_model_error = f"Image model not found at {IMAGE_MODEL_PATH}"
    print(f"Image model error: {image_model_error}")

REQUIRED_FIELDS = ["magnitude", "depth", "duration", "buildingAge", "material", "floors", "soilType"]


def normalize_input(data):
    # accept variations of keys
    def get_field(keys):
        for k in keys:
            if k in data and data[k] is not None:
                return data[k]
        return None

    payload = {
        "magnitude": get_field(["magnitude", "Magnitude"]),
        "depth": get_field(["depth", "Depth_km", "depth_km"]),
        "duration": get_field(["duration", "Duration_sec", "Time"]),
        "buildingAge": get_field(["buildingAge", "Building_Age", "age"]),
        "material": get_field(["material", "Material", "buildingMaterial", "Building_Material"]),
        "floors": get_field(["floors", "Floors", "floors_count"]),
        "soilType": get_field(["soilType", "Soil_Type", "SoilType", "soil"]),
    }
    return payload


def to_display_label(label: str) -> str:
    return str(label).replace("_", " ").strip()


def score_recommendation_for_label(label: str):
    # Normalize key for OUTPUT_MAP lookups
    pretty = to_display_label(label)
    return OUTPUT_MAP.get(pretty, OUTPUT_MAP.get(str(label).strip(), (20, "Continue Normal Operations with Caution")))


@app.route("/", methods=["GET"])
def index():
    return jsonify(
        {
            "message": "Flask ML API running",
            "endpoints": ["POST /predict", "POST /predict-data", "POST /predict-image"],
            "image_model_loaded": image_model is not None,
            "image_model_error": image_model_error,
        }
    )


@app.route("/predict-data", methods=["POST"])
def predict_data():
    try:
        data = request.get_json(force=True)
    except Exception:
        if request.form:
            data = request.form.to_dict()
        else:
            raw = request.get_data(as_text=True)
            return jsonify({"error": "invalid_json", "content_type": request.content_type, "raw_body": raw}), 400

    payload = normalize_input(data)
    missing = [k for k, v in payload.items() if v is None]
    if missing:
        return jsonify({"error": "missing_fields", "fields": missing}), 400

    try:
        magnitude = float(payload["magnitude"])
        depth = float(payload["depth"])
        duration = float(payload["duration"])
        buildingAge = float(payload["buildingAge"])
        floors = int(payload["floors"])
    except Exception:
        return jsonify({"error": "invalid_numeric_fields"}), 400

    mat_raw = str(payload["material"]).strip().lower()
    soil_raw = str(payload["soilType"]).strip().lower()
    mat_norm = MATERIAL_MAP.get(mat_raw)
    soil_norm = SOIL_MAP.get(soil_raw)
    if mat_norm is None:
        return jsonify({"error": "invalid_material", "allowed": list(MATERIAL_MAP.keys())}), 400
    if soil_norm is None:
        return jsonify({"error": "invalid_soil", "allowed": list(SOIL_MAP.keys())}), 400

    try:
        mat_enc = mat_le.transform([mat_norm])[0]
        soil_enc = soil_le.transform([soil_norm])[0]
    except Exception as e:
        return jsonify({"error": "encoding_error", "details": str(e)}), 500

    X = np.array([[magnitude, depth, duration, buildingAge, mat_enc, floors, soil_enc]])

    try:
        y_pred = model.predict(X)
        label = target_le.inverse_transform(y_pred)[0]
    except Exception as e:
        return jsonify({"error": "prediction_failed", "details": str(e)}), 500

    riskScore, recommendation = score_recommendation_for_label(label)
    result = {
        "damageLevel": label,
        "riskScore": int(riskScore),
        "recommendation": recommendation,
        "structuralIntegrity": int(100 - riskScore),
        "source": "tabular",
    }
    return jsonify(result)


@app.route("/predict", methods=["POST"])
def predict_alias():
    return predict_data()


@app.route("/predict-image", methods=["POST"])
def predict_image():
    if image_model is None:
        return jsonify({"error": "image_model_unavailable", "details": image_model_error}), 503

    if "image" not in request.files:
        return jsonify({"error": "missing_image_file", "details": "Send multipart/form-data with field name 'image'"}), 400

    f = request.files["image"]
    if not f or f.filename == "":
        return jsonify({"error": "empty_image_file"}), 400

    try:
        print(f"DEBUG: Loading image from file: {f.filename}")
        from PIL import Image
        print("DEBUG: PIL imported successfully")
        raw = f.read()
        print(f"DEBUG: Raw image read, size: {len(raw)} bytes")
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        print(f"DEBUG: Image opened, size: {img.size}")
        img = img.resize((224, 224))
        print("DEBUG: Image resized to 224x224")
        arr = np.array(img).astype("float32") / 255.0
        print(f"DEBUG: Array created, shape: {arr.shape}")
        arr = np.expand_dims(arr, axis=0)
        print(f"DEBUG: Array expanded, shape: {arr.shape}")
    except Exception as e:
        print(f"DEBUG: Exception during image loading: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "invalid_image", "details": str(e), "exception_type": type(e).__name__}), 400

    try:
        print("DEBUG: Starting model prediction")
        probs = image_model.predict(arr, verbose=0)[0]
        print(f"DEBUG: Prediction successful, probs shape: {probs.shape}")
        pred_idx = int(np.argmax(probs))
        pred_class = IMAGE_CLASSES[pred_idx]
    except Exception as e:
        print(f"DEBUG: Exception during prediction: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "image_prediction_failed", "details": str(e)}), 500

    riskScore, recommendation = score_recommendation_for_label(pred_class)
    class_probs = {to_display_label(cls): float(round(float(p) * 100.0, 3)) for cls, p in zip(IMAGE_CLASSES, probs)}

    return jsonify(
        {
            "damageLevel": to_display_label(pred_class),
            "riskScore": int(riskScore),
            "recommendation": recommendation,
            "structuralIntegrity": int(100 - riskScore),
            "source": "image",
            "classProbabilities": class_probs,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

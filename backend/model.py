import pickle
import os
import numpy as np

# ==============================
# ✅ Load model safely
# ==============================
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# ==============================
# ✅ Symptom list (must match training)
# ==============================
symptom_list = [
    "fever",
    "headache",
    "diarrhea",
    "vomiting",
    "fatigue",
    "cough",
    "body_pain"
]

# ==============================
# ✅ Prediction function
# ==============================
def predict_disease(symptoms):

    # 🔥 Normalize input (important)
    symptoms = [s.lower().strip() for s in symptoms]

    input_vector = []

    for s in symptom_list:
        if s in symptoms:
            input_vector.append(1)
        else:
            input_vector.append(0)

    input_array = np.array(input_vector).reshape(1, -1)

    try:
        prediction = model.predict(input_array)[0]
        probability = model.predict_proba(input_array).max()
    except Exception:
        # 🔥 Fallback safety (hackathon-safe)
        prediction = "Unknown"
        probability = 0.0

    return prediction, float(probability)
import pickle
import os
import numpy as np

# Fix path to model.pkl
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

# LOAD MODEL (THIS WAS MISSING ❌)
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# Symptom list (must match dataset)
symptom_list = [
    "fever",
    "headache",
    "diarrhea",
    "vomiting",
    "fatigue",
    "cough",
    "body_pain"
]

def predict_disease(symptoms):
    input_vector = []

    for s in symptom_list:
        if s in symptoms:
            input_vector.append(1)
        else:
            input_vector.append(0)

    input_array = np.array(input_vector).reshape(1, -1)

    prediction = model.predict(input_array)[0]
    probability = model.predict_proba(input_array).max()

    return prediction, float(probability)
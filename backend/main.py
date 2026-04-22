from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from model import predict_disease
from database import insert_case, fetch_all_cases, init_db
from cluster import detect_clusters, calculate_risk

app = FastAPI()

# 🔥 Enable CORS (frontend will need this)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# 🔥 Disease → Cause mapping
disease_causes = {
    "Cholera": "Contaminated water",
    "Flu": "Viral infection",
    "Dengue": "Mosquito bites",
    "Typhoid": "Unsafe food and water"
}

class UserInput(BaseModel):
    symptoms: list
    latitude: float
    longitude: float


# ==============================
# ✅ 1. SUBMIT API
# ==============================
@app.post("/submit")
def submit_data(data: UserInput):

    # Predict disease
    disease, prob = predict_disease(data.symptoms)

    # Get cause
    cause = disease_causes.get(disease, "Unknown")

    # Store case
    insert_case(
        data.symptoms,
        data.latitude,
        data.longitude,
        disease,
        prob
    )

    # Get all cases
    cases = fetch_all_cases()

    # Cluster + risk
    clusters = detect_clusters(cases)
    risk = calculate_risk(clusters)

    return {
        "disease": disease,
        "confidence": prob,
        "cause": cause,
        "risk": risk
    }


# ==============================
# ✅ 2. GET DATA (for map)
# ==============================
@app.get("/get-data")
def get_data():
    cases = fetch_all_cases()

    return [
        {
            "lat": c["lat"],
            "lon": c["lon"],
            "disease": c["disease"]
        }
        for c in cases
    ]


# ==============================
# ✅ 3. CLUSTERS API (outbreak zones)
# ==============================
@app.get("/clusters")
def get_clusters():
    cases = fetch_all_cases()
    clusters = detect_clusters(cases)

    result = []

    for cluster in clusters:
        result.append({
            "size": len(cluster),
            "lat": cluster[0]["lat"],
            "lon": cluster[0]["lon"]
        })

    return result


# ==============================
# ✅ 4. SIMPLE ALERT API (BONUS 🔥)
# ==============================
@app.get("/alert")
def get_alert():
    cases = fetch_all_cases()
    clusters = detect_clusters(cases)
    risk = calculate_risk(clusters)

    if risk == "High":
        return {"alert": "🚨 High outbreak risk detected!"}
    elif risk == "Medium":
        return {"alert": "⚠️ Moderate risk area"}
    else:
        return {"alert": "✅ Area is safe"}
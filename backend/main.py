from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from model import predict_disease
from database import insert_case, fetch_all_cases, init_db, get_connection
from cluster import detect_clusters, calculate_risk

app = FastAPI()

# ==============================
# 🔥 Enable CORS
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# ==============================
# 🔥 Input model (UPDATED)
# ==============================
class UserInput(BaseModel):
    symptoms: list
    location: list  # [lat, lon]

# ==============================
# 🔥 Static hospital list
# ==============================
hospitals = [
    {"name": "AIIMS Delhi", "lat": 28.567, "lon": 77.210},
    {"name": "Apollo Hospital", "lat": 28.535, "lon": 77.241},
    {"name": "Fortis Hospital", "lat": 28.567, "lon": 77.243}
]

def get_nearest_hospitals(user_lat, user_lon):
    def distance(h):
        return ((user_lat - h["lat"])**2 + (user_lon - h["lon"])**2) ** 0.5
    return sorted(hospitals, key=distance)[:3]

# ==============================
# ✅ 1. SUBMIT API (FIXED)
# ==============================
@app.post("/submit")
def submit(data: UserInput):
    symptoms = data.symptoms
    lat, lon = data.location

    result = predict_disease(symptoms)

    # 🔥 FIX
    if isinstance(result, tuple):
        disease = result[0]
        probability = result[1]
    else:
        disease = result
        probability = 0.85

    risk = "Low"
    if "fever" in symptoms:
        risk = "Medium"

    insert_case(symptoms, lat, lon, disease, probability)

    return {
        "predicted_disease": disease,
        "risk": risk
    }

# ==============================
# ✅ 2. GET DATA (MAP)
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
# ✅ 3. CLUSTERS API
# ==============================
@app.get("/clusters")
def get_clusters():
    cases = fetch_all_cases()

    clusters = detect_clusters(cases)

    result = []

    for c in clusters:
     size = c["size"]

    # 🔥 Risk logic
     if size >= 10:
        risk = "High"
     elif size >= 5:
        risk = "Medium"
     else:
        risk = "Low"

    # 🔥 Alert logic (IMPROVED)
     if size >= 10:
        alert = "🚨 High outbreak detected"
     elif size >= 5:
        alert = "⚠️ Moderate outbreak"
     else:
        alert = "Normal"

    # 🔥 Color for map
     if risk == "High":
        color = "red"
     elif risk == "Medium":
        color = "yellow"
     else:
        color = "green"

     result.append({
        "disease": c["disease"],
        "size": size,
        "lat": c["lat"],
        "lon": c["lon"],
        "risk": risk,
        "alert": alert,
        "color": color
    })

    return result

# ==============================
# ✅ 4. ALERT API
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

# ==============================
# ✅ 5. STATS API
# ==============================
@app.get("/stats")
def get_stats():
    cases = fetch_all_cases()

    disease_count = {}
    for c in cases:
        d = c["disease"]
        disease_count[d] = disease_count.get(d, 0) + 1

    return {
        "total_cases": len(cases),
        "disease_distribution": disease_count
    }

# ==============================
# ✅ 6. RECENT API
# ==============================
@app.get("/recent")
def get_recent():
    cases = fetch_all_cases(limit=10)

    return [
        {
            "lat": c["lat"],
            "lon": c["lon"],
            "disease": c["disease"],
            "time": c["timestamp"]
        }
        for c in cases
    ]

# ==============================
# ✅ 7. CLEAR API
# ==============================
@app.delete("/clear")
def clear_data():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM cases")
        count = cursor.fetchone()[0]

        cursor.execute("DELETE FROM cases")

        conn.commit()
        conn.close()

        return {
            "message": "All data cleared",
            "deleted_records": count
        }

    except Exception as e:
        return {"error": str(e)}
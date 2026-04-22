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
# 🔥 Disease → Cause mapping
# ==============================
disease_causes = {
    "Cholera": "Contaminated water",
    "Flu": "Viral infection",
    "Dengue": "Mosquito bites",
    "Typhoid": "Unsafe food and water"
}

# ==============================
# 🔥 Static hospital list
# ==============================
hospitals = [
    {"name": "AIIMS Delhi", "lat": 28.567, "lon": 77.210},
    {"name": "Apollo Hospital", "lat": 28.535, "lon": 77.241},
    {"name": "Fortis Hospital", "lat": 28.567, "lon": 77.243}
]

# ==============================
# 🔥 Helper: nearest hospitals
# ==============================
def get_nearest_hospitals(user_lat, user_lon):
    def distance(h):
        return ((user_lat - h["lat"])**2 + (user_lon - h["lon"])**2) ** 0.5

    sorted_h = sorted(hospitals, key=distance)
    return sorted_h[:3]


# ==============================
# 🔥 Input model
# ==============================
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

    # Cause + hospitals
    cause = disease_causes.get(disease, "Unknown")
    nearby_hospitals = get_nearest_hospitals(data.latitude, data.longitude)

    # Store case
    insert_case(
        data.symptoms,
        data.latitude,
        data.longitude,
        disease,
        prob
    )

    # Cluster + risk
    cases = fetch_all_cases()
    clusters = detect_clusters(cases)
    risk = calculate_risk(clusters)

    return {
        "disease": disease,
        "confidence": prob,
        "cause": cause,
        "risk": risk,
        "nearby_hospitals": nearby_hospitals
    }


# ==============================
# ✅ 2. GET DATA (map points)
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

    for cluster in clusters:
        size = cluster["size"]

        # 🔥 Risk calculation
        if size >= 10:
            risk = "High"
        elif size >= 5:
            risk = "Medium"
        else:
            risk = "Low"

        # 🔥 Alert logic
        alert = "⚠️ Possible outbreak detected" if size >= 5 else "Normal"

        # 🔥 Color for map
        if risk == "High":
            color = "red"
        elif risk == "Medium":
            color = "yellow"
        else:
            color = "green"

        result.append({
            "disease": cluster["disease"],
            "size": size,
            "lat": cluster["cases"][0]["lat"],
            "lon": cluster["cases"][0]["lon"],
            "risk": risk,
            "alert": alert,
            "zone_color": color
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

    total_cases = len(cases)

    disease_count = {}
    for c in cases:
        d = c["disease"]
        disease_count[d] = disease_count.get(d, 0) + 1

    return {
        "total_cases": total_cases,
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
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM cases")

    conn.commit()
    conn.close()

    return {"message": "All data cleared"}
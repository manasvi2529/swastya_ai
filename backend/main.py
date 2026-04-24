from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
# 🔥 In-memory Voting + Feedback
# ==============================
votes_data = {
    "yes": 0,
    "no": 0,
    "severity": {
        "mild": 0,
        "moderate": 0,
        "severe": 0
    }
}

feedback_data = {
    "correct": 0,
    "incorrect": 0
}

# ==============================
# 🔥 Input Models
# ==============================
class UserInput(BaseModel):
    symptoms: list
    location: Optional[list] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    def coordinates(self):
        if self.location is not None:
            if len(self.location) != 2:
                raise HTTPException(status_code=400, detail="location must be [lat, lon]")
            return float(self.location[0]), float(self.location[1])

        if self.latitude is not None and self.longitude is not None:
            return float(self.latitude), float(self.longitude)

        raise HTTPException(status_code=400, detail="Send location or lat/lon")


class VoteInput(BaseModel):
    vote: str
    severity: str


class FeedbackInput(BaseModel):
    correct: bool


# ==============================
# 🔥 Hospitals
# ==============================
hospitals = [
    {"name": "AIIMS Delhi", "lat": 28.567, "lon": 77.210},
    {"name": "Apollo Hospital", "lat": 28.535, "lon": 77.241},
    {"name": "Fortis Hospital", "lat": 28.567, "lon": 77.243},
    {"name": "Max Hospital", "lat": 28.567, "lon": 77.240},
    {"name": "Safdarjung Hospital", "lat": 28.570, "lon": 77.207},
    {"name": "BLK Hospital", "lat": 28.643, "lon": 77.189},
    {"name": "RML Hospital", "lat": 28.634, "lon": 77.202}
]

class LocationInput(BaseModel):
    lat: float
    lon: float


@app.post("/hospitals")
def get_hospitals(data: LocationInput):
    user_lat = data.lat
    user_lon = data.lon

    def distance(h):
        return ((user_lat - h["lat"])**2 + (user_lon - h["lon"])**2) ** 0.5

    sorted_hospitals = sorted(hospitals, key=distance)

    result = []
    for h in sorted_hospitals[:10]:
        result.append({
            "name": h["name"],
            "lat": h["lat"],
            "lon": h["lon"],
            "phone": h.get("phone", "Not available"),
            "distance": round(distance(h), 3)
        })

    return result

def get_nearest_hospitals(user_lat, user_lon):
    def distance(h):
        return ((user_lat - h["lat"])**2 + (user_lon - h["lon"])**2) ** 0.5

    return sorted(hospitals, key=distance)[:3]


# ==============================
# ✅ SUBMIT
# ============================== 
@app.post("/submit")
def submit(data: UserInput):
    symptoms = data.symptoms
    lat, lon = data.coordinates()

    disease, probability = predict_disease(symptoms)

    # 🔥 HARD SAFETY (FINAL CLEAN)
    if not disease:
        disease = "Unknown"

    if probability is None or probability == 0:
        probability = 0.6

    insert_case(symptoms, lat, lon, disease, probability)

    cases = fetch_all_cases()
    clusters = detect_clusters(cases)
    risk = calculate_risk(clusters)

    nearby_hospitals = get_nearest_hospitals(lat, lon)

    return {
        "predicted_disease": disease,
        "confidence": probability,
        "risk": risk,
        "nearby_hospitals": nearby_hospitals
    }
# ==============================
# ✅ MAP DATA
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
# ✅ CLUSTERS
# ==============================
@app.get("/clusters")
def get_clusters():
    cases = fetch_all_cases()
    clusters = detect_clusters(cases)

    result = []

    for c in clusters:
        size = c["size"]

        if size >= 10:
            risk = "High"
            color = "red"
            alert = "🚨 High outbreak detected"
        elif size >= 5:
            risk = "Medium"
            color = "yellow"
            alert = "⚠️ Moderate outbreak"
        else:
            risk = "Low"
            color = "green"
            alert = "Normal"

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
# ✅ ALERT
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
# ✅ STATS
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
# ✅ VOTE
# ==============================
@app.post("/vote")
def vote(data: VoteInput):
    if data.vote not in ["yes", "no"]:
        raise HTTPException(status_code=400, detail="Invalid vote")

    votes_data[data.vote] += 1

    if data.severity in votes_data["severity"]:
        votes_data["severity"][data.severity] += 1

    return {
        "message": "Vote recorded",
        "votes": votes_data
    }


# ==============================
# ✅ FEEDBACK
# ==============================
class FeedbackInput(BaseModel):
    correct: bool


@app.post("/feedback")
def feedback(data: FeedbackInput):
    if data.correct:
        feedback_data["correct"] += 1
    else:
        feedback_data["incorrect"] += 1

    return {"message": "Feedback recorded"}


@app.get("/feedback-stats")
def feedback_stats():
    total = feedback_data["correct"] + feedback_data["incorrect"]

    if total == 0:
        trust = 0.5
    else:
        trust = feedback_data["correct"] / total

    return {
        "correct": feedback_data["correct"],
        "incorrect": feedback_data["incorrect"],
        "trust_score": trust
    }
# ==============================
# 🔥 DOCTORS
# ==============================

doctors = [
    {
        "name": "Dr. Sharma",
        "specialization": "General Physician",
        "phone": "9876543210"
    },
    {
        "name": "Dr. Mehta",
        "specialization": "Cardiologist",
        "phone": "9123456780"
    },
    {
        "name": "Dr. Khan",
        "specialization": "Dermatologist",
        "phone": "9988776655"
    }
]
# ==============================
# 🔥 DOCTORS (Expanded list)
# ==============================

doctors = [
    {
        "name": "Dr. Sharma",
        "specialization": "General Physician",
        "phone": "9876543210",
        "experience": "15 years",
        "hospital": "City Hospital"
    },
    {
        "name": "Dr. Mehta",
        "specialization": "Cardiologist",
        "phone": "9123456780",
        "experience": "12 years",
        "hospital": "Heart Institute"
    },
    {
        "name": "Dr. Khan",
        "specialization": "Dermatologist",
        "phone": "9988776655",
        "experience": "8 years",
        "hospital": "Skin Clinic"
    },
    {
        "name": "Dr. Patel",
        "specialization": "General Physician",
        "phone": "9876543222",
        "experience": "10 years",
        "hospital": "Family Care Center"
    },
    {
        "name": "Dr. Gupta",
        "specialization": "General Physician",
        "phone": "9876543333",
        "experience": "20 years",
        "hospital": "Medical Center"
    },
    {
        "name": "Dr. Reddy",
        "specialization": "Cardiologist",
        "phone": "9123456777",
        "experience": "18 years",
        "hospital": "Heart Specialists"
    },
    {
        "name": "Dr. Singh",
        "specialization": "Dermatologist",
        "phone": "9988776444",
        "experience": "6 years",
        "hospital": "Skin & Hair Clinic"
    }
]

@app.get("/doctors")
def get_doctors(disease: str = None):
    disease_map = {
        "Flu": "General Physician",
        "Dengue": "General Physician",
        "Cold": "General Physician",
        "Fever": "General Physician",
        "Covid": "General Physician",
        "Heart Disease": "Cardiologist",
        "Chest Pain": "Cardiologist",
        "Skin Infection": "Dermatologist",
        "Rash": "Dermatologist",
        "Acne": "Dermatologist"
    }
    
    # If disease is provided, filter by specialization
    if disease:
        specialist = disease_map.get(disease, "General Physician")
        filtered = [d for d in doctors if d["specialization"] == specialist]
        
        # Return filtered doctors OR all if none match
        if filtered:
            return filtered
    
    # Return ALL doctors if no disease or no match
    return doctors

@app.get("/trend")
def trend():
    cases = fetch_all_cases()

    daily_counts = {}

    for c in cases:
        date = c["timestamp"].split("T")[0]  # YYYY-MM-DD

        if date not in daily_counts:
            daily_counts[date] = 0

        daily_counts[date] += 1

    labels = list(daily_counts.keys())
    data = list(daily_counts.values())

    return {
        "labels": labels,
        "data": data
    }
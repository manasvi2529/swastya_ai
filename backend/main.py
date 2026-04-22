from fastapi import FastAPI
from pydantic import BaseModel

from model import predict_disease
from database import insert_case, fetch_all_cases, init_db
from cluster import detect_clusters, calculate_risk

app = FastAPI()

init_db()   # 🔥 This creates table automatically

class UserInput(BaseModel):
    symptoms: list
    latitude: float
    longitude: float


@app.post("/submit")
def submit_data(data: UserInput):

    # Step 1: Predict disease using ML
    disease, prob = predict_disease(data.symptoms)

    # Step 2: Store in database
    insert_case(
        data.symptoms,
        data.latitude,
        data.longitude,
        disease,
        prob
    )

    # Step 3: Fetch all cases
    cases = fetch_all_cases()

    # Step 4: Detect clusters
    clusters = detect_clusters(cases)

    # Step 5: Calculate risk
    risk = calculate_risk(clusters)

    # Step 6: Return response
    return {
        "predicted_disease": disease,
        "confidence": prob,
        "risk": risk,
        "clusters": clusters
    }


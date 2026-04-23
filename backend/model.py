# ==============================
# ✅ Simple Rule-Based Disease Predictor
# ==============================

def predict_disease(symptoms):
    
    symptoms = [s.lower().strip() for s in symptoms]

    score = {
        "Cholera": 0,
        "Flu": 0,
        "Viral Infection": 0,
        "Typhoid": 0
    }

    if "diarrhea" in symptoms:
        score["Cholera"] += 3
    if "vomiting" in symptoms:
        score["Cholera"] += 2

    if "fever" in symptoms:
        score["Flu"] += 2
    if "cough" in symptoms:
        score["Flu"] += 2

    if "fatigue" in symptoms:
        score["Viral Infection"] += 2

    if "fever" in symptoms and "fatigue" in symptoms:
        score["Typhoid"] += 3

    predicted = max(score, key=score.get)
    total = sum(score.values())

    confidence = score[predicted] / total if total > 0 else 0.2

    return predicted, round(confidence, 2)
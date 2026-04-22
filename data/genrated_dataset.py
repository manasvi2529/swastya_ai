import pandas as pd
import random

symptoms = [
    "fever", "headache", "diarrhea",
    "vomiting", "fatigue", "cough", "body_pain"
]

disease_patterns = {
    "Flu": ["fever", "cough", "body_pain"],
    "Typhoid": ["fever", "fatigue", "headache"],
    "Cholera": ["diarrhea", "vomiting"],
    "Food Poisoning": ["vomiting", "diarrhea"],
    "Viral Infection": ["fever", "headache"]
}

data = []

for disease, base_symptoms in disease_patterns.items():
    for _ in range(40):
        row = {}

        for symptom in symptoms:
            if symptom in base_symptoms:
                row[symptom] = 1 if random.random() > 0.2 else 0
            else:
                row[symptom] = 1 if random.random() > 0.8 else 0

        row["disease"] = disease
        data.append(row)

df = pd.DataFrame(data)
df = df.sample(frac=1).reset_index(drop=True)

df.to_csv("dataset.csv", index=False)

print("Dataset generated successfully!")
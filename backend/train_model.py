import pandas as pd
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score
import pickle
import os

# ==============================
# ✅ Paths
# ==============================
BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "../data/dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

# ==============================
# ✅ Load dataset safely
# ==============================
if not os.path.exists(DATA_PATH):
    print("❌ Dataset not found at:", DATA_PATH)
    exit()

df = pd.read_csv(DATA_PATH)

# ==============================
# ✅ Validate dataset
# ==============================
if "disease" not in df.columns:
    print("❌ 'disease' column missing in dataset")
    exit()

# ==============================
# ✅ Features and labels
# ==============================
X = df.drop("disease", axis=1)
y = df["disease"]

# ==============================
# ✅ Train model
# ==============================
model = MultinomialNB()
model.fit(X, y)

# ==============================
# ✅ Evaluate (basic accuracy)
# ==============================
y_pred = model.predict(X)
accuracy = accuracy_score(y, y_pred)

print(f"✅ Training accuracy: {accuracy:.2f}")

# ==============================
# ✅ Save model
# ==============================
with open(MODEL_PATH, "wb") as f:
    pickle.dump(model, f)

print("✅ Model trained and saved at:", MODEL_PATH)
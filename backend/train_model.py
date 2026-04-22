import pandas as pd
from sklearn.naive_bayes import MultinomialNB
import pickle

# Load dataset
df = pd.read_csv("../data/dataset.csv")

# Features and labels
X = df.drop("disease", axis=1)
y = df["disease"]

# Train model
model = MultinomialNB()
model.fit(X, y)

# Save model
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained and saved!")
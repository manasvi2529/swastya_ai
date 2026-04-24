import sqlite3
from datetime import datetime
from pathlib import Path

DB_NAME = Path(__file__).resolve().parent / "epiguard.db"


# ==============================
# ✅ Get DB connection
# ==============================
def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # 🔥 makes rows behave like dict
    return conn


# ==============================
# ✅ Initialize DB
# ==============================
def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symptoms TEXT,
        latitude REAL,
        longitude REAL,
        disease TEXT,
        probability REAL,
        timestamp TEXT
    )
    """)

    conn.commit()
    conn.close()


# ==============================
# ✅ Insert new case
# ==============================
def insert_case(symptoms, lat, lon, disease, probability):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO cases (symptoms, latitude, longitude, disease, probability, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        ",".join(symptoms),
        lat,
        lon,
        disease,
        probability,
        datetime.now().isoformat()
    ))

    conn.commit()
    conn.close()


# ==============================
# ✅ Fetch ALL cases
# ==============================
def fetch_all_cases(limit=None):
    conn = get_connection()
    cursor = conn.cursor()

    if limit is None:
        cursor.execute("SELECT * FROM cases ORDER BY id ASC")
    else:
        cursor.execute("SELECT * FROM cases ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()

    conn.close()

    cases = []
    for row in rows:
        cases.append({
            "id": row["id"],
            "symptoms": row["symptoms"].split(","),
            "lat": row["latitude"],
            "lon": row["longitude"],
            "disease": row["disease"],
            "probability": row["probability"],
            "timestamp": row["timestamp"]
        })

    return cases


# ==============================
# ✅ Fetch recent cases (optional 🔥)
# ==============================
def fetch_recent_cases(minutes=60):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM cases
    WHERE timestamp >= datetime('now', ?)
    """, (f"-{minutes} minutes",))

    rows = cursor.fetchall()
    conn.close()

    cases = []
    for row in rows:
        cases.append({
            "id": row["id"],
            "symptoms": row["symptoms"].split(","),
            "lat": row["latitude"],
            "lon": row["longitude"],
            "disease": row["disease"],
            "probability": row["probability"],
            "timestamp": row["timestamp"]
        })

    return cases

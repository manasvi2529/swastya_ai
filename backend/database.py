import sqlite3
from datetime import datetime

DB_NAME = "epiguard.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
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


def insert_case(symptoms, lat, lon, disease, probability):
    conn = sqlite3.connect(DB_NAME)
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


def fetch_all_cases():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM cases")
    rows = cursor.fetchall()

    conn.close()

    cases = []
    for row in rows:
        cases.append({
            "id": row[0],
            "symptoms": row[1].split(","),
            "lat": row[2],
            "lon": row[3],
            "disease": row[4],
            "probability": row[5],
            "timestamp": row[6]
        })

    return cases
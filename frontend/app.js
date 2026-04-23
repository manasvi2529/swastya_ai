import React, { useState, useEffect } from "react";
import MapPage from "./map";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🩺 Swasthya AI</h1>

      {/* HOME PAGE */}
      {page === "home" && (
        <div>
          <h2>Welcome</h2>

          <button onClick={() => setPage("predict")}>
            🧠 Predict Disease
          </button>

          <br /><br />

          <button onClick={() => setPage("map")}>
            🗺️ View Outbreak Map
          </button>
        </div>
      )}

      {/* PREDICT PAGE */}
      {page === "predict" && (
        <PredictPage goHome={() => setPage("home")} />
      )}

      {/* MAP PAGE */}
      {page === "map" && (
        <div>
          <button onClick={() => setPage("home")}>⬅ Back</button>
          <MapPage />
        </div>
      )}
    </div>
  );
}

export default App;


// ==============================
// 🧠 PREDICT COMPONENT
// ==============================
function PredictPage({ goHome }) {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState("");
  const [location, setLocation] = useState(null);

  // 📍 Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([
          pos.coords.latitude,
          pos.coords.longitude
        ]);
      },
      () => alert("Location permission denied")
    );
  }, []);

  // 📤 Send data to backend
const submitData = async () => {
  if (!symptoms) {
    alert("Please enter symptoms");
    return;
  }

  if (!location) {
    alert("Location not ready!");
    return;
  }

  const data = {
    symptoms: symptoms.split(",").map(s => s.trim()),
    location: location
  };

  const res = await fetch("http://localhost:8000/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const response = await res.json();

  setResult(
    `Disease: ${response.predicted_disease} | Risk: ${response.risk}`
  );
};

return (
  <div>
    <button onClick={goHome}>⬅ Back</button>

    <h2>🧠 Predict Disease</h2>

    {/* INPUT FIELD */}
    <input
      type="text"
      placeholder="Enter symptoms (e.g fever, cough, vomiting)"
      value={symptoms}
      onChange={(e) => setSymptoms(e.target.value)}
      style={{
        padding: "10px",
        width: "300px",
        borderRadius: "8px",
        border: "1px solid #ccc"
      }}
    />

    <br /><br />

    {/* BUTTON */}
    <button onClick={submitData}>
      Predict
    </button>

    {/* RESULT */}
    <p style={{ marginTop: "15px", fontWeight: "bold" }}>
      {result}
    </p>
  </div>
);
}
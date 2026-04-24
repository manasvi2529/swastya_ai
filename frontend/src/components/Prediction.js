import { useState } from "react";

function Prediction() {
  const [symptoms, setSymptoms] = useState([]);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [locationReady, setLocationReady] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [feedbackSent, setFeedbackSent] = useState(false);
  const [trust, setTrust] = useState(null);   // 🔥 NEW

  const allSymptoms = ["fever", "diarrhea", "vomiting", "cough"];

  const handleCheckbox = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLon(pos.coords.longitude.toFixed(6));
        setLocationReady(true);
        setLocationError("");
      },
      () => {
        setLocationError("Permission denied");
      }
    );
  };

  const skipLocation = () => {
    setLat("");
    setLon("");
    setLocationReady(false);
  };

  const submitData = async () => {
    if (submitting) return;

    if (symptoms.length === 0) {
      alert("Select at least one symptom");
      return;
    }

    setSubmitting(true);

    try {
      const payload = { symptoms };

      if (lat && lon) {
        payload.location = [parseFloat(lat), parseFloat(lon)];
      }

      const res = await fetch("http://127.0.0.1:8000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setResult(data);
      setFeedbackSent(false);

      // 🔥 FETCH TRUST DATA
      const trustRes = await fetch("http://127.0.0.1:8000/feedback-stats");
      const trustData = await trustRes.json();
      setTrust(trustData);

    } catch (err) {
      console.error("Error:", err);
      alert("Backend error");
    } finally {
      setSubmitting(false);
    }
  };

  const sendFeedback = async (isCorrect) => {
    try {
      await fetch("http://127.0.0.1:8000/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ correct: isCorrect })
      });

      setFeedbackSent(true);

      // 🔥 REFRESH TRUST AFTER FEEDBACK
      const trustRes = await fetch("http://127.0.0.1:8000/feedback-stats");
      const trustData = await trustRes.json();
      setTrust(trustData);

    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  return (
    <div>
      <h3>🧠 Predict Disease</h3>

      {allSymptoms.map(s => (
        <label key={s} style={{ display: "block" }}>
          <input type="checkbox" onChange={() => handleCheckbox(s)} />
          {s}
        </label>
      ))}

      <br />

      <h4>📍 Location</h4>

      <button onClick={detectLocation}>Use My Location</button>

      <br /><br />

      <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
      <input value={lon} onChange={(e) => setLon(e.target.value)} placeholder="Longitude" />

      <br />

      {locationReady && <p>✅ Location detected</p>}
      {locationError && <p style={{ color: "red" }}>{locationError}</p>}

      <br />

      <button onClick={skipLocation}>Skip Location</button>

      <br /><br />

      <button onClick={submitData} disabled={submitting}>
        {submitting ? "Submitting..." : "Predict"}
      </button>

      {result && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          background: "#111827",
          borderRadius: "8px"
        }}>
          <h4>Prediction Result</h4>

          <p><b>Disease:</b> {result.predicted_disease}</p>

          {/* 🔥 NEW CONFIDENCE SYSTEM */}
<p>
  <b>Base Confidence:</b>{" "}
  {result.confidence !== undefined && result.confidence !== null
    ? (result.confidence * 100).toFixed(1)
    : "N/A"}%
</p>
          {trust && (
            <>
              <p><b>Community Trust:</b> {(trust.trust_score * 100).toFixed(1)}%</p>

              <p>
                <b>Final Confidence:</b>{" "}
                {(
                  result.confidence *
                  (0.5 + trust.trust_score) *
                  100
                ).toFixed(1)}%
              </p>
            </>
          )}

          <p><b>Risk:</b> {result.risk}</p>

          {lat && lon ? (
            <p>📍 Based on your location</p>
          ) : (
            <p>🌍 Showing general trends</p>
          )}

          <h5>Nearby Hospitals:</h5>

{result.nearby_hospitals?.slice(0, 3).map((h, i) => (
  <div key={i} style={{
    padding: "10px",
    marginTop: "8px",
    background: "#1e293b",
    borderRadius: "8px"
  }}>
    🏥 {h.name}
  </div>
))}

<button
  style={{
    marginTop: "12px",
    padding: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
  onClick={() => window.location.href = "/hospitals"}
>
  View Details / Book Appointment →
</button>

          {!feedbackSent ? (
            <div style={{ marginTop: "15px" }}>
              <p><b>Was this prediction correct?</b></p>

              <button onClick={() => sendFeedback(true)}>👍 Correct</button>
              <button onClick={() => sendFeedback(false)}>👎 Not Correct</button>
            </div>
          ) : (
            <p style={{ color: "green", marginTop: "10px" }}>
              ✅ Thanks for your feedback!
            </p>
          )}

          <div style={{ marginTop: "15px", fontSize: "12px", color: "#9ca3af" }}>
            🔒 Anonymous system • No personal data stored • Community validated
          </div>
        </div>
      )}
    </div>
  );
}

export default Prediction;
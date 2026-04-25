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
      <h3 style={sectionTitle}>🧠 Predict Disease</h3>

      <div style={symptomGrid}>
        {allSymptoms.map(s => (
          <label key={s} style={symptomLabel}>
            <input 
              type="checkbox" 
              onChange={() => handleCheckbox(s)} 
              style={checkbox}
            />
            <span style={symptomText}>{s}</span>
          </label>
        ))}
      </div>

      <h4 style={subTitle}>📍 Location</h4>

      <button onClick={detectLocation} style={locationBtn}>
        📍 Use My Location
      </button>

      <div style={inputRow}>
        <input 
          value={lat} 
          onChange={(e) => setLat(e.target.value)} 
          placeholder="Latitude" 
          style={input}
        />
        <input 
          value={lon} 
          onChange={(e) => setLon(e.target.value)} 
          placeholder="Longitude" 
          style={input}
        />
      </div>

      {locationReady && <p style={successMsg}>✅ Location detected</p>}
      {locationError && <p style={errorMsg}>{locationError}</p>}

      <button onClick={skipLocation} style={skipBtn}>
        Skip Location
      </button>

      <button onClick={submitData} disabled={submitting} style={submitBtn}>
        {submitting ? "⏳ Analyzing..." : "🔬 Predict Disease"}
      </button>

      {result && (
        <div style={resultCard}>
          <h4 style={resultTitle}>🎯 Prediction Result</h4>

          <div style={resultMain}>
            <span style={resultLabel}>Disease</span>
            <span style={resultValue}>{result.predicted_disease}</span>
          </div>

          {/* 🔥 NEW CONFIDENCE SYSTEM */}
          <div style={confidenceRow}>
            <div style={confidenceItem}>
              <span style={confLabel}>Base Confidence</span>
              <span style={confValue}>
                {result.confidence !== undefined && result.confidence !== null
                  ? (result.confidence * 100).toFixed(1)
                  : "N/A"}%
              </span>
            </div>
            {trust && (
              <div style={confidenceItem}>
                <span style={confLabel}>Community Trust</span>
                <span style={confValue}>{(trust.trust_score * 100).toFixed(1)}%</span>
              </div>
            )}
            {trust && (
              <div style={{...confidenceItem, background: "rgba(99, 102, 241, 0.2)"}}>
                <span style={confLabel}>Final Confidence</span>
                <span style={{...confValue, color: "#818cf8"}}>
                  {(
                    result.confidence *
                    (0.5 + trust.trust_score) *
                    100
                  ).toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Risk Level */}
          <div style={riskSection}>
            <span style={resultLabel}>Risk Level</span>
            {result.risk === "High" && (
              <div style={riskBadgeHigh}>
                🚨 High Risk Area Detected<br/>
                <span style={riskSub}>Avoid crowded places</span>
              </div>
            )}

            {result.risk === "Medium" && (
              <div style={riskBadgeMedium}>
                ⚠️ Moderate Risk<br/>
                <span style={riskSub}>Stay cautious</span>
              </div>
            )}

            {result.risk === "Low" && (
              <div style={riskBadgeLow}>
                ✅ Low Risk Area
              </div>
            )}
          </div>

          {lat && lon ? (
            <p style={locationNote}>📍 Based on your location</p>
          ) : (
            <p style={locationNote}>🌍 Showing general trends</p>
          )}

          <h5 style={hospitalTitle}>🏥 Nearby Hospitals:</h5>

          {result.nearby_hospitals?.slice(0, 3).map((h, i) => (
            <div key={i} style={hospitalItem}>
              🏥 {h.name}
            </div>
          ))}

          <button
            style={viewBtn}
            onClick={() => window.location.href = "/hospitals"}
          >
            View Details / Book Appointment →
          </button>

          {!feedbackSent ? (
            <div style={feedbackSection}>
              <p style={feedbackTitle}><b>Was this prediction correct?</b></p>

              <div style={feedbackBtns}>
                <button onClick={() => sendFeedback(true)} style={yesBtn}>👍 Correct</button>
                <button onClick={() => sendFeedback(false)} style={noBtn}>👎 Not Correct</button>
              </div>
            </div>
          ) : (
            <p style={thanksMsg}>
              ✅ Thanks for your feedback!
            </p>
          )}

          <div style={disclaimer}>
            🔒 Anonymous system • No personal data stored • Community validated
          </div>
        </div>
      )}
    </div>
  );
}

const sectionTitle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  marginBottom: "16px",
  color: "#fafafa"
};

const subTitle = {
  fontSize: "0.95rem",
  fontWeight: "500",
  marginTop: "20px",
  marginBottom: "12px",
  color: "#a1a1aa"
};

const symptomGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "10px",
  marginBottom: "16px"
};

const symptomLabel = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 16px",
  background: "rgba(24, 24, 27, 0.8)",
  borderRadius: "10px",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const checkbox = {
  width: "18px",
  height: "18px",
  accentColor: "#6366f1"
};

const symptomText = {
  color: "#e4e4e7",
  fontSize: "0.9rem",
  textTransform: "capitalize"
};

const locationBtn = {
  display: "block",
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #10b981, #059669)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.9rem",
  marginBottom: "12px",
  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
};

const inputRow = {
  display: "flex",
  gap: "10px",
  marginBottom: "12px"
};

const input = {
  flex: 1,
  padding: "12px 14px",
  background: "rgba(24, 24, 27, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "10px",
  color: "white",
  fontSize: "0.85rem"
};

const successMsg = {
  color: "#22c55e",
  fontSize: "0.85rem",
  marginBottom: "8px"
};

const errorMsg = {
  color: "#ef4444",
  fontSize: "0.85rem",
  marginBottom: "8px"
};

const skipBtn = {
  padding: "10px 16px",
  background: "transparent",
  color: "#71717a",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.85rem",
  marginRight: "8px"
};

const submitBtn = {
  padding: "14px 24px",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.95rem",
  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)",
  marginTop: "8px"
};

const resultCard = {
  marginTop: "24px",
  padding: "20px",
  background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.6))",
  borderRadius: "16px",
  border: "1px solid rgba(99, 102, 241, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
};

const resultTitle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  marginBottom: "16px",
  color: "#fafafa"
};

const resultMain = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  background: "rgba(99, 102, 241, 0.15)",
  borderRadius: "12px",
  marginBottom: "16px"
};

const resultLabel = {
  color: "#a1a1aa",
  fontSize: "0.85rem"
};

const resultValue = {
  color: "#818cf8",
  fontSize: "1.25rem",
  fontWeight: "700",
  textTransform: "capitalize"
};

const confidenceRow = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "10px",
  marginBottom: "16px"
};

const confidenceItem = {
  padding: "12px",
  background: "rgba(24, 24, 27, 0.8)",
  borderRadius: "10px",
  textAlign: "center"
};

const confLabel = {
  display: "block",
  fontSize: "0.7rem",
  color: "#71717a",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "4px"
};

const confValue = {
  color: "#22c55e",
  fontSize: "1rem",
  fontWeight: "600"
};

const riskSection = {
  marginBottom: "16px"
};

const riskBadgeHigh = {
  padding: "14px",
  background: "rgba(239, 68, 68, 0.15)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: "10px",
  color: "#fca5a5",
  fontSize: "0.9rem",
  fontWeight: "500"
};

const riskBadgeMedium = {
  padding: "14px",
  background: "rgba(251, 191, 36, 0.15)",
  border: "1px solid rgba(251, 191, 36, 0.3)",
  borderRadius: "10px",
  color: "#fde047",
  fontSize: "0.9rem",
  fontWeight: "500"
};

const riskBadgeLow = {
  padding: "14px",
  background: "rgba(34, 197, 94, 0.15)",
  border: "1px solid rgba(34, 197, 94, 0.3)",
  borderRadius: "10px",
  color: "#22c55e",
  fontSize: "0.9rem",
  fontWeight: "500"
};

const riskSub = {
  fontSize: "0.8rem",
  opacity: 0.8
};

const locationNote = {
  color: "#71717a",
  fontSize: "0.85rem",
  marginBottom: "16px"
};

const hospitalTitle = {
  fontSize: "0.95rem",
  fontWeight: "500",
  color: "#a1a1aa",
  marginBottom: "10px"
};

const hospitalItem = {
  padding: "12px 16px",
  background: "rgba(24, 24, 27, 0.8)",
  borderRadius: "10px",
  marginBottom: "8px",
  color: "#e4e4e7",
  fontSize: "0.9rem"
};

const viewBtn = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.9rem",
  marginTop: "16px",
  boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)"
};

const feedbackSection = {
  marginTop: "20px",
  paddingTop: "16px",
  borderTop: "1px solid rgba(255, 255, 255, 0.06)"
};

const feedbackTitle = {
  color: "#a1a1aa",
  fontSize: "0.9rem",
  marginBottom: "12px"
};

const feedbackBtns = {
  display: "flex",
  gap: "10px"
};

const yesBtn = {
  flex: 1,
  padding: "12px",
  background: "rgba(34, 197, 94, 0.2)",
  color: "#22c55e",
  border: "1px solid rgba(34, 197, 94, 0.3)",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "500"
};

const noBtn = {
  flex: 1,
  padding: "12px",
  background: "rgba(239, 68, 68, 0.2)",
  color: "#fca5a5",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "500"
};

const thanksMsg = {
  color: "#22c55e",
  marginTop: "12px",
  fontSize: "0.9rem"
};

const disclaimer = {
  marginTop: "20px",
  fontSize: "0.75rem",
  color: "#52525b",
  textAlign: "center"
};

export default Prediction;
import { useState } from "react";

function Form({ setResult, onSubmitted }) {
  const [symptoms, setSymptoms] = useState([]);
  const [lat, setLat] = useState(28.61);
  const [lon, setLon] = useState(77.23);
  const [submitting, setSubmitting] = useState(false);

  const allSymptoms = ["fever", "diarrhea", "vomiting", "cough"];

  const handleCheckbox = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const submitData = async () => {
    if (submitting) return;
    if (symptoms.length === 0) {
      alert("Select at least one symptom");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          symptoms,
          location: [parseFloat(lat), parseFloat(lon)]
        })
      });

      if (!res.ok) {
        throw new Error(`Submit failed: ${res.status}`);
      }

      const data = await res.json();
      console.log("Submitted case:", data);
      setResult(data);
      onSubmitted?.();
    } catch (err) {
      console.error("Error submitting case:", err);
      alert("Could not submit case. Check backend logs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Enter Symptoms</h2>

      {allSymptoms.map(s => (
        <label key={s} style={{ display: "block" }}>
          <input type="checkbox" onChange={() => handleCheckbox(s)} />
          {s}
        </label>
      ))}

      <br />

      <input value={lat} onChange={(e) => setLat(e.target.value)} />
      <input value={lon} onChange={(e) => setLon(e.target.value)} />

      <br /><br />

      <button onClick={submitData} disabled={submitting}>
        {submitting ? "Submitting..." : "Predict"}
      </button>
    </div>
  );
}

export default Form;

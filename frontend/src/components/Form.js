import { useState } from "react";

function Form({ setResult }) {
  const [symptoms, setSymptoms] = useState([]);
  const [lat, setLat] = useState(28.61);
  const [lon, setLon] = useState(77.23);

  const allSymptoms = ["fever", "diarrhea", "vomiting", "cough"];

  const handleCheckbox = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const submitData = async () => {
    const res = await fetch("http://127.0.0.1:8000/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        symptoms,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      })
    });

    const data = await res.json();
    setResult(data);
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

      <button onClick={submitData}>Predict</button>
    </div>
  );
}

export default Form;
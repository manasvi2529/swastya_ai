import React, { useState } from "react";
import axios from "axios";

function App() {
  const [symptoms, setSymptoms] = useState([]);
  const [result, setResult] = useState(null);

  const submitData = async () => {
    const response = await axios.post("http://127.0.0.1:8000/submit", {
      symptoms: symptoms,
      latitude: 28.61,
      longitude: 77.23
    });

    setResult(response.data);
  };

  return (
    <div>
      <h1>EpiGuard AI</h1>

      <button onClick={() => setSymptoms([...symptoms, "fever"])}>Fever</button>
      <button onClick={() => setSymptoms([...symptoms, "diarrhea"])}>Diarrhea</button>

      <button onClick={submitData}>Submit</button>

      {result && (
        <div>
          <h2>Disease: {result.predicted_disease}</h2>
          <h3>Risk: {result.risk}</h3>
        </div>
      )}
    </div>
  );
}

export default App;
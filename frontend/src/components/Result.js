function Result({ result }) {
  if (!result) return null;

  return (
    <div>
      <h3>Prediction Result</h3>

      <p><b>Disease:</b> {result.predicted_disease}</p>
      <p><b>Confidence:</b> {result.confidence.toFixed(2)}</p>
      <p><b>Risk Level:</b> {result.risk}</p>

      <h4>Nearby Hospitals:</h4>
      <ul>
        {result.nearby_hospitals.map((h, i) => (
          <li key={i}>{h.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Result;

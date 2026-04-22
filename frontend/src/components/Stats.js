import { useEffect, useState } from "react";

function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/stats")
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return null;

  return (
    <div>
      <h3>Statistics</h3>
      <p>Total Cases: {stats.total_cases}</p>

      <ul>
        {Object.entries(stats.disease_distribution).map(([d, c]) => (
          <li key={d}>{d}: {c}</li>
        ))}
      </ul>
    </div>
  );
}

export default Stats;
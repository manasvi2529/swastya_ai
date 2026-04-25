import { useEffect, useState } from "react";

function Stats({ refreshKey }) {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/stats");

    if (!res.ok) {
      console.error("API failed:", res.status);
      return;
    }

    const data = await res.json();

    console.log("DATA:", data);

    // 🔥 GUARANTEE VALID OBJECT
    setStats({
      total_cases: data.total_cases || 0,
      disease_distribution: data.disease_distribution || {}
    });

  } catch (err) {
    console.error("Stats error:", err);
  }
};

  useEffect(() => {
    fetchStats();

    // 🔥 Auto refresh every 5s
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  if (stats === null) return <p>Loading stats...</p>;

if (!stats.total_cases && !stats.disease_distribution) {
  return <p>No data available</p>;
}

  return (
    <div>
      <h3>📊 Live Statistics</h3>

      {/* 🔥 Total Cases Card */}
      <div style={card}>
        <h4>Total Cases</h4>
        <p style={{ fontSize: "24px", fontWeight: "bold" }}>
          {stats.total_cases}
        </p>
      </div>

      {/* 🔥 Disease Distribution */}
      <div style={card}>
        <h4>Disease Distribution</h4>

        {Object.keys(stats.disease_distribution).length === 0 ? (
          <p>No data yet</p>
        ) : (
          <ul>
            {Object.entries(stats.disease_distribution).map(([d, c]) => (
              <li key={d}>
                {d}: <b>{c}</b>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const card = {
  background: "#111827",
  padding: "15px",
  borderRadius: "10px",
  marginTop: "10px"
};

export default Stats;
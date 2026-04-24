import { useEffect, useState } from "react";

function TrendGraph() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/trend")
      .then(res => res.json())
      .then(res => {
        setData(res.data || []);
      })
      .catch(err => console.error("Trend error:", err));
  }, []);

  if (data.length === 0) return <p>Loading trend...</p>;

  return (
    <div style={{
      background: "#111827",
      padding: "15px",
      borderRadius: "10px",
      marginTop: "15px"
    }}>
      <h3>📈 Outbreak Trend</h3>

      {/* SIMPLE BARS */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        height: "150px",
        gap: "8px"
      }}>
        {data.map((val, i) => (
          <div
            key={i}
            style={{
              width: "20px",
              height: `${val * 5}px`,
              background: "#2563eb",
              borderRadius: "4px"
            }}
            title={`Cases: ${val}`}
          />
        ))}
      </div>
    </div>
  );
}

export default TrendGraph;
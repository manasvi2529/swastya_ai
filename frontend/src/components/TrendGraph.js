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

  if (data.length === 0) return <p style={loading}>⏳ Loading trend...</p>;

  return (
    <div style={container}>
      <h3 style={title}>📈 Outbreak Trend</h3>

      {/* SIMPLE BARS */}
      <div style={chartContainer}>
        {data.map((val, i) => (
          <div
            key={i}
            style={{
              ...bar,
              height: `${Math.max(val * 5, 10)}px`,
              background: `linear-gradient(180deg, #6366f1, #8b5cf6)`
            }}
            title={`Cases: ${val}`}
          />
        ))}
      </div>
      
      <div style={xAxis}>
        {data.map((_, i) => (
          <span key={i} style={xLabel}>D{i+1}</span>
        ))}
      </div>
    </div>
  );
}

const loading = {
  color: "#71717a",
  fontSize: "0.9rem",
  padding: "20px",
  textAlign: "center"
};

const container = {
  background: "linear-gradient(145deg, rgba(24, 24, 27, 0.9), rgba(24, 24, 27, 0.5))",
  padding: "20px",
  borderRadius: "16px",
  backdropFilter: "blur(12px)"
};

const title = {
  fontSize: "1.1rem",
  fontWeight: "600",
  marginBottom: "20px",
  color: "#fafafa"
};

const chartContainer = {
  display: "flex",
  alignItems: "flex-end",
  height: "150px",
  gap: "8px",
  padding: "0 10px"
};

const bar = {
  flex: 1,
  borderRadius: "6px 6px 2px 2px",
  minHeight: "10px",
  transition: "all 0.3s ease",
  cursor: "pointer"
};

const xAxis = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 10px 0",
  marginTop: "8px"
};

const xLabel = {
  color: "#71717a",
  fontSize: "0.7rem"
};

export default TrendGraph;
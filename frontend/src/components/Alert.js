import { useEffect, useState } from "react";

function Alert({ refreshKey }) {
  const [alert, setAlert] = useState("");
  const [level, setLevel] = useState("safe");

  const fetchAlert = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/alert");
      const data = await res.json();

      setAlert(data.alert);

      // 🔥 Detect level based on message
      if (data.alert.toLowerCase().includes("high")) {
        setLevel("high");
      } else if (data.alert.toLowerCase().includes("moderate")) {
        setLevel("medium");
      } else {
        setLevel("safe");
      }

    } catch (err) {
      console.error("Alert error:", err);
    }
  };

  useEffect(() => {
    fetchAlert();

    // 🔥 Auto refresh
    const interval = setInterval(fetchAlert, 5000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  return (
    <div style={{
      ...card,
      border: `2px solid ${colors[level]}`
    }}>
      <h3 style={alertTitle}>
        {icons[level]} System Alert
      </h3>

      <p style={alertText}>
        {alert || "No alerts yet"}
      </p>
    </div>
  );
}

const alertTitle = {
  fontSize: "1rem",
  fontWeight: "600",
  marginBottom: "12px",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const alertText = {
  fontSize: "1.1rem",
  fontWeight: "500",
  lineHeight: "1.5"
};

const colors = {
  high: "#ef4444",
  medium: "#f59e0b",
  safe: "#22c55e"
};

const icons = {
  high: "🚨",
  medium: "⚠️",
  safe: "✅"
};

const card = {
  background: "linear-gradient(145deg, rgba(24, 24, 27, 0.9), rgba(24, 24, 27, 0.5))",
  padding: "20px",
  borderRadius: "16px",
  textAlign: "center",
  backdropFilter: "blur(12px)"
};

export default Alert;
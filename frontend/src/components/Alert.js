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
      <h3 style={{ color: colors[level] }}>
        {icons[level]} System Alert
      </h3>

      <p style={{ fontSize: "18px" }}>
        {alert || "No alerts yet"}
      </p>
    </div>
  );
}

const colors = {
  high: "red",
  medium: "orange",
  safe: "green"
};

const icons = {
  high: "🚨",
  medium: "⚠️",
  safe: "✅"
};

const card = {
  background: "#111827",
  padding: "15px",
  borderRadius: "10px",
  textAlign: "center"
};

export default Alert;
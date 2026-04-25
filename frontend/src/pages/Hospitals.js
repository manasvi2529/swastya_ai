import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function Hospitals() {
  const location = useLocation();

  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [lat, setLat] = useState(location.state?.lat || "");
  const [lon, setLon] = useState(location.state?.lon || "");
  const [disease, setDisease] = useState(location.state?.disease || "");

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("hospitals");

  // 📍 Detect location
  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLon(pos.coords.longitude.toFixed(6));
      },
      () => alert("Location permission denied")
    );
  };

  // 🏥 Fetch hospitals
  const fetchHospitals = async () => {
    setLoading(true);

    try {
      let res;

      // 🔥 CASE 1: user has location
      if (lat && lon) {
        res = await fetch("http://127.0.0.1:8000/hospitals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            lat: parseFloat(lat),
            lon: parseFloat(lon)
          })
        });
      } 
      // 🔥 CASE 2: fallback (no location)
      else {
        res = await fetch("http://127.0.0.1:8000/hospitals-default");
      }

      const data = await res.json();
      setHospitals(Array.isArray(data) ? data : data.hospitals || []);

    } catch (err) {
      console.error(err);
      alert("Error loading hospitals");
    }

    setLoading(false);
  };

  // 👨‍⚕️ Fetch doctors (based on disease)
  const fetchDoctors = async () => {
  try {
    let url = "http://127.0.0.1:8000/doctors";

    if (disease) {
      url += `?disease=${encodeURIComponent(disease)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    console.log("Doctors API response:", data);

    // ✅ Directly set the data (no need to combine anything)
    setDoctors(Array.isArray(data) ? data : []);

  } catch (err) {
    console.error("Doctor error", err);
    setDoctors([]);
  }
};

  // 🔥 AUTO LOAD
  useEffect(() => {
    fetchHospitals();
    fetchDoctors();
  }, []);

  return (
    <div style={pageContainer}>

      {/* LEFT PANEL */}
      <div style={leftPanel}>

        {/* 🔥 CONTEXT INFO */}
        {disease && (
          <p style={contextBadge}>
            ✨ Recommended for: {disease}
          </p>
        )}

        {!lat && !lon && (
          <p style={locationHint}>
            📍 Showing general hospitals (add location for better results)
          </p>
        )}

        {/* 🔥 TAB SWITCH */}
        <div style={tabContainer}>
          <button
            style={tab === "hospitals" ? activeTab : tabBtn}
            onClick={() => setTab("hospitals")}
          >
            🏥 Hospitals
          </button>

          <button
            style={tab === "doctors" ? activeTab : tabBtn}
            onClick={() => setTab("doctors")}
          >
            👨‍⚕️ Doctors
          </button>
        </div>

        {/* ======================
            🏥 HOSPITAL VIEW
        ====================== */}
        {tab === "hospitals" && (
          <>
            <button onClick={detectLocation} style={primaryBtn}>
              📍 Use My Location
            </button>

            <div style={inputGroup}>
              <input
                placeholder="Latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                style={input}
              />
              <input
                placeholder="Longitude"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                style={input}
              />
            </div>

            <button onClick={fetchHospitals} style={refreshBtn}>
              {loading ? "⏳ Loading..." : "🔄 Refresh Hospitals"}
            </button>

            {hospitals.map((h, i) => (
              <div key={i} style={hospitalCard}>
                <h4 style={hospitalName}>{h.name}</h4>

                {h.distance && <p style={distance}>📍 {h.distance} km away</p>}
                <p style={phone}>📞 {h.phone}</p>

                <div style={btnGroup}>
                  <a href={`tel:${h.phone}`}>
                    <button style={callBtn}>📞 Call</button>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button style={directionBtn}>🧭 Directions</button>
                  </a>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ======================
            👨‍⚕️ DOCTOR VIEW
        ====================== */}
        {tab === "doctors" && (
          <>
            {doctors.map((d, i) => (
              <div key={i} style={hospitalCard}>
                <h4 style={hospitalName}>{d.name}</h4>
                <p style={specialization}>{d.specialization}</p>
                <p style={phone}>📞 {d.phone}</p>

                <div style={btnGroup}>
                  <a href={`tel:${d.phone}`}>
                    <button style={callBtn}>📞 Call</button>
                  </a>

                  <button
                    style={bookBtn}
                    onClick={() => alert("Appointment requested")}
                  >
                    📅 Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

      </div>

      {/* RIGHT MAP */}
      <div style={rightPanel}>
        <iframe
          title="map"
          width="100%"
          height="100%"
          style={{ border: "none" }}
          src="https://www.openstreetmap.org/export/embed.html"
        />
      </div>

    </div>
  );
}

const pageContainer = {
  display: "flex",
  height: "calc(100vh - 40px)",
  background: "#0a0a0f"
};

const leftPanel = {
  width: "35%",
  minWidth: "320px",
  background: "linear-gradient(180deg, rgba(10,10,15,0.98), rgba(24,24,27,0.95))",
  padding: "20px",
  overflowY: "auto",
  borderRight: "1px solid rgba(255,255,255,0.06)"
};

const rightPanel = {
  width: "65%",
  background: "#18181b"
};

const contextBadge = {
  color: "#22c55e",
  fontWeight: "600",
  fontSize: "0.9rem",
  padding: "10px 14px",
  background: "rgba(34, 197, 94, 0.1)",
  borderRadius: "10px",
  marginBottom: "16px",
  border: "1px solid rgba(34, 197, 94, 0.2)"
};

const locationHint = {
  color: "#fbbf24",
  fontSize: "0.85rem",
  padding: "10px 14px",
  background: "rgba(251, 191, 36, 0.1)",
  borderRadius: "10px",
  marginBottom: "16px",
  border: "1px solid rgba(251, 191, 36, 0.2)"
};

const tabContainer = {
  display: "flex",
  gap: "8px",
  marginBottom: "20px"
};

const tabBtn = {
  flex: 1,
  padding: "12px",
  background: "rgba(24, 24, 27, 0.8)",
  color: "#a1a1aa",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "0.85rem",
  transition: "all 0.2s ease"
};

const activeTab = {
  ...tabBtn,
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white",
  border: "none",
  boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)"
};

const primaryBtn = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #10b981, #059669)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.9rem",
  marginBottom: "16px",
  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
};

const inputGroup = {
  display: "flex",
  gap: "10px",
  marginBottom: "12px"
};

const input = {
  flex: 1,
  padding: "12px 14px",
  background: "rgba(24, 24, 27, 0.8)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "white",
  fontSize: "0.85rem"
};

const refreshBtn = {
  width: "100%",
  padding: "12px",
  background: "rgba(24, 24, 27, 0.8)",
  color: "#e4e4e7",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "0.85rem",
  marginBottom: "20px"
};

const hospitalCard = {
  background: "linear-gradient(145deg, rgba(24, 24, 27, 0.9), rgba(24, 24, 27, 0.5))",
  padding: "16px",
  marginTop: "12px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  transition: "all 0.2s ease"
};

const hospitalName = {
  fontSize: "1rem",
  fontWeight: "600",
  color: "#fafafa",
  marginBottom: "8px"
};

const distance = {
  color: "#818cf8",
  fontSize: "0.85rem",
  marginBottom: "4px"
};

const phone = {
  color: "#a1a1aa",
  fontSize: "0.85rem",
  marginBottom: "12px"
};

const specialization = {
  color: "#c084fc",
  fontSize: "0.85rem",
  marginBottom: "4px"
};

const btnGroup = {
  display: "flex",
  gap: "8px"
};

const callBtn = {
  flex: 1,
  padding: "10px",
  background: "rgba(99, 102, 241, 0.2)",
  color: "#818cf8",
  border: "1px solid rgba(99, 102, 241, 0.3)",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "0.8rem"
};

const directionBtn = {
  flex: 1,
  padding: "10px",
  background: "rgba(34, 197, 94, 0.2)",
  color: "#22c55e",
  border: "1px solid rgba(34, 197, 94, 0.3)",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "0.8rem"
};

const bookBtn = {
  flex: 1,
  padding: "10px",
  background: "rgba(192, 132, 252, 0.2)",
  color: "#c084fc",
  border: "1px solid rgba(192, 132, 252, 0.3)",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "0.8rem"
};

export default Hospitals;
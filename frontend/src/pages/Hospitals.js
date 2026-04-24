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
    <div style={{ display: "flex", height: "100vh" }}>

      {/* LEFT PANEL */}
      <div style={{
        width: "30%",
        background: "#0f172a",
        padding: "15px",
        overflowY: "auto"
      }}>

        {/* 🔥 CONTEXT INFO */}
        {disease && (
          <p style={{ color: "#22c55e", fontWeight: "bold" }}>
            Recommended for: {disease}
          </p>
        )}

        {!lat && !lon && (
          <p style={{ color: "orange" }}>
            📍 Showing general hospitals (add location for better results)
          </p>
        )}

        {/* 🔥 TAB SWITCH */}
        <div style={{ display: "flex", marginBottom: "15px" }}>
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
            <button onClick={detectLocation}>Use My Location</button>

            <br /><br />

            <input
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
            <input
              placeholder="Longitude"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
            />

            <br /><br />

            <button onClick={fetchHospitals}>
              {loading ? "Loading..." : "Refresh Hospitals"}
            </button>

            {hospitals.map((h, i) => (
              <div key={i} style={card}>
                <h4>{h.name}</h4>

                {h.distance && <p>📍 {h.distance} km away</p>}
                <p>📞 {h.phone}</p>

                <a href={`tel:${h.phone}`}>
                  <button style={btn}>Call</button>
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <button style={btn}>Directions</button>
                </a>
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
              <div key={i} style={card}>
                <h4>{d.name}</h4>
                <p>{d.specialization}</p>
                <p>📞 {d.phone}</p>

                <a href={`tel:${d.phone}`}>
                  <button style={btn}>Call</button>
                </a>

                <button
                  style={btn}
                  onClick={() => alert("Appointment requested")}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </>
        )}

      </div>

      {/* RIGHT MAP */}
      <div style={{ width: "70%" }}>
        <iframe
          title="map"
          width="100%"
          height="100%"
          src="https://www.openstreetmap.org/export/embed.html"
        />
      </div>

    </div>
  );
}

const tabBtn = {
  flex: 1,
  padding: "10px",
  background: "#1e293b",
  color: "white",
  border: "none",
  cursor: "pointer"
};

const activeTab = {
  ...tabBtn,
  background: "#2563eb"
};

const card = {
  background: "#1e293b",
  padding: "15px",
  marginTop: "10px",
  borderRadius: "10px"
};

const btn = {
  marginTop: "8px",
  marginRight: "8px",
  padding: "8px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

export default Hospitals;
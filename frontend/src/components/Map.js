import { useEffect, useRef, useState } from "react";

function Map() {
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const heatRef = useRef(null);

  const [mode, setMode] = useState("outbreak");
  const modeRef = useRef("outbreak"); // 🔥 FIX

  const [stats, setStats] = useState({ cases: 0, clusters: 0 });

  const loadMapDataRef = useRef(null);

  // 🔥 keep latest mode
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const loadScripts = async () => {
      if (!window.L) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet/dist/leaflet.js";
        document.body.appendChild(script);
        await new Promise(res => (script.onload = res));
      }

      if (!window.L.heatLayer) {
        const heatScript = document.createElement("script");
        heatScript.src = "https://unpkg.com/leaflet.heat/dist/leaflet-heat.js";
        document.body.appendChild(heatScript);
        await new Promise(res => (heatScript.onload = res));
      }

      initMap();
    };

    loadScripts();

    function initMap() {
      if (mapRef.current) return;

      mapRef.current = window.L.map("map-container").setView([28.61, 77.20], 10);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap"
      }).addTo(mapRef.current);

      layerRef.current = window.L.layerGroup().addTo(mapRef.current);

      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);

      addUserLocation();
    }

    // 🔥 DATA LOADER (USES modeRef)
    loadMapDataRef.current = async () => {
      try {
        const [clustersRes, casesRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/clusters"),
          fetch("http://127.0.0.1:8000/get-data")
        ]);

        const clusters = await clustersRes.json();
        const cases = await casesRes.json();

        setStats({
          cases: cases.length,
          clusters: clusters.length
        });

        if (!layerRef.current) return;

        layerRef.current.clearLayers();

        // remove old heatmap
        if (heatRef.current) {
          mapRef.current.removeLayer(heatRef.current);
          heatRef.current = null;
        }

        // 🔥 HEATMAP
        if (modeRef.current === "heat" || modeRef.current === "both") {
          const heatPoints = cases.map(c => [c.lat, c.lon, 1.5]);

          heatRef.current = window.L.heatLayer(heatPoints, {
            radius: 50,
            blur: 30,
            maxZoom: 17,
            gradient: {
              0.2: "blue",
              0.4: "lime",
              0.6: "yellow",
              0.8: "orange",
              1.0: "red"
            }
          }).addTo(mapRef.current);
        }

        // 🔴 OUTBREAK (clusters + cases)
        if (modeRef.current === "outbreak" || modeRef.current === "both") {
          // cases
          cases.forEach(c => {
            window.L.circleMarker([c.lat, c.lon], {
              radius: 5,
              color: "blue",
              fillColor: "blue",
              fillOpacity: 0.7
            })
              .addTo(layerRef.current)
              .bindPopup(`🧍 Case<br>Disease: ${c.disease}`);
          });

          // clusters
          clusters.forEach(c => {
            window.L.circle([c.lat, c.lon], {
              color: c.color || "orange",
              fillColor: c.color || "orange",
              fillOpacity: 0.2,
              radius: 5000 + c.size * 500
            })
              .addTo(layerRef.current)
              .bindPopup(`
                <b>${c.disease || "Cluster"}</b><br>
                Cases: ${c.size}<br>
                Risk: ${c.risk}<br>
                ${c.alert || ""}
              `);
          });
        }

      } catch (err) {
        console.error("Map error:", err);
      }
    };

    // 🔥 AUTO REFRESH
    const interval = setInterval(() => {
      if (loadMapDataRef.current) {
        loadMapDataRef.current();
      }
    }, 4000);

    return () => clearInterval(interval);

  }, []);

  // 🔥 RELOAD WHEN MODE CHANGES
  useEffect(() => {
    if (loadMapDataRef.current) {
      loadMapDataRef.current();
    }
  }, [mode]);

  function addUserLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      window.L.circleMarker([lat, lon], {
        radius: 7,
        color: "cyan",
        fillColor: "cyan",
        fillOpacity: 1
      })
        .addTo(layerRef.current)
        .bindPopup("📍 You are here");

      mapRef.current.setView([lat, lon], 12);
    });
  }

  return (
    <div>
      {/* 🔥 TOGGLE */}
      <div style={modeToggle}>
        <button 
          onClick={() => setMode("outbreak")} 
          style={mode === "outbreak" ? modeActiveBtn : modeBtn}
        >
          🦠 Outbreak
        </button>
        <button 
          onClick={() => setMode("heat")} 
          style={mode === "heat" ? modeActiveBtn : modeBtn}
        >
          🔥 Heatmap
        </button>
        <button 
          onClick={() => setMode("both")} 
          style={mode === "both" ? modeActiveBtn : modeBtn}
        >
          🗺️ Combined
        </button>
      </div>

      {/* 🔥 STATS */}
      <div style={statsBar}>
        <div style={statItem}>
          <span style={statValue}>{stats.cases}</span>
          <span style={statLabel}>Cases</span>
        </div>
        <div style={statDivider}></div>
        <div style={statItem}>
          <span style={statValue}>{stats.clusters}</span>
          <span style={statLabel}>Clusters</span>
        </div>
      </div>

      {/* 🔥 MAP */}
      <div
        id="map-container"
        style={mapContainer}
      />

      {/* 🔥 LEGEND */}
      <div style={legend}>
        <span style={legendItem}><span style={{...legendDot, background: "#ef4444"}}></span> High Risk</span>
        <span style={legendItem}><span style={{...legendDot, background: "#f59e0b"}}></span> Medium</span>
        <span style={legendItem}><span style={{...legendDot, background: "#22c55e"}}></span> Safe</span>
        <span style={legendItem}>🔥 Heatmap = intensity</span>
      </div>
    </div>
  );
}

const modeToggle = {
  display: "flex",
  gap: "8px",
  marginBottom: "16px"
};

const modeBtn = {
  flex: 1,
  padding: "10px 14px",
  background: "rgba(24, 24, 27, 0.8)",
  color: "#71717a",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "0.85rem",
  transition: "all 0.2s ease"
};

const modeActiveBtn = {
  ...modeBtn,
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white",
  border: "none",
  boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)"
};

const statsBar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px",
  padding: "14px 20px",
  background: "rgba(24, 24, 27, 0.8)",
  borderRadius: "12px",
  marginBottom: "16px"
};

const statItem = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const statValue = {
  color: "#818cf8",
  fontSize: "1.5rem",
  fontWeight: "700"
};

const statLabel = {
  color: "#71717a",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const statDivider = {
  width: "1px",
  height: "30px",
  background: "rgba(255, 255, 255, 0.1)"
};

const mapContainer = {
  height: "400px",
  width: "100%",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.06)"
};

const legend = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  marginTop: "14px",
  fontSize: "0.8rem",
  color: "#71717a"
};

const legendItem = {
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const legendDot = {
  display: "inline-block",
  width: "10px",
  height: "10px",
  borderRadius: "50%"
};

export default Map;
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
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setMode("outbreak")}>Outbreak</button>
        <button onClick={() => setMode("heat")}>Heatmap</button>
        <button onClick={() => setMode("both")}>Combined</button>
      </div>

      {/* 🔥 STATS */}
      <div style={{ marginBottom: "10px" }}>
        <b>Cases:</b> {stats.cases} | <b>Clusters:</b> {stats.clusters}
      </div>

      {/* 🔥 MAP */}
      <div
        id="map-container"
        style={{
          height: "400px",
          width: "100%",
          borderRadius: "12px"
        }}
      />

      {/* 🔥 LEGEND */}
      <div style={{ marginTop: "10px", fontSize: "14px" }}>
        🔴 High Risk | 🟡 Medium | 🟢 Safe | 🔥 Heatmap = intensity
      </div>
    </div>
  );
}

export default Map;
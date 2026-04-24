import { useEffect, useRef } from "react";

function MapPage() {
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet/dist/leaflet.js";
    document.body.appendChild(script);

    script.onload = () => {
      mapRef.current = window.L.map("map").setView([28.61, 77.20], 10);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18
      }).addTo(mapRef.current);

      layerRef.current = window.L.layerGroup().addTo(mapRef.current);

      loadMapData();
    };

    async function loadMapData() {
      try {
        // 🔥 Fetch BOTH APIs
        const [clustersRes, casesRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/clusters"),
          fetch("http://127.0.0.1:8000/get-data")
        ]);

        const clusters = await clustersRes.json();
        const cases = await casesRes.json();

        console.log("Clusters:", clusters);
        console.log("Cases:", cases);

        // 🔥 Clear old layers
        layerRef.current.clearLayers();

        // =========================
        // 🔵 INDIVIDUAL CASES (BLUE)
        // =========================
        cases.forEach(c => {
          window.L.circleMarker([c.lat, c.lon], {
            radius: 5,
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.7
          })
            .addTo(layerRef.current)
            .bindPopup(`
              🧍 Case<br>
              Disease: ${c.disease}
            `);
        });

        // =========================
        // 🟡🔴 CLUSTERS (RISK)
        // =========================
        clusters.forEach(c => {
          window.L.circle([c.lat, c.lon], {
            color: c.color,
            fillColor: c.color,
            fillOpacity: 0.4,
            radius: 5000 + c.size * 500   // bigger = more cases
          })
            .addTo(layerRef.current)
            .bindPopup(`
              <b>${c.disease}</b><br>
              Cases: ${c.size}<br>
              Risk: ${c.risk}<br>
              ${c.alert}
            `);
        });

      } catch (err) {
        console.error("❌ Error loading map:", err);
      }
    }

    // 🔥 AUTO REFRESH (REAL-TIME FEEL)
    const interval = setInterval(() => {
      if (mapRef.current) {
        loadMapData();
      }
    }, 3000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div
      id="map"
      style={{
        height: "450px",
        borderRadius: "12px",
        marginTop: "20px"
      }}
    ></div>
  );
}

export default MapPage;
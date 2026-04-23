import { useEffect } from "react";

function MapPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet/dist/leaflet.js";
    document.body.appendChild(script);

    script.onload = () => {
      const map = window.L.map("map").setView([28.61, 77.20], 5);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18
      }).addTo(map);

      // 🔥 LOAD CLUSTERS WITH DEBUG
      async function loadClusters() {
        try {
          console.log("📡 Fetching clusters...");

          const res = await fetch("http://localhost:8000/clusters");

          console.log("✅ Response:", res);

          if (!res.ok) {
            throw new Error("Server not responding");
          }

          const data = await res.json();

          console.log("📊 Cluster Data:", data);

          data.forEach(c => {
            window.L.circle([c.lat, c.lon], {
              color: c.color,
              fillColor: c.color,
              fillOpacity: 0.5,
              radius: 5000
            })
              .addTo(map)
              .bindPopup(`
                <b>${c.disease}</b><br>
                Cases: ${c.size}<br>
                Risk: ${c.risk}<br>
                ${c.alert}
              `);
          });

        } catch (err) {
          console.error("❌ Fetch error:", err);
          alert("Error connecting to backend!");
        }
      }

      loadClusters();
    };
  }, []);

  return (
    <div
      id="map"
      style={{
        height: "400px",
        borderRadius: "10px",
        marginTop: "10px"
      }}
    ></div>
  );
}

export default MapPage;
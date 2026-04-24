import { useEffect, useRef } from "react";

function Map() {
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet/dist/leaflet.js";
      document.body.appendChild(script);

      script.onload = initMap;
    } else {
      initMap();
    }

    function initMap() {
      if (mapRef.current !== null) return;

      mapRef.current = window.L.map("map-container").setView([28.61, 77.20], 10);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap"
      }).addTo(mapRef.current);

      layerRef.current = window.L.layerGroup().addTo(mapRef.current);

      // 🔥 Fix rendering glitch
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);

      loadMapData();
      addUserLocation();
    }

    async function loadMapData() {
      try {
        const [clustersRes, casesRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/clusters"),
          fetch("http://127.0.0.1:8000/get-data")
        ]);

        const clusters = await clustersRes.json();
        const cases = await casesRes.json();

        if (!layerRef.current) return;

        layerRef.current.clearLayers();

        // 🔵 Cases
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

        // 🔴🟡 Clusters
        clusters.forEach(c => {
          window.L.circle([c.lat, c.lon], {
            color: c.color || "orange",
            fillColor: c.color || "orange",
            fillOpacity: 0.4,
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

      } catch (err) {
        console.error("Map error:", err);
      }
    }

    function addUserLocation() {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        if (!layerRef.current) return;

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

    const interval = setInterval(() => {
      if (mapRef.current) {
        loadMapData();
      }
    }, 4000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div
      id="map-container"   // 🔥 FIXED ID
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "12px",
        marginTop: "10px"
      }}
    />
  );
}

export default Map;
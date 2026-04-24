// import { useEffect, useRef } from "react";

// function MapPage() {
//   const mapRef = useRef(null);
//   const layerRef = useRef(null);
//   const heatRef = useRef(null); // 🔥 heat layer

//   useEffect(() => {
//     // 🔥 Load Leaflet
//     const script = document.createElement("script");
//     script.src = "https://unpkg.com/leaflet/dist/leaflet.js";
//     document.body.appendChild(script);

//     // 🔥 Load Heatmap Plugin
//     const heatScript = document.createElement("script");
//     heatScript.src = "https://unpkg.com/leaflet.heat/dist/leaflet-heat.js";
//     document.body.appendChild(heatScript);

//     Promise.all([
//       new Promise(res => (script.onload = res)),
//       new Promise(res => (heatScript.onload = res))
//     ]).then(() => {
//       mapRef.current = window.L.map("map").setView([28.61, 77.20], 10);

//       window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         maxZoom: 18
//       }).addTo(mapRef.current);

//       layerRef.current = window.L.layerGroup().addTo(mapRef.current);

//       loadMapData();
//     });

//     async function loadMapData() {
//       try {
//         const [clustersRes, casesRes] = await Promise.all([
//           fetch("http://127.0.0.1:8000/clusters"),
//           fetch("http://127.0.0.1:8000/get-data")
//         ]);

//         const clusters = await clustersRes.json();
//         const cases = await casesRes.json();

//         console.log("Cases:", cases);

//         // 🔥 Clear markers
//         layerRef.current.clearLayers();

//         // =========================
//         // 🔥 HEATMAP (NEW)
//         // =========================
//         const heatPoints = cases.map(c => [
//           c.lat,
//           c.lon,
//           3.5// intensity
//         ]);

//         // remove old heatmap
//         if (heatRef.current) {
//           mapRef.current.removeLayer(heatRef.current);
//         }

//         heatRef.current = window.L.heatLayer(heatPoints, {
//           radius: 40,
//           blur: 25,
//           maxZoom: 17,
//   gradient: {
//     0.2: "blue",
//     0.4: "lime",
//     0.6: "yellow",
//     0.8: "orange",
//     1.0: "red"
//   }
//         }).addTo(mapRef.current);

//         // =========================
//         // 🔵 CASE MARKERS
//         // =========================
//         cases.forEach(c => {
//           window.L.circleMarker([c.lat, c.lon], {
//             radius: 5,
//             color: "blue",
//             fillColor: "blue",
//             fillOpacity: 0.7
//           })
//             .addTo(layerRef.current)
//             .bindPopup(`
//               🧍 Case<br>
//               Disease: ${c.disease}
//             `);
//         });

//         // =========================
//         // 🔴 CLUSTERS
//         // =========================
//         clusters.forEach(c => {
//           window.L.circle([c.lat, c.lon], {
//             color: c.color,
//             fillColor: c.color,
//             fillOpacity: 0.4,
//             radius: 5000 + c.size * 500
//           })
//             .addTo(layerRef.current)
//             .bindPopup(`
//               <b>${c.disease}</b><br>
//               Cases: ${c.size}<br>
//               Risk: ${c.risk}<br>
//               ${c.alert}
//             `);
//         });

//       } catch (err) {
//         console.error("❌ Error loading map:", err);
//       }
//     }

//     // 🔥 AUTO REFRESH
//     const interval = setInterval(() => {
//       if (mapRef.current) {
//         loadMapData();
//       }
//     }, 4000);

//     return () => clearInterval(interval);

//   }, []);

//   return (
//     <div
//       id="map"
//       style={{
//         height: "450px",
//         borderRadius: "12px",
//         marginTop: "20px"
//       }}
//     ></div>
//   );
// }

// export default MapPage;
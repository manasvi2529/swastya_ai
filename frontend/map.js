import { MapContainer, TileLayer, Circle } from "react-leaflet";

function Map({ data }) {
  return (
    <MapContainer center={[28.61, 77.23]} zoom={10}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {data.map((caseItem, i) => (
        <Circle
          key={i}
          center={[caseItem.lat, caseItem.lon]}
          radius={200}
        />
      ))}
    </MapContainer>
  );
}

export default Map;
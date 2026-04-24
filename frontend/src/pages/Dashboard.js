import Prediction from "../components/Prediction";
import Map from "../components/Map";
import Stats from "../components/Stats";
import Alert from "../components/Alert";
import Voting from "../components/Voting";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Alert */}
      <div style={card}>
  <Alert />
</div>

      {/* Prediction */}
      <div style={card}>
        <Prediction />
      </div>

      {/* Voting */}
      <div style={card}>
  <Voting />
</div>

      {/* Stats */}
      <div style={card}>
  <Stats />
</div>

      {/* Map */}
      <div style={card}>
  <h3>🗺️ Live Outbreak Map</h3>
  <Map />
</div>
    </div>
  );
}

const card = {
  background: "#1e293b",
  padding: "20px",
  marginTop: "15px",
  borderRadius: "10px"
};

export default Dashboard;
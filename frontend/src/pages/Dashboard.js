import Prediction from "../components/Prediction";
import Map from "../components/Map";
import Stats from "../components/Stats";
import Alert from "../components/Alert";
import Voting from "../components/Voting";
import TrendGraph from "../components/TrendGraph";

function Dashboard() {
    return (
        <div className="fade-in">
            <h1 style={pageTitle}>🩺 Swasthya AI Dashboard</h1>

            {/* Alert */}
            <div style={card}>
                <Alert />
            </div>

            {/* Stats - Full width */}
            <div style={card}>
                <Stats />
            </div>

            {/* Prediction & Voting - Side by side */}
            <div style={grid2}>
                <div style={card}>
                    <h3 style={cardTitle}>🔬 Disease Prediction</h3>
                    <Prediction />
                </div>
                <div style={card}>
                    <h3 style={cardTitle}>🗳️ Community Vote</h3>
                    <Voting />
                </div>
            </div>

            {/* Map */}
            <div style={card}>
                <h3 style={cardTitle}>🗺️ Live Outbreak Map</h3>
                <Map />
            </div>

            {/* Trend Graph */}
            <div style={card}>
                <h3 style={cardTitle}>📈 Disease Trends</h3>
                <TrendGraph />
            </div>
        </div>
    );
}

const pageTitle = {
  fontSize: "1.75rem",
  fontWeight: "700",
  marginBottom: "24px",
  background: "linear-gradient(135deg, #fafafa, #a1a1aa)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

const cardTitle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  marginBottom: "16px",
  color: "#fafafa",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "20px"
};

const card = {
  background: "linear-gradient(145deg, rgba(24, 24, 27, 0.9), rgba(24, 24, 27, 0.5))",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  padding: "24px",
  borderRadius: "18px",
  marginBottom: "20px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
};
<div
  style={card}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-5px)";
    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
  }}
></div>
const btn = {
  padding: "10px 16px",
  borderRadius: "8px",
  background: "#1e293b",
  color: "white",
  transition: "0.2s"
};
<hr style={{
  borderColor: "#1e293b",
  margin: "20px 0"
}} />
export default Dashboard;
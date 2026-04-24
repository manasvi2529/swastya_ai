import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h2>🩺 Swasthya AI</h2>

      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>Dashboard</Link>
        <Link to="/map" style={styles.link}>Map</Link>
        <Link to="/hospitals" style={styles.link}>Hospitals</Link>
      </nav>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#0f172a",
    color: "white",
    padding: "20px",
    position: "fixed"
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px"
  },
  link: {
    color: "white",
    textDecoration: "none",
    padding: "10px",
    background: "#1e293b",
    borderRadius: "6px"
  }
};

export default Sidebar;
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Layout({ children }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={styles.app}>

      {/* 🔥 SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logoBox}>
          <span style={styles.logoIcon}>🧠</span>
          <span style={styles.logoText}>Swasthya AI</span>
        </div>

        {navItem("/", "📊 Dashboard", location, hovered, setHovered)}
        {navItem("/hospitals", "🏥 Hospitals", location, hovered, setHovered)}
      </div>

      {/* 🔥 MAIN */}
      <div style={styles.main}>
        <div style={styles.container}>
          {children}
        </div>
      </div>
    </div>
  );
}

function navItem(path, label, location, hovered, setHovered) {
  const isActive = location.pathname === path;
  const isHover = hovered === path;

  return (
    <Link
      to={path}
      onMouseEnter={() => setHovered(path)}
      onMouseLeave={() => setHovered(null)}
      style={{
        ...styles.link,
        ...(isActive ? styles.activeLink : {}),
        ...(isHover ? styles.hoverLink : {})
      }}
    >
      {label}
    </Link>
  );
}

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    background: "linear-gradient(145deg, #0a0a0f 0%, #18181b 50%, #0a0a0f 100%)",
    color: "#e4e4e7",
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },

  sidebar: {
    width: "260px",
    padding: "24px 16px",
    background: "linear-gradient(180deg, rgba(10,10,15,0.95), rgba(0,0,0,0.8))",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px)"
  },

  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "40px",
    padding: "12px"
  },

  logoIcon: { fontSize: "28px" },

  logoText: {
    fontSize: "20px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #818cf8, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.02em"
  },

  link: {
    display: "block",
    padding: "14px 16px",
    marginBottom: "8px",
    borderRadius: "12px",
    background: "rgba(24, 24, 27, 0.6)",
    color: "#a1a1aa",
    textDecoration: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "0.9rem",
    fontWeight: "500"
  },

  hoverLink: {
    transform: "translateX(6px)",
    background: "rgba(99, 102, 241, 0.15)",
    color: "#e4e4e7"
  },

  activeLink: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)",
    fontWeight: "600"
  },

  main: {
    flex: 1,
    overflowY: "auto",
    background: "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.08) 0%, transparent 50%)"
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px"
  }
};

export default Layout;
import { useState } from "react";
import { api } from "./services/api";
function Voting() {
  const [vote, setVote] = useState(null);
  const [severity, setSeverity] = useState("mild");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitVote = async () => {
    if (!vote) {
      alert("Please select Yes or No");
      return;
    }

    setLoading(true);

    const res = await api.vote({
      vote,
      severity
    });

    setResult(res);
    setLoading(false);
  };

  return (
    <div style={card}>
      <h3 style={title}>🤝 Community Validation</h3>

      <p style={desc}>
        People near you reported similar symptoms.
        <br />
        Do you also have this?
      </p>

      {/* YES / NO */}
      <div style={btnRow}>
        <button
          onClick={() => setVote("yes")}
          style={vote === "yes" ? activeBtn : btn}
        >
          👍 Yes
        </button>

        <button
          onClick={() => setVote("no")}
          style={vote === "no" ? activeBtn : btn}
        >
          👎 No
        </button>
      </div>

      {/* SEVERITY */}
      <div style={severitySection}>
        <p style={severityLabel}>Severity:</p>

        <div style={severityRow}>
          {["mild", "moderate", "severe"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              style={severity === s ? severityActiveBtn : severityBtn}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* SUBMIT */}
      <button
        onClick={submitVote}
        disabled={loading}
        style={submitBtn}
      >
        {loading ? "⏳ Submitting..." : "🗳️ Submit Vote"}
      </button>

      {/* RESULT */}
      {result && (
        <div style={resultSection}>
          <h4 style={resultTitle}>📊 Community Response</h4>

          <div style={voteStats}>
            <div style={voteItem}>
              <span style={voteEmoji}>👍</span>
              <span style={voteLabel}>Yes</span>
              <span style={voteCount}>{result.votes.yes}</span>
            </div>
            <div style={voteItem}>
              <span style={voteEmoji}>👎</span>
              <span style={voteLabel}>No</span>
              <span style={voteCount}>{result.votes.no}</span>
            </div>
          </div>

          <p style={severityTitle}><b>Severity Breakdown:</b></p>
          <div style={severityStats}>
            <div style={sevItem}>
              <span style={{...sevDot, background: "#22c55e"}}></span>
              <span>Mild</span>
              <span style={sevCount}>{result.votes.severity.mild}</span>
            </div>
            <div style={sevItem}>
              <span style={{...sevDot, background: "#f59e0b"}}></span>
              <span>Moderate</span>
              <span style={sevCount}>{result.votes.severity.moderate}</span>
            </div>
            <div style={sevItem}>
              <span style={{...sevDot, background: "#ef4444"}}></span>
              <span>Severe</span>
              <span style={sevCount}>{result.votes.severity.severe}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const title = {
  fontSize: "1.1rem",
  fontWeight: "600",
  marginBottom: "12px",
  color: "#fafafa"
};

const desc = {
  color: "#a1a1aa",
  fontSize: "0.9rem",
  lineHeight: "1.5",
  marginBottom: "16px"
};

const btnRow = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px"
};

const btn = {
  flex: 1,
  padding: "14px",
  background: "rgba(24, 24, 27, 0.8)",
  color: "#a1a1aa",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "0.9rem",
  transition: "all 0.2s ease"
};

const activeBtn = {
  ...btn,
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white",
  border: "none",
  boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)"
};

const severitySection = {
  marginBottom: "16px"
};

const severityLabel = {
  color: "#71717a",
  fontSize: "0.85rem",
  marginBottom: "10px"
};

const severityRow = {
  display: "flex",
  gap: "8px"
};

const severityBtn = {
  flex: 1,
  padding: "10px",
  background: "rgba(24, 24, 27, 0.6)",
  color: "#71717a",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.8rem",
  textTransform: "capitalize",
  transition: "all 0.2s ease"
};

const severityActiveBtn = {
  ...severityBtn,
  background: "rgba(99, 102, 241, 0.2)",
  color: "#818cf8",
  border: "1px solid rgba(99, 102, 241, 0.3)"
};

const submitBtn = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.9rem",
  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)"
};

const resultSection = {
  marginTop: "20px",
  paddingTop: "20px",
  borderTop: "1px solid rgba(255, 255, 255, 0.06)"
};

const resultTitle = {
  fontSize: "1rem",
  fontWeight: "600",
  marginBottom: "16px",
  color: "#fafafa"
};

const voteStats = {
  display: "flex",
  gap: "12px",
  marginBottom: "20px"
};

const voteItem = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "16px",
  background: "rgba(24, 24, 27, 0.8)",
  borderRadius: "12px"
};

const voteEmoji = {
  fontSize: "1.5rem",
  marginBottom: "4px"
};

const voteLabel = {
  color: "#71717a",
  fontSize: "0.8rem"
};

const voteCount = {
  color: "#818cf8",
  fontSize: "1.5rem",
  fontWeight: "700"
};

const severityTitle = {
  color: "#a1a1aa",
  fontSize: "0.85rem",
  marginBottom: "12px"
};

const severityStats = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const sevItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 14px",
  background: "rgba(24, 24, 27, 0.6)",
  borderRadius: "8px",
  color: "#a1a1aa",
  fontSize: "0.85rem"
};

const sevDot = {
  width: "10px",
  height: "10px",
  borderRadius: "50%"
};

const sevCount = {
  marginLeft: "auto",
  color: "#e4e4e7",
  fontWeight: "600"
};

const card = {
  background: "linear-gradient(145deg, rgba(24, 24, 27, 0.9), rgba(24, 24, 27, 0.5))",
  padding: "20px",
  borderRadius: "16px",
  backdropFilter: "blur(12px)"
};

export default Voting;
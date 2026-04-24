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
      <h3>🤝 Community Validation</h3>

      <p>
        People near you reported similar symptoms.
        <br />
        Do you also have this?
      </p>

      {/* YES / NO */}
      <div style={{ marginTop: "10px" }}>
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
      <div style={{ marginTop: "15px" }}>
        <p>Severity:</p>

        {["mild", "moderate", "severe"].map((s) => (
          <button
            key={s}
            onClick={() => setSeverity(s)}
            style={severity === s ? activeBtn : btn}
          >
            {s}
          </button>
        ))}
      </div>

      {/* SUBMIT */}
      <button
        onClick={submitVote}
        disabled={loading}
        style={{ marginTop: "15px" }}
      >
        {loading ? "Submitting..." : "Submit Vote"}
      </button>

      {/* RESULT */}
      {result && (
        <div style={{ marginTop: "15px" }}>
          <h4>📊 Community Response</h4>

          <p>👍 Yes: {result.votes.yes}</p>
          <p>👎 No: {result.votes.no}</p>

          <p><b>Severity:</b></p>
          <p>Mild: {result.votes.severity.mild}</p>
          <p>Moderate: {result.votes.severity.moderate}</p>
          <p>Severe: {result.votes.severity.severe}</p>
        </div>
      )}
    </div>
  );
}

const btn = {
  margin: "5px",
  padding: "8px",
  background: "#1e293b",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const activeBtn = {
  ...btn,
  background: "#2563eb"
};

const card = {
  background: "#111827",
  padding: "15px",
  borderRadius: "10px",
  marginTop: "10px"
};

export default Voting;
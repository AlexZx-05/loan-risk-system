import { useState } from "react";
import { BASE_URL } from "../api";

export default function History() {
  const [id, setId] = useState("");
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = () => {
    if (!id) {
      alert("Enter Borrower ID");
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      alert("Session expired. Please login again.");
      window.location.href = "/login";
      return;
    }

    // Role protected endpoint
    if (role !== "OFFICER") {
      alert("Only Bank Officers can view borrower history ❌");
      return;
    }

    setLoading(true);

    fetch(`${BASE_URL}/risk_history/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          alert("Unauthorized Access - Login Again ❌");
          window.location.href = "/login";
          return;
        }

        return res.json();
      })
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => {
        alert("Backend error. Please check server 🔴");
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📜 Borrower Risk History</h1>

      <input
        type="number"
        placeholder="Enter Borrower ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
        style={{ padding: "8px", marginRight: "10px" }}
      />

      <button onClick={fetchHistory} style={{ padding: "8px 12px" }}>
        Fetch History
      </button>

      {loading && <h3>Loading...</h3>}

      {history?.message === "No history found for this borrower" && (
        <h3 style={{ color: "red" }}>❌ No records found</h3>
      )}

      {history && history.history && (
        <div style={{ marginTop: "20px" }}>
          <h2>Borrower ID: {history.borrower_id}</h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px"
            }}
          >
            <thead>
              <tr style={{ background: "#111e36", color: "white" }}>
                <th style={th}>Risk</th>
                <th style={th}>Score</th>
                <th style={th}>Action</th>
                <th style={th}>Time</th>
              </tr>
            </thead>

            <tbody>
              {history.history.map((h, i) => (
                <tr key={i} style={{ textAlign: "center" }}>
                  <td style={{ ...td, fontWeight: "bold" }}>{h.risk_level}</td>
                  <td style={td}>{(h.risk_score * 100).toFixed(2)}%</td>
                  <td style={td}>{h.action}</td>
                  <td style={td}>{h.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = {
  padding: "10px",
  border: "1px solid #ddd"
};

const td = {
  padding: "8px",
  border: "1px solid #ddd"
};

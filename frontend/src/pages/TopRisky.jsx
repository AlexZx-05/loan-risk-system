import { useEffect, useState } from "react";
import { BASE_URL } from "../api";

export default function TopRisky() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {

  const token = localStorage.getItem("token");

  fetch(`${BASE_URL}/top_risky`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => {
      if(res.status === 401){
        alert("Session expired. Please login again.");
        window.location.reload();
      }
      return res.json();
    })
    .then(data => {
      setData(data);
      setLoading(false);
    })
    .catch(() => {
      alert("Backend not running or API issue");
    });

}, []);


  if (loading) return <h2 style={{ textAlign: "center" }}>Loading Top Risky Borrowers...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>🔥 Top High Risk Borrowers</h1>
      <p>These borrowers have the highest probability of default.</p>

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px"
      }}>
        <thead>
          <tr style={{ background: "#111e36", color: "white" }}>
            <th style={th}>Borrower ID</th>
            <th style={th}>Risk</th>
            <th style={th}>Probability</th>
            <th style={th}>Missed EMI</th>
            <th style={th}>Max Delay</th>
            <th style={th}>EMI/Income</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i} style={{ textAlign: "center", background: i % 2 ? "#f7f7f7" : "white" }}>
              <td style={td}>{item.borrower_id}</td>
              <td style={{ ...td, color: "red", fontWeight: "bold" }}>{item.risk}</td>
              <td style={td}>{(item.prob * 100).toFixed(2)}%</td>
              <td style={td}>{item.missed_emi_count}</td>
              <td style={td}>{item.max_delay_days} days</td>
              <td style={td}>{item.emi_income_ratio.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  padding: "12px",
  border: "1px solid #ddd"
};

const td = {
  padding: "10px",
  border: "1px solid #ddd"
};

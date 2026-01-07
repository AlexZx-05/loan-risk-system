import { useEffect, useState } from "react";
import { BASE_URL } from "../api";

export default function NeedOfficer() {
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/need_officer`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(async res => {
        if (res.status === 401) {
          alert("Unauthorized - Login again");
          window.location.reload();
          return;
        }

        return res.json();
      })
      .then(data => {
        setCases(data.cases);     // ✅ Correct
        setTotal(data.total_cases);
        setLoading(false);
      })
      .catch(() => {
        alert("Backend not running or API issue");
      });

  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading Cases...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>👮‍♂️ Borrowers Needing Officer Review</h1>
      <p>
        These are HIGH risk borrowers that must be checked manually by a bank officer.
      </p>

      <h3>Total Cases: {total}</h3>

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px"
      }}>
        <thead>
          <tr style={{ background: "#111e36", color: "white" }}>
            <th style={th}>Borrower ID</th>
            <th style={th}>Missed EMI</th>
            <th style={th}>Max Delay</th>
            <th style={th}>EMI / Income Ratio</th>
          </tr>
        </thead>

        <tbody>
          {cases.map((c, i) => (
            <tr
              key={i}
              style={{
                textAlign: "center",
                background: i % 2 ? "#f7f7f7" : "white"
              }}
            >
              <td style={{ ...td, fontWeight: "bold", color: "red" }}>{c.borrower_id}</td>
              <td style={td}>{c.missed_emi_count}</td>
              <td style={td}>{c.max_delay_days} days</td>
              <td style={td}>{c.emi_income_ratio.toFixed(2)}</td>
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

import { useEffect, useState } from "react";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/analytics", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then(async res => {
      if(res.status === 401){
        alert("Unauthorized - Please login again");
        window.location.reload();
        return;
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

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading Analytics...</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Analytics Dashboard</h1>

      <h3>Total Customers: {data.total_customers}</h3>

      <div style={{ display: "flex", gap: 20 }}>
        {Object.entries(data.summary_counts).map(([risk, count]) => (
          <div key={risk} style={{ padding: 20, borderRadius: 10, border: "1px solid gray" }}>
            <h2>{risk}</h2>
            <h1>{count}</h1>
            <p>{data.percentage[risk]}%</p>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 20 }}>
        Average Model Confidence: {data.average_confidence}
      </h3>
    </div>
  );
}

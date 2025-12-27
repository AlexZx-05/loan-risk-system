import { useEffect, useState } from "react";
import Loader from "../components/Loader";

export default function Analytics() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/analytics", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async res => {
        if (res.status === 401) {
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

  if (loading) return <Loader />;

  return (
    <div style={container}>

      <h1 style={heading}>📊 Loan Risk Analytics Dashboard</h1>

      {/* --- TOP INFO ROW (Side by Side) --- */}
      <div
        style={{
          display: "flex",
          gap: "25px",
          alignItems: "stretch",
          marginTop: "10px",
          flexWrap: "wrap"
        }}
      >

        {/* Total Customers */}
        <div style={topInfoBox}>
          <h3>Total Customers</h3>
          <h1 style={{ fontSize: "45px", margin: 0 }}>
            {data.total_customers}
          </h1>
        </div>

        {/* Model Confidence */}
        <div style={confidenceBox}>
          <p style={{ fontSize: 18, margin: 0 }}>
            🤖 Model Average Confidence
          </p>
          <h1 style={{ margin: 0 }}>
            {data.average_confidence}
          </h1>
        </div>

      </div>

      {/* ---- Risk Cards Section ---- */}
      <h2 style={{ marginTop: 30 }}>Risk Distribution</h2>

      <div style={cardContainer}>
        {Object.entries(data.summary_counts).map(([risk, count]) => (
          <RiskCard
            key={risk}
            risk={risk}
            count={count}
            percent={data.percentage[risk]}
          />
        ))}
      </div>

    </div>
  );
}


/* ---------------------- Animated Risk Card ---------------------- */
function RiskCard({ risk, count, percent }) {

  const [displayCount, setDisplayCount] = useState(count);

  function animateNumber() {
    let end = count;
    let duration = 600;
    let stepTime = 20;
    let increment = end / (duration / stepTime);
    let current = 0;

    let timer = setInterval(() => {
      current += increment;

      if (current >= end) {
        clearInterval(timer);
        setDisplayCount(end);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, stepTime);
  }

  return (
    <div
      style={{ ...card, ...riskColor(risk) }}
      onMouseEnter={animateNumber}
    >
      <h2 style={{ marginBottom: 5 }}>{risk}</h2>

      <h1 style={{
        margin: 0,
        fontSize: "45px",
        transition: "transform .2s ease",
      }}>
        {displayCount}
      </h1>

      <p style={{ opacity: 0.9 }}>{percent}% of borrowers</p>
    </div>
  );
}


/* ---------------------- UI STYLING ---------------------- */

const container = {
  padding: "30px",
  fontFamily: "Segoe UI, sans-serif"
};

const heading = {
  marginBottom: 10
};

const topInfoBox = {
  background: "#111e36",
  color: "white",
  padding: "18px",
  width: "fit-content",
  borderRadius: "10px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
};

const cardContainer = {
  display: "flex",
  gap: "25px",
  marginTop: "20px",
  flexWrap: "wrap"
};

const card = {
  width: "230px",
  padding: "22px",
  borderRadius: "14px",
  color: "white",
  textAlign: "center",
  boxShadow: "0 15px 35px rgba(0,0,0,.25)",
  transition: "all .3s ease",
  cursor: "pointer",
};

function riskColor(risk) {
  if (risk === "HIGH")
    return {
      background: "#e63946",
      boxShadow: "0 10px 30px rgba(230,57,70,.5)"
    };

  if (risk === "MEDIUM")
    return {
      background: "#f4a261",
      boxShadow: "0 10px 30px rgba(244,162,97,.5)"
    };

  return {
    background: "#2a9d8f",
    boxShadow: "0 10px 30px rgba(42,157,143,.5)"
  };
}

const confidenceBox = {
  marginTop: "0",
  padding: "20px",
  background: "#f6f8ff",
  borderRadius: "10px",
  border: "1px solid #d0d7ff",
  width: "fit-content",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
};

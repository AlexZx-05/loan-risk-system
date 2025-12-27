export default function Home() {
  return (
    <div style={container}>
      
      {/* ---------- HERO SECTION ---------- */}
      <div style={hero}>
        <div>
          <h1 style={title}>🏦 Loan Risk AI System</h1>
          <p style={subtitle}>
            Intelligent credit risk prediction platform for banks & financial institutions.
          </p>

          <p style={tagline}>
            Powered by Machine Learning • Real-time Insights • Officer Decision Support
          </p>
        </div>

        <img 
          src="https://cdn-icons-png.flaticon.com/512/7435/7435568.png"
          alt="risk"
          style={illustration}
        />
      </div>


      {/* ---------- QUICK ACTIONS ---------- */}
      <div style={quickBox}>
        <h2>🚀 Quick Actions</h2>

        <div style={actions}>
          <div style={card}>
            <h3>📊 View Analytics</h3>
            <p>See overall risk distribution and model confidence.</p>
          </div>

          <div style={card}>
            <h3>🔥 Top Risky Borrowers</h3>
            <p>Identify customers with highest probability of default.</p>
          </div>

          <div style={card}>
            <h3>👮 Need Officer Review</h3>
            <p>Borrowers requiring manual intervention.</p>
          </div>

          <div style={card}>
            <h3>📜 Risk History</h3>
            <p>Track borrower risk across time.</p>
          </div>
        </div>
      </div>


      {/* ---------- FOOTER INFO ---------- */}
      <div style={footer}>
        <p>
          Built using <b>FastAPI + React + ML + SQLite</b>  
        </p>
        <p style={{ opacity: 0.7 }}>
          Designed for industry-grade loan risk management
        </p>
      </div>

    </div>
  );
}


// ----------------- STYLES -----------------

const container = {
  padding: "30px",
  fontFamily: "Segoe UI, sans-serif"
};

const hero = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  border: "1px solid #dde2ff",
};

const title = {
  margin: 0,
  fontSize: "2.5rem"
};

const subtitle = {
  color: "#6b7280",
  marginTop: 10,
  fontSize: "18px"
};

const tagline = {
  marginTop: 8,
  color: "#022449",
  fontWeight: "bold"
};

const illustration = {
  width: "190px"
};


// ---------- QUICK ACTIONS ----------
const quickBox = {
  marginTop: "35px"
};

const actions = {
  display: "flex",
  gap: "20px",
  marginTop: 15,
  flexWrap: "wrap"
};

const card = {
  width: "240px",
  padding: "18px",
  borderRadius: "12px",
  background: "white",
  border: "1px solid #e1e5ff",
  boxShadow: "0 5px 18px rgba(0,0,0,0.1)",
  transition: "transform .25s ease",
  cursor: "pointer"
};

const footer = {
  marginTop: 45,
  textAlign: "center",
  color: "#6b7280"
};

import { useLocation } from "react-router-dom";

export default function PageHeader({ role }) {

  const location = useLocation();

  const pageTitles = {
    "/": "🏠 Dashboard Home",
    "/analytics": "📊 Analytics Overview",
    "/toprisky": "🔥 Top Risk Borrowers",
    "/need-officer": "👮 Need Officer Review",
    "/history": "📜 Borrower Risk History"
  };

  const title = pageTitles[location.pathname] || "Loan Risk AI Dashboard";

  return (
    <div style={headerBox}>
      <div>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          Secure Banking Intelligence Platform
        </p>
      </div>

      <span style={badge(role)}>
        {role?.toUpperCase()}
      </span>
    </div>
  );
}


const headerBox = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 22px",
  borderRadius: "12px",
  background: "white",
  border: "1px solid #dce3f5",
  boxShadow: "0 5px 18px rgba(0,0,0,0.08)",
  marginBottom: "25px"
};

const badge = (role) => ({
  padding: "8px 15px",
  borderRadius: "20px",
  fontWeight: 600,
  letterSpacing: "0.5px",
  color: "white",
  background:
    role === "admin"
      ? "#2563eb"      // blue badge for admin
      : "#16a34a"      // green badge for officer
});

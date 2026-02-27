import { useLocation } from "react-router-dom";

const pageTitles = {
  "/": {
    title: "Risk Operations Dashboard",
    subtitle: "Monitor borrower quality, prioritize intervention, and reduce default exposure.",
  },
  "/analytics": {
    title: "Analytics Overview",
    subtitle: "Portfolio-wide distribution, confidence quality, and risk concentration.",
  },
  "/toprisky": {
    title: "Top Risk Borrowers",
    subtitle: "Highest-priority accounts requiring immediate financial risk review.",
  },
  "/need-officer": {
    title: "Officer Review Queue",
    subtitle: "Borrowers automatically flagged for manual case assessment.",
  },
  "/history": {
    title: "Borrower Risk History",
    subtitle: "Track historical risk outcomes and intervention actions per borrower.",
  },
};

export default function PageHeader({ role, username }) {
  const location = useLocation();
  const currentPage = pageTitles[location.pathname] || pageTitles["/"];

  return (
    <header className="page-header">
      <div>
        <p className="page-kicker">Loan Decision Intelligence</p>
        <h2>{currentPage.title}</h2>
        <p className="page-subtitle">{currentPage.subtitle}</p>
      </div>

      <div className="role-chip-group">
        {username ? <span className="role-chip role-chip-neutral">{username}</span> : null}
        <span className="role-chip">{(role || "user").toUpperCase()}</span>
      </div>
    </header>
  );
}

import { Link } from "react-router-dom";

const actions = [
  {
    title: "Analytics",
    desc: "Portfolio-level risk distribution and confidence visibility.",
    path: "/analytics",
  },
  {
    title: "Top Risky",
    desc: "Highest-probability defaulters ranked for fast intervention.",
    path: "/toprisky",
  },
  {
    title: "Officer Queue",
    desc: "Cases requiring human decision review before final action.",
    path: "/need-officer",
  },
  {
    title: "Risk History",
    desc: "Borrower timeline of model outcomes and recommended actions.",
    path: "/history",
  },
];

export default function Home({ role }) {
  return (
    <div className="home-grid">
      <section className="hero-card">
        <div>
          <p className="page-kicker">Decision Support Platform</p>
          <h3>Reduce credit losses with explainable, action-ready risk scoring.</h3>
          <p>
            This workspace combines model output, officer review queues, and borrower history
            to help your team act before delinquency becomes default.
          </p>
          <div className="hero-meta">
            <span className="role-chip">Active Role: {role || "UNKNOWN"}</span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="section-title">Quick Actions</h3>
        <div className="action-grid">
          {actions.map((item) => (
            <Link key={item.title} to={item.path} className="action-card">
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
              <span>Open</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

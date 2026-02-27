import { Link, Outlet, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/analytics", label: "Analytics" },
  { path: "/toprisky", label: "Top Risky" },
  { path: "/need-officer", label: "Officer Queue" },
  { path: "/history", label: "Risk History" },
];

export default function AppLayout({ user, setUser }) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="sidebar-kicker">Loan Risk System</p>
          <h1 className="sidebar-title">Credit Intelligence</h1>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.path}
              className={`sidebar-link ${location.pathname === item.path ? "is-active" : ""}`}
              to={item.path}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="btn btn-danger" type="button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-panel">
        <PageHeader role={user?.role} username={user?.username} />
        <section className="page-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

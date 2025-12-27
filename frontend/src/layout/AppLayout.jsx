// frontend/src/layout/AppLayout.jsx
// frontend/src/layout/AppLayout.jsx
import PageHeader from "../components/PageHeader";
import { Link, Outlet, useLocation } from "react-router-dom";


export default function AppLayout({ user, setUser }) {

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        window.location.reload();
    };

    return (
        <div style={layout}>

            {/* ---------- SIDEBAR ---------- */}
            <aside style={sidebar}>
                <h2 style={logo}>🏦 Loan Risk AI</h2>

                <div style={{ marginTop: 20 }}>
                    <NavLink to="/">Home</NavLink>

                    {user?.role?.toLowerCase() === "admin" && (
                        <NavLink to="/analytics">Analytics</NavLink>
                    )}

                    <NavLink to="/toprisky">Top Risky</NavLink>
                    <NavLink to="/need-officer">Need Officer</NavLink>
                    <NavLink to="/history">History</NavLink>
                </div>

                <button onClick={handleLogout} style={logoutBtn}>
                    Logout
                </button>
            </aside>

            {/* ---------- MAIN CONTENT ---------- */}
            <main style={mainContent}>

                <PageHeader role={user?.role} />

                <Outlet />

            </main>

        </div>
    );
}

/* ---------- STYLES ---------- */
const layout = {
    display: "grid",
    gridTemplateColumns: "250px 1fr",
    height: "100vh",
};

const sidebar = {
    background: "#022449",
    padding: "25px 15px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "4px 0px 12px rgba(0,0,0,.25)"
};

const logo = {
    textAlign: "center",
    marginBottom: 10
};

const mainContent = {
    padding: "25px",
    overflowY: "auto"
};

const logoutBtn = {
    marginTop: 20,
    padding: "10px",
    background: "#dc2626",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer"
};

/* ---------- REUSABLE NAV COMPONENT ---------- */


function NavLink({ to, children }) {
    const location = useLocation();
    const active = location.pathname === to;

    return (
        <Link
            to={to}
            style={{
                display: "block",
                padding: "12px 14px",
                marginBottom: "8px",
                borderRadius: "8px",
                textDecoration: "none",

                background: active
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.12)",

                color: "white",
                transition: "0.25s",
                fontWeight: active ? "700" : "500",
                transform: active ? "scale(1.02)" : "scale(1)"
            }}

            onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.45)"}
            onMouseOut={(e) => e.target.style.background =
                active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"
            }
        >
            {children}
        </Link>
    );
}

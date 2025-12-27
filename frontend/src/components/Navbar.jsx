import { Link } from "react-router-dom";

export default function Navbar({ user, setUser }) {

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        window.location.reload();
    };

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,

                width: "100%",
                height: "70px",

                background: "#022449",
                color: "white",

                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",

                padding: "0 40px",
                boxSizing: "border-box",

                zIndex: 9999,
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)"
            }}
        >




            <h2>Loan Risk AI</h2>

            <div style={{ display: "flex", gap: "20px" }}>

                <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                    Home
                </Link>

                {/* ADMIN ONLY */}
                {user?.role?.toLowerCase() === "admin" && (
                    <Link to="/analytics" style={{ color: "white", textDecoration: "none" }}>
                        Analytics
                    </Link>
                )}

                <Link to="/toprisky" style={{ color: "white", textDecoration: "none" }}>
                    Top Risky
                </Link>

                <Link to="/need-officer" style={{ color: "white", textDecoration: "none" }}>
                    Need Officer
                </Link>

                <Link to="/history" style={{ color: "white", textDecoration: "none" }}>
                    History
                </Link>

                <button
                    onClick={handleLogout}
                    style={{
                        marginLeft: "20px",
                        padding: "6px 12px",
                        cursor: "pointer"
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

import { Navigate, Route, Routes } from "react-router-dom";
import { useMemo, useState } from "react";

import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import TopRisky from "./pages/TopRisky";
import NeedOfficer from "./pages/NeedOfficer";
import History from "./pages/History";
import Login from "./pages/Login";

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username") || "";

    if (token && role) {
      return { token, role, username };
    }
    return null;
  });

  const normalizedRole = useMemo(() => user?.role?.toUpperCase() || "", [user]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? <Navigate to="/" replace /> : <Login setUser={setUser} />
        }
      />

      <Route
        element={
          <ProtectedRoute user={user}>
            <AppLayout user={user} setUser={setUser} />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home role={normalizedRole} />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/toprisky" element={<TopRisky />} />
        <Route path="/need-officer" element={<NeedOfficer />} />
        <Route path="/history" element={<History />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import TopRisky from "./pages/TopRisky";
import NeedOfficer from "./pages/NeedOfficer";
import History from "./pages/History";
import Login from "./pages/Login";
import { useState, useEffect } from "react";

export default function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      setUser({ token, role });
    }
  }, []);

  // If NOT logged in → only show login
  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <>
      <Navbar user={user} setUser={setUser} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/toprisky" element={<TopRisky />} />
        <Route path="/need-officer" element={<NeedOfficer />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </>
  );
}

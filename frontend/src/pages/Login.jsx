import { useState } from "react";

export default function Login({ setUser }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          username: username,
          password: password
        })
      });

      if (!res.ok) {
        setError("Invalid username or password ❌");
        setLoading(false);
        return;
      }

      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      setUser({
        username: username,
        role: data.role,
        token: data.access_token
      });

      alert("Login Successful 🎯");
      window.location.href = "/";
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>🏦 Loan Risk AI – Secure Login</h1>
        <p style={subtitle}>Only authorized bank staff can access this dashboard</p>

        <form onSubmit={handleLogin} style={{ marginTop: "20px" }}>
          
          <input
            type="text"
            placeholder="👤 Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            style={input}
            required
          />

          <input
            type="password"
            placeholder="🔐 Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={input}
            required
          />

          <button type="submit" disabled={loading} style={button}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        {error && <p style={errorText}>{error}</p>}

        <p style={footerText}>
          Secure System • Role Based Access • Bank Level Protection
        </p>
      </div>
    </div>
  );
}


// ================= STYLES ==================

const container = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #0A2540, #1f4068)"
};

const card = {
  width: "420px",
  padding: "35px",
  borderRadius: "15px",
  background: "white",
  boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
  textAlign: "center"
};

const title = {
  margin: 0
};

const subtitle = {
  color: "gray",
  marginTop: "5px",
  fontSize: "14px"
};

const input = {
  width: "100%",
  padding: "12px",
  marginTop: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px"
};

const button = {
  width: "100%",
  padding: "12px",
  marginTop: "18px",
  borderRadius: "8px",
  border: "none",
  background: "#0A2540",
  color: "white",
  fontSize: "16px",
  cursor: "pointer"
};

const errorText = {
  marginTop: "15px",
  color: "red",
  fontWeight: "bold"
};

const footerText = {
  marginTop: "25px",
  fontSize: "12px",
  color: "gray"
};

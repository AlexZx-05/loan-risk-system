import { useState } from "react";
import { BASE_URL } from "../api";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username, password }),
      });

      if (!res.ok) {
        setError("Invalid username or password");
        return;
      }

      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", username);

      setUser({
        username,
        role: data.role,
        token: data.access_token,
      });
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-creative-shell">
      <div className="login-glow login-glow-a" />
      <div className="login-glow login-glow-b" />

      <section className="login-showcase">
        <p className="login-showcase-kicker">Credit Risk Intelligence</p>
        <h1>Predict early. Intervene fast. Protect portfolio quality.</h1>
        <p>
          Unified control center for officer decisions, borrower risk visibility, and model-backed
          action plans.
        </p>

        <div className="login-showcase-grid">
          <article>
            <span>99.2%</span>
            <p>Scoring pipeline uptime</p>
          </article>
          <article>
            <span>3x</span>
            <p>Faster risk triage workflow</p>
          </article>
          <article>
            <span>24/7</span>
            <p>Monitoring and review surface</p>
          </article>
        </div>
      </section>

      <section className="login-auth-card">
        <p className="page-kicker">Secure Access</p>
        <h2>Loan Risk Control Center</h2>
        <p className="login-auth-subtext">Sign in with authorized bank credentials.</p>

        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoComplete="username"
            placeholder="Enter your username"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />

          <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
            {loading ? "Authenticating..." : "Login to Workspace"}
          </button>

          {error ? <p className="form-error">{error}</p> : null}
        </form>

        <div className="login-hints">
          <span>Demo users:</span>
          <code>admin / admin123</code>
          <code>officer / officer123</code>
        </div>
      </section>
    </div>
  );
}

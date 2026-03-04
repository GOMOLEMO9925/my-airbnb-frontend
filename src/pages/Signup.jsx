import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../utils/api.js";

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = new URLSearchParams(location.search).get("next");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch("/api/users/register", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          role: isHost ? "host" : "user"
        })
      });
      login(data.token, data.user);
      navigate(nextPath || "/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login">
      <section className="auth-card">
        <p className="eyebrow">Create account</p>
        <h1>Sign up for Airbnb</h1>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
          <label className="checkline">
            <input type="checkbox" checked={isHost} onChange={(event) => setIsHost(event.target.checked)} />
            <span>Sign up as host</span>
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        </form>
        <p className="auth-switch">
          Already have an account?{" "}
          <Link to={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}>Log in</Link>
        </p>
      </section>
    </div>
  );
};

export default Signup;

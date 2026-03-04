import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../utils/api.js";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = new URLSearchParams(location.search).get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
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
    <div className="page login figma-login">
      <section className="auth-card figma-auth-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button type="button" className="text-link forgot-link">Forgot Password ?</button>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        </form>
        <p className="auth-switch">
          New to Airbnb?{" "}
          <Link to={nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup"}>Create an account</Link>
        </p>
      </section>
    </div>
  );
};

export default Login;

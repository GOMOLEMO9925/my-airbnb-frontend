import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import airbnbRedLogo from "../assets/airbnb-red.svg";
import airbnbWhiteLogo from "../assets/airbnb-white.svg";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("airbnb_theme") || "light");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("airbnb_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const canHost = user?.role === "host" || user?.role === "admin";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    if (location.pathname === "/locations") {
      setSearchQuery(q);
    }
  }, [location.pathname, location.search]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      navigate("/locations");
      return;
    }
    navigate(`/locations?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="top-header">
      <div className="top-header-inner">
        <div className="brand">
          <Link to="/" aria-label="Airbnb home">
            <img
              className="brand-logo"
              src={theme === "dark" ? airbnbWhiteLogo : airbnbRedLogo}
              style={{ height: 32, width: 32 }}
              alt="Airbnb"
            />
            <span>Airbnb</span>
          </Link>
        </div>

        <form className="search-pill" onSubmit={handleSearch}>
          <input
            className="search-pill-input"
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Start your search"
            aria-label="Search stays"
          />
          <button className="search-pill-icon" type="submit" aria-label="Submit search">⌕</button>
        </form>

        <div className="header-actions">
          <button type="button" className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          {!isAuthenticated ? <NavLink to="/signup" className="host-link">Become a host</NavLink> : null}
          {isAuthenticated && canHost ? <NavLink to="/admin" className="host-link">Hosting</NavLink> : null}
          {isAuthenticated ? (
            <div className="profile-menu">
              <button type="button" className="profile-trigger" onClick={() => setOpen((prev) => !prev)}>
                <span>{user?.username || "Host"}</span>
                <span className="avatar" aria-hidden="true">☻</span>
              </button>
              {open && (
                <div className="dropdown">
                  <button type="button" onClick={() => navigate("/reservations")}>Reservations</button>
                  <button type="button" onClick={handleLogout}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links" />
          )}
        </div>
      </div>

      <nav className="nav-links" aria-label="Primary">
        <NavLink to="/">Homes</NavLink>
        <NavLink to="/locations">Stays</NavLink>
        {isAuthenticated && canHost ? <NavLink to="/admin">Hosting</NavLink> : null}
      </nav>
    </header>
  );
};

export default Header;

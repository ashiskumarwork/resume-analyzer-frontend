import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

// Navbar: responsive top navigation with auth-aware links and a mobile menu.
const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Log the user out and send to login.
  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  // Toggle/close the mobile drawer menu.
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">🎓 AI Resume Analyzer</span>
        </Link>

        {/* Mobile menu toggle (icon only; no external lib) */}
        <div
          className="menu-icon"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          role="button"
        >
          {menuOpen ? "✕" : "☰"}
        </div>

        {/* Navigation links (authenticated vs guest) */}
        <ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                  📊 Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/upload" className="nav-link" onClick={closeMenu}>
                  📄 Upload Resume
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/history" className="nav-link" onClick={closeMenu}>
                  📚 History
                </Link>
              </li>
              <li className="nav-item">
                <button className="logout-btn" onClick={handleLogout}>
                  👋 Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={closeMenu}>
                  🔑 Login
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/register"
                  className="nav-link register-link"
                  onClick={closeMenu}
                >
                  🎉 Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

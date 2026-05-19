import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";

const LANDING_THEME_KEY = "landing-theme";

function Navbar() {
  const scrollTimeoutRef = useRef(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "night";
    }

    return window.localStorage.getItem(LANDING_THEME_KEY) || "night";
  });
  const [isScrolling, setIsScrolling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-landing-theme", theme);
    window.localStorage.setItem(LANDING_THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 180);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const toggleTheme = () => {
    setTheme((current) => (current === "night" ? "day" : "night"));
  };

  return (
    <nav className={`navbar${isScrolling ? " navbar-hidden" : ""}${isOpen ? " navbar-expanded" : ""}`}>
      <div className="navbar-logo">
        <Link to="/" onClick={() => setIsOpen(false)}>
          <img src={logo} alt="Career Tracker" />
        </Link>
      </div>

      <div className={`navbar-menu-container ${isOpen ? "open" : ""}`}>
        <ul className="navbar-links">
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          </li>
          <li>
            <Link to="/features" onClick={() => setIsOpen(false)}>Features</Link>
          </li>
          <li>
            <Link to="/pricing" onClick={() => setIsOpen(false)}>Pricing</Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
          </li>
          <li>
            <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
          </li>
        </ul>

        <div className="navbar-cta">
          <Link to="/login" className="btn-login" onClick={() => setIsOpen(false)}>
            Login
          </Link>

          <Link to="/signup" className="btn-signup" onClick={() => setIsOpen(false)}>
            Get Started
          </Link>

          <button
            type="button"
            className={`theme-toggle ${theme}`}
            onClick={toggleTheme}
            aria-label={theme === "night" ? "Switch to day mode" : "Switch to night mode"}
            title={theme === "night" ? "Switch to day mode" : "Switch to night mode"}
          >
            {theme === "night" ? (
              <span className="theme-icon night-icon" aria-hidden="true">
                <span className="moon-shape"></span>
                <span className="star-shape star-one"></span>
                <span className="star-shape star-two"></span>
              </span>
            ) : (
              <span className="theme-icon day-icon" aria-hidden="true">
                <span className="sun-shape"></span>
                <span className="cloud-shape"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`navbar-toggle-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

    </nav>
  );
}

export default Navbar;

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
    <nav className={`navbar${isScrolling ? " navbar-hidden" : ""}`}>
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Career Tracker" />
        </Link>
      </div>

      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/features">Features</Link>
        </li>


        <li>
          <Link to="/pricing">Pricing</Link>
        </li>

        <li>
          <Link to="/about">About</Link>
        </li>


        <li>
          <Link to="/contact">Contact</Link>
        </li>

      </ul>

      <div className="navbar-cta">
        <Link to="/login" className="btn-login">
          Login
        </Link>

        <Link to="/signup" className="btn-signup">
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

    </nav>
  );
}

export default Navbar;

import { NavLink } from "react-router-dom"
import "./Sidebar.css"
import logo from "../../assets/logo.png"

const navItems = [
  { label: "Overview", path: "/dashboard" },
  { label: "Analytics", path: "/dashboard/analytics" },
  { label: "Integrations", path: "/dashboard/integrations" },
  { label: "Resume", path: "/dashboard/resume" },
  { label: "Job Matcher", path: "/dashboard/job-matcher" },
  { label: "Profile", path: "/dashboard/profile" },
  { label: "Settings", path: "/dashboard/settings" },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <img src={logo} alt="Career Tracker Logo" className="logo-image" />
        <button 
          type="button" 
          className="sidebar-close-btn" 
          onClick={onClose} 
          aria-label="Close sidebar"
        >
          &times;
        </button>
      </div>

      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>


      <div className="sidebar-footer">
        <span className="sidebar-footer-dot" aria-hidden="true"></span>
        <div className="sidebar-footer-copy">
          <strong>Career Tracker</strong>
          <small>Keep building your streak</small>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

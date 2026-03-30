import { NavLink } from "react-router-dom"
import "./Sidebar.css"
import logo from "../../assets/logo.png"

const navItems = [
  { label: "Overview", path: "/dashboard" },
  { label: "Analytics", path: "/dashboard/analytics" },
  { label: "Integrations", path: "/dashboard/integrations" },
  { label: "Profile", path: "/dashboard/profile" },
  { label: "Settings", path: "/dashboard/settings" },
]

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt="Career Tracker Logo" className="logo-image" />
      </div>

      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
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

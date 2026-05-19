import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Dashboard.css"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

const DASHBOARD_THEME_KEY = "dashboard-theme"
const DASHBOARD_THEME_EVENT = "dashboard-theme-updated"

function Dashboard(){
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "day"
    }

    return window.localStorage.getItem(DASHBOARD_THEME_KEY) || "day"
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(window.localStorage.getItem(DASHBOARD_THEME_KEY) || "day")
    }

    window.addEventListener(DASHBOARD_THEME_EVENT, handleThemeChange)
    window.addEventListener("storage", handleThemeChange)

    return () => {
      window.removeEventListener(DASHBOARD_THEME_EVENT, handleThemeChange)
      window.removeEventListener("storage", handleThemeChange)
    }
  }, [])

  return(
    <div className="dashboard-layout" data-dashboard-theme={theme}>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay mask for mobile drawer */}
      <div 
        className={`dashboard-sidebar-overlay ${sidebarOpen ? "active" : ""}`} 
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Main Area */}
      <div className="dashboard-main">

        {/* Topbar */}
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dynamic Content */}
        <div className="dashboard-content">
          <Outlet />
        </div>

      </div>
    </div>
  )
}

export default Dashboard

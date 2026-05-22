import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Dashboard.css"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import CTAI from "../../components/CTAI"

const DASHBOARD_THEME_KEY = "dashboard-theme"
const DASHBOARD_THEME_EVENT = "dashboard-theme-updated"

function Dashboard(){
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "night"
    }

    return window.localStorage.getItem(DASHBOARD_THEME_KEY) || "night"
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ctaiOpen, setCtaiOpen] = useState(false)
  const [ctaiWidth, setCtaiWidth] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(window.localStorage.getItem('ctai-width')) || 400;
    }
    return 400;
  })
  const [ctaiResizing, setCtaiResizing] = useState(false)

  const handleCtaiChange = (status) => {
    if (status.isOpen !== undefined) setCtaiOpen(status.isOpen);
    if (status.width !== undefined) setCtaiWidth(status.width);
    if (status.isResizing !== undefined) setCtaiResizing(status.isResizing);
  };

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
    <div 
      className={`dashboard-layout ${ctaiOpen ? "ctai-docked-open" : ""} ${ctaiResizing ? "ctai-resizing" : ""}`} 
      data-dashboard-theme={theme}
      style={{ "--ctai-width": `${ctaiWidth}px` }}
    >

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
      {/* CT ai - AI Career Assistant */}
      <CTAI onChange={handleCtaiChange} />
    </div>
  )
}

export default Dashboard

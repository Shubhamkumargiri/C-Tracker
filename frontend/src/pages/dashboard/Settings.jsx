import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Settings.css"
import { clearAuthSession, getStoredUser, updateStoredUser } from "../../lib/auth"

const SETTINGS_KEY = "dashboard-settings"
const DASHBOARD_THEME_KEY = "dashboard-theme"
const DASHBOARD_THEME_EVENT = "dashboard-theme-updated"

function getSavedPreferences() {
  if (typeof window === "undefined") {
    return {
      weeklyDigest: true,
      interviewAlerts: true,
      publicProfile: false,
    }
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)

    if (!raw) {
      return {
        weeklyDigest: true,
        interviewAlerts: true,
        publicProfile: false,
      }
    }

    return JSON.parse(raw)
  } catch {
    return {
      weeklyDigest: true,
      interviewAlerts: true,
      publicProfile: false,
    }
  }
}

function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getStoredUser())
  const [formData, setFormData] = useState(() => ({
    name: getStoredUser()?.name || "",
    email: getStoredUser()?.email || "",
  }))
  const [preferences, setPreferences] = useState(() => getSavedPreferences())
  const [dashboardTheme, setDashboardTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "day"
    }

    return window.localStorage.getItem(DASHBOARD_THEME_KEY) || "day"
  })
  const [statusMessage, setStatusMessage] = useState("")

  const completion = useMemo(() => {
    let score = 40

    if (formData.name.trim()) {
      score += 25
    }

    if (formData.email.trim()) {
      score += 20
    }

    if (preferences.weeklyDigest || preferences.interviewAlerts || preferences.publicProfile) {
      score += 15
    }

    return `${score}%`
  }, [formData.email, formData.name, preferences])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setStatusMessage("")
  }

  const handleToggle = (key) => {
    setPreferences((current) => {
      const nextPreferences = { ...current, [key]: !current[key] }
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextPreferences))
      return nextPreferences
    })

    setStatusMessage("Preferences updated.")
  }

  const handleSaveProfile = (event) => {
    event.preventDefault()

    const nextUser = updateStoredUser({
      name: formData.name.trim(),
      email: formData.email.trim(),
    })

    setUser(nextUser)
    setStatusMessage("Profile settings saved.")
  }

  const handleThemeChange = () => {
    const nextTheme = dashboardTheme === "day" ? "night" : "day"
    window.localStorage.setItem(DASHBOARD_THEME_KEY, nextTheme)
    window.dispatchEvent(new Event(DASHBOARD_THEME_EVENT))
    setDashboardTheme(nextTheme)
    setStatusMessage(`Dashboard switched to ${nextTheme} mode.`)
  }

  const handleDeleteAccount = () => {
    const shouldDelete = window.confirm(
      "Delete this local account from the dashboard? This will clear your saved session and preferences on this device."
    )

    if (!shouldDelete) {
      return
    }

    window.localStorage.removeItem(SETTINGS_KEY)
    window.localStorage.removeItem(DASHBOARD_THEME_KEY)
    clearAuthSession()
    navigate("/signup")
  }

  return (
    <div className="settings-page">
      <section className="settings-hero">
        <div>
          <h1>Keep your dashboard aligned with how you work.</h1>
          <p>
            Update your basic profile details, adjust reminders, and keep your workspace ready for the next application push.
          </p>
        </div>

        <div className="settings-status-card">
          <span>Setup health</span>
          <strong>{completion}</strong>
          <p>{user?.name || "Your account"} is active and ready for tracking.</p>
        </div>
      </section>

      <div className="settings-grid">
        <form className="settings-panel" onSubmit={handleSaveProfile}>
          <div className="settings-heading">
            <span>Profile</span>
            <h2>Account details</h2>
          </div>

          <label className="settings-field">
            <span>Full name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
            />
          </label>

          <label className="settings-field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
          </label>

          <button type="submit" className="settings-primary-btn">
            Save changes
          </button>
        </form>

        <section className="settings-panel">
          <div className="settings-heading">
            <span>Preferences</span>
            <h2>Notifications and visibility</h2>
          </div>

          <div className="settings-toggle-list">
            <button
              type="button"
              className={`settings-toggle${preferences.weeklyDigest ? " active" : ""}`}
              onClick={() => handleToggle("weeklyDigest")}
            >
              <div>
                <strong>Weekly digest</strong>
                <p>Receive a summary of your weekly progress.</p>
              </div>
              <span>{preferences.weeklyDigest ? "On" : "Off"}</span>
            </button>

            <button
              type="button"
              className={`settings-toggle${preferences.interviewAlerts ? " active" : ""}`}
              onClick={() => handleToggle("interviewAlerts")}
            >
              <div>
                <strong>Interview reminders</strong>
                <p>Keep nudges for practice and application follow-ups.</p>
              </div>
              <span>{preferences.interviewAlerts ? "On" : "Off"}</span>
            </button>

            <button
              type="button"
              className={`settings-toggle${preferences.publicProfile ? " active" : ""}`}
              onClick={() => handleToggle("publicProfile")}
            >
              <div>
                <strong>Public profile mode</strong>
                <p>Prepare your account for portfolio-style sharing.</p>
              </div>
              <span>{preferences.publicProfile ? "On" : "Off"}</span>
            </button>
          </div>
        </section>
      </div>

      <section className="settings-panel">
        <div className="settings-heading">
          <span>Appearance</span>
          <h2>Dashboard theme</h2>
        </div>

        <button type="button" className="settings-theme-toggle" onClick={handleThemeChange}>
          <div>
            <strong>{dashboardTheme === "day" ? "Day mode" : "Night mode"}</strong>
          </div>
          <span>{dashboardTheme === "day" ? "Switch to night" : "Switch to day"}</span>
        </button>
      </section>

      <section className="settings-panel settings-actions">
        <div className="settings-heading">
          <span>Account</span>
          <h2>Account actions</h2>
        </div>

        <div className="settings-actions-row">
          <p>{statusMessage || "Your changes are stored locally in this dashboard."}</p>
          <button type="button" className="settings-danger-btn" onClick={handleDeleteAccount}>
            Delete account
          </button>
        </div>
      </section>
    </div>
  )
}

export default Settings

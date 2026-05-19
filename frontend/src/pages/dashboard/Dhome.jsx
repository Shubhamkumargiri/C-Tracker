import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import "./Dhome.css"
import { getStoredUser } from "../../lib/auth"
import { countConnectedIntegrations, getSavedIntegrations } from "../../lib/integrations"

const SETTINGS_KEY = "dashboard-settings"
const DASHBOARD_THEME_KEY = "dashboard-theme"

function getSavedJson(key, fallback) {
  if (typeof window === "undefined") {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function Dhome() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const firstName = user?.name?.split(" ")[0] || "Developer"
  const integrations = getSavedIntegrations()
  const preferences = getSavedJson(SETTINGS_KEY, {
    weeklyDigest: true,
    interviewAlerts: true,
    publicProfile: false,
  })
  const dashboardTheme =
    typeof window === "undefined" ? "day" : window.localStorage.getItem(DASHBOARD_THEME_KEY) || "day"
  const connectedCount = countConnectedIntegrations(integrations)
  const profileReady = Boolean(user?.name?.trim() && user?.email?.trim())

  const scoreCards = [
    { label: "LeetCode solved", value: "320", note: "+18 this week", accent: "pink" },
    { label: "GitHub commits", value: "95", note: "12 streak days", accent: "blue" },
    { label: "LinkedIn reach", value: "540", note: "+42 profile views", accent: "gold" },
    { label: "Consistency score", value: "82%", note: "Top 14% momentum", accent: "violet" },
  ]

  const actionItems = [
    "Finish one system design case study",
    "Update one GitHub project this week",
    "Send 3 networking messages",
  ]

  const quickActions = useMemo(
    () => [
      {
        label: "Open analytics",
        value: "Review weekly trends and AI prediction",
        cta: "View analytics",
        onClick: () => navigate("/dashboard/analytics"),
      },
      {
        label: connectedCount > 0 ? "Manage integrations" : "Connect accounts",
        value:
          connectedCount > 0
            ? `${connectedCount} platform${connectedCount > 1 ? "s" : ""} connected so far`
            : "Sync GitHub, LeetCode, and LinkedIn",
        cta: connectedCount > 0 ? "Manage" : "Connect now",
        onClick: () => navigate("/dashboard/integrations"),
      },
      {
        label: profileReady ? "Refine profile" : "Complete profile",
        value: profileReady ? "Polish your recruiter-facing details" : "Add your name and email details",
        cta: "Open settings",
        onClick: () => navigate("/dashboard/settings"),
      },
    ],
    [connectedCount, navigate, profileReady]
  )

  const recentItems = useMemo(
    () => [
      {
        title: "Integrations",
        detail:
          connectedCount > 0
            ? `${connectedCount} connected account${connectedCount > 1 ? "s are" : " is"} feeding your dashboard flow.`
            : "No connected accounts yet. Start with GitHub or LinkedIn to unlock better signals.",
        action: connectedCount > 0 ? "Review" : "Connect",
        onClick: () => navigate("/dashboard/integrations"),
      },
      {
        title: "Workspace",
        detail:
          dashboardTheme === "night"
            ? "Night mode is active for a more focused dashboard view."
            : "Day mode is active with the same dashboard cards on a clean white backdrop.",
        action: "Change",
        onClick: () => navigate("/dashboard/settings"),
      },
      {
        title: "Preferences",
        detail: preferences.weeklyDigest || preferences.interviewAlerts || preferences.publicProfile
          ? "Your reminders and visibility preferences are set up and ready."
          : "Your reminders are turned off. Update preferences to keep your momentum on track.",
        action: "Update",
        onClick: () => navigate("/dashboard/settings"),
      },
    ],
    [connectedCount, dashboardTheme, navigate, preferences.interviewAlerts, preferences.publicProfile, preferences.weeklyDigest]
  )

  return (
    <>
      <section className="dashboard-hero">
        <div className="hero-panel">
          <span className="hero-tag">Overview</span>
          <h1>{firstName}, here is your progress this week.</h1>
          <p>
            Your activity is moving in a good direction. Stay consistent this week and keep building visible proof of work.
          </p>
        </div>

        <div className="readiness-card">
          <div className="readiness-header">
            <span>Job readiness</span>
            <strong>76%</strong>
          </div>

          <div className="meter">
            <div className="meter-fill"></div>
          </div>

          <p className="readiness-copy">
            Your profile is improving. The next gains will come from stronger project presentation and better interview preparation.
          </p>

          <div className="readiness-foot">
            <div>
              <small>Strength area</small>
              <strong>Consistency</strong>
            </div>

            <div>
              <small>Needs attention</small>
              <strong>Networking</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {scoreCards.map((card) => (
          <article key={card.label} className={`stat-card ${card.accent}`}>
            <span className="stat-label">{card.label}</span>
            <p className="big">{card.value}</p>
            <span className="stat-note">{card.note}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-panels">
        <div className="career-insights">
          <div className="section-heading">
            <span>Career insights</span>
            <h2>What to focus on next</h2>
          </div>

          <div className="insight-card">
            <p className="insight-title">Strengths</p>
            <ul>
              <li>Good problem-solving consistency</li>
              <li>Healthy GitHub activity</li>
              <li>Steady progress over the last 21 days</li>
            </ul>

            <p className="insight-title">Improve next</p>
            <ul>
              <li>Show clearer project outcomes</li>
              <li>Practice system design regularly</li>
              <li>Build a simple networking routine</li>
            </ul>

            <p className="prediction">
              Keep this pace for 4 more weeks and your profile should look stronger to recruiters.
            </p>
          </div>
        </div>

        <div className="focus-card">
          <div className="section-heading">
            <span>This week</span>
            <h2>Simple action plan</h2>
          </div>

          <ul className="focus-list">
            {actionItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="dashboard-lower">
        <div className="quick-card">
          <div className="section-heading">
            <span>Quick actions</span>
            <h2>Useful next steps</h2>
          </div>

          <div className="quick-list">
            {quickActions.map((item) => (
              <button key={item.label} type="button" className="quick-item" onClick={item.onClick}>
                <div className="quick-item-copy">
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </div>
                <span className="quick-item-cta">{item.cta}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="recent-card">
          <div className="section-heading">
            <span>Recent activity</span>
            <h2>Latest updates</h2>
          </div>

          <div className="recent-list">
            {recentItems.map((item) => (
              <div key={item.title} className="recent-item">
                <div className="recent-item-copy">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <button type="button" className="recent-item-btn" onClick={item.onClick}>
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Dhome

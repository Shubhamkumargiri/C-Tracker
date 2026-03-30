import { useState } from "react"
import "./Integrations.css"

const INTEGRATIONS_KEY = "dashboard-integrations"

const integrationItems = [
  {
    key: "github",
    label: "GitHub",
    description: "Track commits, repositories and open source work",
    url: "https://github.com/login",
    accent: "github",
    points: ["Commit history", "Repository health", "Open-source activity"],
  },
  {
    key: "leetcode",
    label: "LeetCode",
    description: "Analyze problem solving progress and streaks",
    url: "https://leetcode.com/accounts/login/",
    accent: "leetcode",
    points: ["Solved questions", "Difficulty spread", "Daily streak tracking"],
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    description: "Measure profile strength and networking growth",
    url: "https://www.linkedin.com/login",
    accent: "linkedin",
    points: ["Profile strength", "Visibility trends", "Networking momentum"],
  },
]

function getSavedIntegrations() {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(INTEGRATIONS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function Integrations() {
  const [connected, setConnected] = useState(() => getSavedIntegrations())

  const handleConnect = (item) => {
    const nextState = { ...connected, [item.key]: true }
    setConnected(nextState)
    window.localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(nextState))
    window.open(item.url, "_blank", "noopener,noreferrer")
  }

  const handleDisconnect = (key) => {
    const nextState = { ...connected, [key]: false }
    setConnected(nextState)
    window.localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(nextState))
  }

  return (
    <div className="integrations-page">
      <h1>Connect Your Accounts</h1>

      <p className="sub">
        Link your developer profiles to track your career progress
      </p>

      <div className="integrations-grid">
        {integrationItems.map((item) => {
          const isConnected = Boolean(connected[item.key])

          return (
            <div key={item.key} className={`integration-card ${item.accent}${isConnected ? " is-connected" : ""}`}>
              <div className="integration-card-top">
                <div className="integration-card-title">
                  <span className="integration-icon" aria-hidden="true">
                    {item.label.slice(0, 1)}
                  </span>
                  <h3>{item.label}</h3>
                </div>
              </div>

              <p>{item.description}</p>

              <div className="integration-meta">
                <span className={`integration-status${isConnected ? " connected" : ""}`}>
                  {isConnected ? "Connected" : "Not connected"}
                </span>
              </div>

              <ul className="integration-points">
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <div className="integration-actions">
                <button type="button" className="integration-primary-btn" onClick={() => handleConnect(item)}>
                  {isConnected ? `Open ${item.label}` : `Connect ${item.label}`}
                </button>

                {isConnected && (
                  <button
                    type="button"
                    className="integration-secondary-btn"
                    onClick={() => handleDisconnect(item.key)}
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Integrations

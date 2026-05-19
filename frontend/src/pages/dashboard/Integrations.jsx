import { useState, useEffect } from "react"
import "./Integrations.css"
import { apiRequest } from "../../lib/api"
import { getStoredUser, updateStoredUser } from "../../lib/auth"
import {
  getSavedGithubUsername,
  getSavedLinkedinMetrics,
  getSavedLeetcodeUsername,
  getSavedIntegrations,
  saveGithubUsername,
  saveLinkedinMetrics,
  saveIntegrations,
  saveLeetcodeUsername,
} from "../../lib/integrations"

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

function Integrations() {
  const [connected, setConnected] = useState(() => getSavedIntegrations())
  const [githubUsername, setGithubUsername] = useState(() => getSavedGithubUsername())
  const [leetcodeUsername, setLeetcodeUsername] = useState(() => getSavedLeetcodeUsername())
  const [linkedinMetrics, setLinkedinMetrics] = useState(() => getSavedLinkedinMetrics())

  const [githubData, setGithubData] = useState(null)
  const [githubLoading, setGithubLoading] = useState(false)
  const [leetcodeData, setLeetcodeData] = useState(null)
  const [leetcodeLoading, setLeetcodeLoading] = useState(false)

  useEffect(() => {
    if (!connected.github || !githubUsername) {
      setGithubData(null)
      return
    }

    let ignore = false
    async function loadGithub() {
      setGithubLoading(true)
      try {
        const data = await apiRequest(`/api/github/analytics/${encodeURIComponent(githubUsername)}`)
        if (!ignore) setGithubData(data)
      } catch (err) {
        if (!ignore) setGithubData(null)
      } finally {
        if (!ignore) setGithubLoading(false)
      }
    }
    loadGithub()
    return () => { ignore = true }
  }, [connected.github, githubUsername])

  useEffect(() => {
    if (!connected.leetcode || !leetcodeUsername) {
      setLeetcodeData(null)
      return
    }

    let ignore = false
    async function loadLeetcode() {
      setLeetcodeLoading(true)
      try {
        const data = await apiRequest(`/api/leetcode/analytics/${encodeURIComponent(leetcodeUsername)}`)
        if (!ignore) setLeetcodeData(data)
      } catch (err) {
        if (!ignore) setLeetcodeData(null)
      } finally {
        if (!ignore) setLeetcodeLoading(false)
      }
    }
    loadLeetcode()
    return () => { ignore = true }
  }, [connected.leetcode, leetcodeUsername])

  const handleLinkedinMetricChange = (field, value) => {
    setLinkedinMetrics((current) => ({
      ...current,
      [field]: value.replace(/\D/g, ""),
    }))
  }

  const handleLinkedinEnter = async () => {
    if (!linkedinMetrics.connections || !linkedinMetrics.profileViewers || !linkedinMetrics.postImpressions) {
      window.alert("Enter LinkedIn connections, profile viewers, and post impressions.")
      return
    }

    try {
      const response = await apiRequest("/api/auth/integrations", {
        method: "PATCH",
        body: JSON.stringify({
          key: "linkedin",
          connected: true,
          metrics: {
            connections: Number(linkedinMetrics.connections),
            profileViewers: Number(linkedinMetrics.profileViewers),
            postImpressions: Number(linkedinMetrics.postImpressions),
          },
        }),
      })
      updateStoredUser(response.user)
      setConnected(response.user.integrations)
    } catch (err) {
      console.error("Failed to connect LinkedIn in database:", err)
    }

    const nextState = { ...connected, linkedin: true }
    saveIntegrations(nextState)
    saveLinkedinMetrics(linkedinMetrics)

    try {
      await apiRequest("/api/timeline/snapshot", {
        method: "POST",
        body: JSON.stringify({
          stats: {
            linkedin: linkedinMetrics,
          },
        }),
      })
    } catch {
      // LinkedIn metrics remain saved locally even if the user is offline or signed out.
    }
  }

  const handleLinkedinKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleLinkedinEnter()
    }
  }

  const handleConnect = async (item) => {
    if (item.key === "github" && !githubUsername.trim()) {
      window.alert("Enter a GitHub username before connecting.")
      return
    }
    if (item.key === "leetcode" && !leetcodeUsername.trim()) {
      window.alert("Enter a LeetCode username before connecting.")
      return
    }

    const username = item.key === "github" ? githubUsername.trim() : leetcodeUsername.trim()

    try {
      const response = await apiRequest("/api/auth/integrations", {
        method: "PATCH",
        body: JSON.stringify({
          key: item.key,
          connected: true,
          username,
        }),
      })
      updateStoredUser(response.user)
      setConnected(response.user.integrations)
    } catch (err) {
      console.error("Failed to connect platform in database:", err)
    }

    const nextState = { ...connected, [item.key]: true }
    saveIntegrations(nextState)

    let openUrl = item.url
    if (item.key === "github") {
      saveGithubUsername(githubUsername)
      openUrl = `https://github.com/${encodeURIComponent(githubUsername.trim())}`
    }
    if (item.key === "leetcode") {
      saveLeetcodeUsername(leetcodeUsername)
      openUrl = `https://leetcode.com/u/${encodeURIComponent(leetcodeUsername.trim())}/`
    }

    try {
      window.open(openUrl, "_blank", "noopener,noreferrer")
    } catch (e) {
      console.warn("Popup blocker caught window.open, fallback to native link will handle next clicks.", e)
    }
  }

  const handleDisconnect = async (key) => {
    try {
      const response = await apiRequest("/api/auth/integrations", {
        method: "PATCH",
        body: JSON.stringify({
          key,
          connected: false,
        }),
      })
      updateStoredUser(response.user)
      setConnected(response.user.integrations)
    } catch (err) {
      console.error("Failed to disconnect platform in database:", err)
    }

    const nextState = { ...connected, [key]: false }
    saveIntegrations(nextState)

    if (key === "github") {
      setGithubUsername("")
      saveGithubUsername("")
    }
    if (key === "leetcode") {
      setLeetcodeUsername("")
      saveLeetcodeUsername("")
    }
    if (key === "linkedin") {
      const emptyMetrics = {
        connections: "",
        profileViewers: "",
        postImpressions: "",
      }
      setLinkedinMetrics(emptyMetrics)
      saveLinkedinMetrics(emptyMetrics)
    }
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

              {item.key === "github" && (
                <label className="integration-field">
                  <span>GitHub username</span>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(event) => setGithubUsername(event.target.value)}
                    placeholder="github_username"
                    autoComplete="off"
                    disabled={isConnected}
                  />
                </label>
              )}

              {item.key === "leetcode" && (
                <label className="integration-field">
                  <span>LeetCode username</span>
                  <input
                    type="text"
                    value={leetcodeUsername}
                    onChange={(event) => setLeetcodeUsername(event.target.value)}
                    placeholder="leetcode_username"
                    autoComplete="off"
                    disabled={isConnected}
                  />
                </label>
              )}

              {item.key === "linkedin" && (
                <div className="integration-field-group">
                  <label className="integration-field">
                    <span>Connections</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={linkedinMetrics.connections}
                      onChange={(event) => handleLinkedinMetricChange("connections", event.target.value)}
                      onKeyDown={handleLinkedinKeyDown}
                      placeholder="500"
                      autoComplete="off"
                    />
                  </label>

                  <label className="integration-field">
                    <span>Profile viewers</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={linkedinMetrics.profileViewers}
                      onChange={(event) => handleLinkedinMetricChange("profileViewers", event.target.value)}
                      onKeyDown={handleLinkedinKeyDown}
                      placeholder="120"
                      autoComplete="off"
                    />
                  </label>

                  <label className="integration-field">
                    <span>Post impressions</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={linkedinMetrics.postImpressions}
                      onChange={(event) => handleLinkedinMetricChange("postImpressions", event.target.value)}
                      onKeyDown={handleLinkedinKeyDown}
                      placeholder="2500"
                      autoComplete="off"
                    />
                  </label>
                </div>
              )}

              {isConnected && item.key === "github" ? (
                githubLoading ? (
                  <p className="integration-points" style={{ opacity: 0.7 }}>Loading GitHub data...</p>
                ) : githubData ? (
                  <ul className="integration-points">
                    <li>{githubData.followers} Followers</li>
                    <li>{githubData.repositories} Repositories</li>
                  </ul>
                ) : (
                  <ul className="integration-points">
                    <li style={{ color: "#ff7a59" }}>Failed to load data (Check GITHUB_TOKEN in backend/.env)</li>
                  </ul>
                )
              ) : isConnected && item.key === "leetcode" ? (
                leetcodeLoading ? (
                  <p className="integration-points" style={{ opacity: 0.7 }}>Loading LeetCode data...</p>
                ) : leetcodeData ? (
                  <ul className="integration-points">
                    <li>{leetcodeData.totalSolved} Problems solved</li>
                    <li>Current streak: {leetcodeData.streak} days</li>
                  </ul>
                ) : (
                  <ul className="integration-points">
                    <li style={{ color: "#ff7a59" }}>Failed to load LeetCode data</li>
                  </ul>
                )
              ) : (
                <ul className="integration-points">
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}

              {item.key === "linkedin" ? (
                <>
                  <div className="integration-actions">
                    <button
                      type="button"
                      className="integration-primary-btn"
                      onClick={() => window.open("https://www.linkedin.com/in/", "_blank", "noopener,noreferrer")}
                    >
                      Open LinkedIn
                    </button>

                    <button
                      type="button"
                      className="integration-secondary-btn integration-enter-btn"
                      onClick={handleLinkedinEnter}
                    >
                      Enter
                    </button>
                  </div>

                  {isConnected && (
                    <div className="integration-disconnect-row">
                      <button
                        type="button"
                        className="integration-secondary-btn integration-disconnect-btn"
                        onClick={() => handleDisconnect(item.key)}
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="integration-actions">
                  {isConnected ? (
                    <a
                      href={
                        item.key === "github"
                          ? `https://github.com/${encodeURIComponent(githubUsername.trim())}`
                          : item.key === "leetcode"
                          ? `https://leetcode.com/u/${encodeURIComponent(leetcodeUsername.trim())}/`
                          : item.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="integration-primary-btn"
                      style={{ textDecoration: "none" }}
                    >
                      Open {item.label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="integration-primary-btn"
                      onClick={() => handleConnect(item)}
                    >
                      Connect {item.label}
                    </button>
                  )}

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
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Integrations

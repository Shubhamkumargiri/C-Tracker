import { useState, useEffect } from "react"
import "./Integrations.css"
import { apiRequest } from "../../lib/api"
import { getStoredUser, updateStoredUser } from "../../lib/auth"
import {
  getSavedGithubUsername,
  getSavedDevpostUsername,
  getSavedLeetcodeUsername,
  getSavedIntegrations,
  saveGithubUsername,
  saveDevpostUsername,
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
    key: "devpost",
    label: "Devpost",
    description: "Showcase software projects and hackathon prizes",
    url: "https://devpost.com/login",
    accent: "devpost",
    points: ["Projects built", "Hackathons entered", "Followers"],
  },
]

function Integrations() {
  const [connected, setConnected] = useState(() => getSavedIntegrations())
  const [githubUsername, setGithubUsername] = useState(() => getSavedGithubUsername())
  const [leetcodeUsername, setLeetcodeUsername] = useState(() => getSavedLeetcodeUsername())
  const [devpostUsername, setDevpostUsername] = useState(() => getSavedDevpostUsername())

  const [githubData, setGithubData] = useState(null)
  const [githubLoading, setGithubLoading] = useState(false)
  const [leetcodeData, setLeetcodeData] = useState(null)
  const [leetcodeLoading, setLeetcodeLoading] = useState(false)
  const [devpostData, setDevpostData] = useState(null)
  const [devpostLoading, setDevpostLoading] = useState(false)

  useEffect(() => {
    if (!connected.github || !githubUsername) {
      setGithubData(null)
      return
    }

    let ignore = false
    const timeoutId = setTimeout(() => {
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
    }, 800)
    
    return () => { 
      ignore = true
      clearTimeout(timeoutId) 
    }
  }, [connected.github, githubUsername])

  useEffect(() => {
    if (!connected.leetcode || !leetcodeUsername) {
      setLeetcodeData(null)
      return
    }

    let ignore = false
    const timeoutId = setTimeout(() => {
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
    }, 800)
    
    return () => { 
      ignore = true
      clearTimeout(timeoutId) 
    }
  }, [connected.leetcode, leetcodeUsername])

  useEffect(() => {
    if (!connected.devpost || !devpostUsername) {
      setDevpostData(null)
      return
    }

    let ignore = false
    const timeoutId = setTimeout(() => {
      async function loadDevpost() {
        setDevpostLoading(true)
        try {
          const data = await apiRequest(`/api/devpost/analytics/${encodeURIComponent(devpostUsername)}`)
          if (!ignore) setDevpostData(data)
        } catch (err) {
          if (!ignore) setDevpostData(null)
        } finally {
          if (!ignore) setDevpostLoading(false)
        }
      }
      loadDevpost()
    }, 800)
    
    return () => { 
      ignore = true
      clearTimeout(timeoutId) 
    }
  }, [connected.devpost, devpostUsername])



  const handleConnect = async (item) => {
    if (item.key === "github" && !githubUsername.trim()) {
      window.alert("Enter a GitHub username before connecting.")
      return
    }
    if (item.key === "leetcode" && !leetcodeUsername.trim()) {
      window.alert("Enter a LeetCode username before connecting.")
      return
    }
    if (item.key === "devpost" && !devpostUsername.trim()) {
      window.alert("Enter a Devpost username or profile link before connecting.")
      return
    }

    const username = item.key === "github" ? githubUsername.trim() : item.key === "leetcode" ? leetcodeUsername.trim() : devpostUsername.trim()

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
    if (item.key === "devpost") {
      saveDevpostUsername(devpostUsername)
      openUrl = `https://devpost.com/${encodeURIComponent(devpostUsername.trim())}`
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
    if (key === "devpost") {
      setDevpostUsername("")
      saveDevpostUsername("")
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
                <div className="integration-field">
                  <label htmlFor="github-input">GitHub username</label>
                  <input
                    id="github-input"
                    type="text"
                    value={githubUsername || ""}
                    onChange={(event) => setGithubUsername(event.target.value)}
                    placeholder="github_username"
                    autoComplete="off"
                    style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
                  />
                </div>
              )}

              {item.key === "leetcode" && (
                <div className="integration-field">
                  <label htmlFor="leetcode-input">LeetCode username</label>
                  <input
                    id="leetcode-input"
                    type="text"
                    value={leetcodeUsername || ""}
                    onChange={(event) => setLeetcodeUsername(event.target.value)}
                    placeholder="leetcode_username"
                    autoComplete="off"
                    style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
                  />
                </div>
              )}

              {item.key === "devpost" && (
                <div className="integration-field">
                  <label htmlFor="devpost-input">Devpost username</label>
                  <input
                    id="devpost-input"
                    type="text"
                    value={devpostUsername || ""}
                    onChange={(event) => setDevpostUsername(event.target.value)}
                    placeholder="devpost_username"
                    autoComplete="off"
                    style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
                  />
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
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
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
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )
              ) : isConnected && item.key === "devpost" ? (
                devpostLoading ? (
                  <p className="integration-points" style={{ opacity: 0.7 }}>Loading Devpost data...</p>
                ) : devpostData ? (
                  <ul className="integration-points">
                    <li>{devpostData.projects} Projects</li>
                    <li>{devpostData.hackathons} Hackathons</li>
                    <li>{devpostData.followers} Followers</li>
                  </ul>
                ) : (
                  <ul className="integration-points">
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )
              ) : (
                <ul className="integration-points">
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}

              <div className="integration-actions">
                  {isConnected ? (
                    <a
                      href={
                        item.key === "github"
                          ? `https://github.com/${encodeURIComponent(githubUsername.trim())}`
                          : item.key === "leetcode"
                          ? `https://leetcode.com/u/${encodeURIComponent(leetcodeUsername.trim())}/`
                          : item.key === "devpost"
                          ? (devpostUsername.includes("devpost.com") ? devpostUsername : `https://www.devpost.com/in/${encodeURIComponent(devpostUsername.trim())}/`)
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
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Integrations

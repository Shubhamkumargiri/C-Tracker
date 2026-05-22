import { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Dhome.css"
import { getStoredUser } from "../../lib/auth"
import { apiRequest } from "../../lib/api"
import { 
  countConnectedIntegrations, 
  getSavedIntegrations,
  getSavedGithubUsername,
  getSavedDevpostUsername,
  getSavedLeetcodeUsername,
} from "../../lib/integrations"

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

  const githubUsername = getSavedGithubUsername()
  const leetcodeUsername = getSavedLeetcodeUsername()
  const devpostUsername = getSavedDevpostUsername()

  const [githubAnalytics, setGithubAnalytics] = useState(null)
  const [leetcodeAnalytics, setLeetcodeAnalytics] = useState(null)
  const [devpostAnalytics, setDevpostAnalytics] = useState(null)

  useEffect(() => {
    if (integrations.github && githubUsername) {
      apiRequest(`/api/github/analytics/${encodeURIComponent(githubUsername)}`).then(setGithubAnalytics).catch(() => {})
    }
    if (integrations.leetcode && leetcodeUsername) {
      apiRequest(`/api/leetcode/analytics/${encodeURIComponent(leetcodeUsername)}`).then(setLeetcodeAnalytics).catch(() => {})
    }
    if (integrations.devpost && devpostUsername) {
      apiRequest(`/api/devpost/analytics/${encodeURIComponent(devpostUsername)}`).then(setDevpostAnalytics).catch(() => {})
    }
  }, [integrations, githubUsername, leetcodeUsername, devpostUsername])

  const leetcodeRealScore = leetcodeAnalytics ? Math.min(100, Math.floor((leetcodeAnalytics.totalSolved / 3) + (leetcodeAnalytics.streak * 2))) : 0;
  const githubRealScore = githubAnalytics ? Math.min(100, Math.floor((githubAnalytics.commits / 5) + (githubAnalytics.repositories * 5))) : 0;
  const devpostRealScore = devpostAnalytics ? Math.min(100, Math.floor((devpostAnalytics.projects * 25) + (devpostAnalytics.hackathons * 10))) : 0;

  const readinessScore = Math.min(100, Math.floor(
    (leetcodeRealScore * 0.35) + 
    (githubRealScore * 0.45) + 
    (devpostRealScore * 0.20)
  )) || 0;

  const consistencyScore = Math.min(100, Math.floor(
    (leetcodeAnalytics?.streak > 5 ? 40 : (leetcodeAnalytics?.streak * 8 || 0)) +
    (githubAnalytics?.commits > 50 ? 60 : (githubAnalytics?.commits || 0))
  )) || 0;

  const scoreCards = [
    { 
      label: "LeetCode solved", 
      value: leetcodeAnalytics?.totalSolved || "0", 
      note: leetcodeAnalytics ? `${leetcodeAnalytics.streak} day streak` : "Not connected", 
      accent: "pink" 
    },
    { 
      label: "GitHub commits", 
      value: githubAnalytics?.commits || "0", 
      note: githubAnalytics ? `${githubAnalytics.repositories} active repos` : "Not connected", 
      accent: "blue" 
    },
    { 
      label: "Devpost projects", 
      value: devpostAnalytics?.projects || "0", 
      note: devpostAnalytics ? `${devpostAnalytics.hackathons} hackathons` : "Not connected", 
      accent: "gold" 
    },
    { 
      label: "Consistency score", 
      value: `${consistencyScore}%`, 
      note: consistencyScore > 50 ? "Strong momentum" : "Needs momentum", 
      accent: "violet" 
    },
  ]

  const actionItems = []
  if (!integrations.github) actionItems.push("Connect your GitHub account")
  else if (githubAnalytics?.commits < 10) actionItems.push("Push a new commit to an active repository")

  if (!integrations.leetcode) actionItems.push("Connect your LeetCode account")
  else if (leetcodeAnalytics?.streak < 2) actionItems.push("Solve at least one LeetCode problem today")

  if (actionItems.length === 0) {
    actionItems.push("Update your resume using the Resume Builder")
    actionItems.push("Apply to one new opportunity this week")
    actionItems.push("Read an article on System Design")
  }

  const careerTools = useMemo(
    () => [
      {
        label: "ATS Resume Builder",
        value: "Generate a perfectly formatted resume instantly",
        cta: "Open Builder",
        onClick: () => navigate("/dashboard/resume"),
      },
      {
        label: "Cover Letter Generator",
        value: "AI-generated cover letters tailored to jobs",
        cta: "Coming Soon",
        onClick: () => {},
      },
      {
        label: "Interview Prep",
        value: "Mock interviews based on your tech stack",
        cta: "Coming Soon",
        onClick: () => {},
      },
    ],
    [navigate]
  )

  const profileChecklist = useMemo(
    () => [
      {
        title: "Developer Accounts",
        detail:
          connectedCount >= 3
            ? "All major platforms connected. Your analytics are fully powered."
            : "Connect GitHub, LeetCode, and Devpost for accurate predictions.",
        action: connectedCount >= 3 ? "Manage" : "Connect",
        onClick: () => navigate("/dashboard/integrations"),
        done: connectedCount >= 3,
      },
      {
        title: "Resume Readiness",
        detail: "Build and download your ATS-friendly resume to start applying.",
        action: "Build",
        onClick: () => navigate("/dashboard/resume"),
        done: false, // You could link this to a real state later
      },
      {
        title: "Profile Details",
        detail: profileReady ? "Your contact details are set up." : "Add your name, country, and phone number.",
        action: "Update",
        onClick: () => navigate("/dashboard/settings"),
        done: profileReady,
      },
    ],
    [connectedCount, navigate, profileReady]
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
            <strong>{readinessScore}%</strong>
          </div>

          <div className="meter">
            <div className="meter-fill" style={{ width: `${readinessScore}%` }}></div>
          </div>

          <p className="readiness-copy">
            {readinessScore > 75 
              ? "Your profile is highly competitive! Keep building and networking to secure strong roles." 
              : "Your profile is improving. Connect more accounts and stay consistent to boost your score."}
          </p>

          <div className="readiness-foot">
            <div>
              <small>Strength area</small>
              <strong>{consistencyScore > 60 ? "Consistency" : "Learning"}</strong>
            </div>

            <div>
              <small>Needs attention</small>
              <strong>{connectedCount < 3 ? "Integrations" : "Networking"}</strong>
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
              {githubAnalytics?.commits > 50 ? <li>High GitHub commit volume</li> : <li>Building foundational code skills</li>}
              {leetcodeAnalytics?.totalSolved > 50 ? <li>Solid problem-solving baseline</li> : <li>Working on algorithmic thinking</li>}
              {devpostAnalytics?.projects > 0 ? <li>Demonstrated hackathon capability</li> : <li>Expanding project portfolio</li>}
            </ul>

            <p className="insight-title">Improve next</p>
            <ul>
              {!integrations.leetcode ? <li>Connect LeetCode to track problem-solving</li> : <li>Practice more Medium-level questions</li>}
              {!integrations.devpost ? <li>Join a Devpost hackathon for real-world XP</li> : <li>Showcase clear project outcomes</li>}
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
            <span>Career tools</span>
            <h2>Accelerate your job search</h2>
          </div>

          <div className="quick-list">
            {careerTools.map((item) => (
              <button key={item.label} type="button" className="quick-item" onClick={item.onClick} style={{ opacity: item.cta === "Coming Soon" ? 0.6 : 1, cursor: item.cta === "Coming Soon" ? "default" : "pointer" }}>
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
            <span>Profile readiness</span>
            <h2>Application checklist</h2>
          </div>

          <div className="recent-list">
            {profileChecklist.map((item) => (
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

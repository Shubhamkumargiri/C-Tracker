import { useMemo } from "react"
import "./Analytics.css"

const INTEGRATIONS_KEY = "dashboard-integrations"

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

function Analytics() {
  const integrations = getSavedIntegrations()

  const connectedCount = useMemo(() => {
    return Object.values(integrations).filter(Boolean).length
  }, [integrations])

  const leetcodeConnected = Boolean(integrations.leetcode)
  const githubConnected = Boolean(integrations.github)
  const linkedinConnected = Boolean(integrations.linkedin)

  const readinessScore = 52 + connectedCount * 14
  const interviewScore = 48 + connectedCount * 12

  const metricCards = [
    {
      label: "Connected platforms",
      value: `${connectedCount}/3`,
      note: connectedCount === 3 ? "Full career data coverage" : "Connect more accounts for better insights",
    },
    {
      label: "Readiness score",
      value: `${readinessScore}%`,
      note: "Built from coding, visibility, and consistency signals",
    },
    {
      label: "Interview probability",
      value: `${interviewScore}%`,
      note: "Improves as more verified activity is tracked",
    },
  ]

  const sourceCards = [
    {
      title: "LeetCode Progress",
      connected: leetcodeConnected,
      progress: leetcodeConnected ? 74 : 0,
      rows: [
        { label: "Easy solved", value: "120" },
        { label: "Medium solved", value: "160" },
        { label: "Hard solved", value: "40" },
      ],
    },
    {
      title: "GitHub Activity",
      connected: githubConnected,
      progress: githubConnected ? 82 : 0,
      rows: [
        { label: "Commits this month", value: "95" },
        { label: "Repositories", value: "12" },
        { label: "Pull requests", value: "18" },
      ],
    },
    {
      title: "LinkedIn Reach",
      connected: linkedinConnected,
      progress: linkedinConnected ? 68 : 0,
      rows: [
        { label: "Profile views", value: "540" },
        { label: "Connection growth", value: "+32" },
        { label: "Recruiter visibility", value: "High" },
      ],
    },
  ]

  const predictionSeries = [
    42 + connectedCount * 4,
    51 + connectedCount * 5,
    58 + connectedCount * 6,
    66 + connectedCount * 6,
    73 + connectedCount * 7,
    81 + connectedCount * 7,
  ]

  const predictionLabels = ["Now", "2 w", "4 w", "6 w", "8 w", "10 w"]

  const chartPoints = predictionSeries
    .map((value, index) => {
      const x = 28 + index * 112
      const y = 190 - value * 1.45
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <span className="analytics-kicker">Analytics</span>
          <h1>Developer Analytics</h1>
          <p>
            Track the signals coming from your connected accounts and see where your profile is gaining momentum.
          </p>
        </div>

        <div className="analytics-summary-card">
          <span>Coverage</span>
          <strong>{connectedCount === 0 ? "Low" : connectedCount === 3 ? "Strong" : "Growing"}</strong>
          <p>
            {connectedCount === 0
              ? "Connect at least one platform to unlock better insights."
              : `You are tracking ${connectedCount} platform${connectedCount > 1 ? "s" : ""} right now.`}
          </p>
        </div>
      </div>

      <section className="analytics-metric-grid">
        {metricCards.map((card) => (
          <article key={card.label} className="analytics-metric-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.note}</p>
          </article>
        ))}
      </section>

      <section className="analytics-grid">
        {sourceCards.map((card) => (
          <article key={card.title} className={`analytics-card${card.connected ? " connected" : ""}`}>
            <div className="analytics-card-head">
              <div className="analytics-card-heading">
                <h3>{card.title}</h3>
                <span className={`analytics-badge${card.connected ? " connected" : ""}`}>
                  {card.connected ? "Connected" : "Disconnected"}
                </span>
              </div>

              <div
                className="analytics-circle"
                style={{ "--circle-progress": `${card.progress}%` }}
                aria-label={`${card.title} progress ${card.progress}%`}
              >
                <div className="analytics-circle-inner">
                  <strong>{card.progress}%</strong>
                </div>
              </div>
            </div>

            {card.connected ? (
              <div className="analytics-rows">
                {card.rows.map((row) => (
                  <div key={row.label} className="analytics-row">
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="analytics-empty">
                Connect this platform from the Integrations tab to pull this analytics block into your dashboard flow.
              </p>
            )}
          </article>
        ))}
      </section>

      <section className="analytics-prediction-card">
        <div className="analytics-section-heading">
          <span>AI prediction</span>
          <h2>Overall growth projection</h2>
          <p>
            This forecast combines your current connected platforms and momentum signals to estimate how your profile could strengthen over the next 10 weeks.
          </p>
        </div>

        <div className="analytics-prediction-graph">
          <svg viewBox="0 0 620 220" className="prediction-svg" aria-label="AI prediction graph">
            <defs>
              <linearGradient id="predictionLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--dashboard-accent-deep)" />
                <stop offset="100%" stopColor="var(--dashboard-accent)" />
              </linearGradient>
            </defs>

            <line x1="24" y1="190" x2="596" y2="190" className="prediction-axis" />
            <line x1="24" y1="36" x2="24" y2="190" className="prediction-axis" />

            <polyline
              fill="none"
              stroke="url(#predictionLine)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={chartPoints}
            />

            {predictionSeries.map((value, index) => {
              const x = 28 + index * 112
              const y = 190 - value * 1.45

              return (
                <g key={predictionLabels[index]}>
                  <circle cx={x} cy={y} r="7" className="prediction-point" />
                  <text x={x} y={y - 16} textAnchor="middle" className="prediction-value">
                    {value}%
                  </text>
                  <text x={x} y="210" textAnchor="middle" className="prediction-label">
                    {predictionLabels[index]}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </section>
    </div>
  )
}

export default Analytics

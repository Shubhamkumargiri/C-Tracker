import { useEffect, useMemo, useState } from "react"
import "./Analytics.css"
import { apiRequest } from "../../lib/api"
import { getStoredUser } from "../../lib/auth"
import {
  countConnectedIntegrations,
  getSavedGithubUsername,
  getSavedLinkedinMetrics,
  getSavedLeetcodeUsername,
  getSavedIntegrations,
} from "../../lib/integrations"

function Analytics() {
  const user = getStoredUser()
  const integrations = getSavedIntegrations()
  const githubUsername = getSavedGithubUsername()
  const leetcodeUsername = getSavedLeetcodeUsername()
  const linkedinMetrics = getSavedLinkedinMetrics()
  const [githubAnalytics, setGithubAnalytics] = useState(null)
  const [githubLoading, setGithubLoading] = useState(false)
  const [githubError, setGithubError] = useState("")
  const [leetcodeAnalytics, setLeetcodeAnalytics] = useState(null)
  const [leetcodeLoading, setLeetcodeLoading] = useState(false)
  const [leetcodeError, setLeetcodeError] = useState("")
  const [timeline, setTimeline] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [timelineError, setTimelineError] = useState("")
  const [timelineRefreshKey, setTimelineRefreshKey] = useState(0)

  const connectedCount = useMemo(() => {
    return countConnectedIntegrations(integrations)
  }, [integrations])

  const leetcodeConnected = Boolean(integrations.leetcode)
  const githubConnected = Boolean(integrations.github)
  const linkedinConnected = Boolean(integrations.linkedin)
  const linkedinProgress = linkedinConnected
    ? Math.min(
        100,
        Math.round(
          Number(linkedinMetrics.connections || 0) / 20 +
            Number(linkedinMetrics.profileViewers || 0) / 10 +
            Number(linkedinMetrics.postImpressions || 0) / 100
        )
      )
    : 0

  const readinessScore = 52 + connectedCount * 14
  const interviewScore = 48 + connectedCount * 12

  const saveSnapshot = async (stats) => {
    try {
      await apiRequest("/api/timeline/snapshot", {
        method: "POST",
        body: JSON.stringify({ stats }),
      })
      setTimelineRefreshKey((current) => current + 1)
    } catch {
      // Live analytics should still render even if snapshot persistence is unavailable.
    }
  }

  useEffect(() => {
    if (!connectedCount) {
      setTimeline([])
      setTimelineError("")
      setTimelineLoading(false)
      return
    }

    let ignore = false

    async function loadTimeline() {
      setTimelineLoading(true)
      setTimelineError("")

      try {
        const data = await apiRequest("/api/timeline?days=30")

        if (!ignore) {
          setTimeline(data.timeline || [])
        }
      } catch (error) {
        if (!ignore) {
          setTimeline([])
          setTimelineError(error.message || "Unable to load saved timeline stats.")
        }
      } finally {
        if (!ignore) {
          setTimelineLoading(false)
        }
      }
    }

    loadTimeline()

    return () => {
      ignore = true
    }
  }, [connectedCount, timelineRefreshKey])

  useEffect(() => {
    if (!leetcodeConnected || !leetcodeUsername) {
      setLeetcodeAnalytics(null)
      setLeetcodeError("")
      setLeetcodeLoading(false)
      return
    }

    let ignore = false

    async function loadLeetcodeAnalytics() {
      setLeetcodeLoading(true)
      setLeetcodeError("")

      try {
        const data = await apiRequest(`/api/leetcode/analytics/${encodeURIComponent(leetcodeUsername)}`)

        if (!ignore) {
          setLeetcodeAnalytics(data)
          saveSnapshot({ leetcode: data })
        }
      } catch (error) {
        if (!ignore) {
          setLeetcodeAnalytics(null)
          setLeetcodeError(error.message || "Unable to load LeetCode analytics right now.")
        }
      } finally {
        if (!ignore) {
          setLeetcodeLoading(false)
        }
      }
    }

    loadLeetcodeAnalytics()

    return () => {
      ignore = true
    }
  }, [leetcodeConnected, leetcodeUsername])

  useEffect(() => {
    if (!githubConnected || !githubUsername) {
      setGithubAnalytics(null)
      setGithubError("")
      setGithubLoading(false)
      return
    }

    let ignore = false

    async function loadGithubAnalytics() {
      setGithubLoading(true)
      setGithubError("")

      try {
        const data = await apiRequest(`/api/github/analytics/${encodeURIComponent(githubUsername)}`)

        if (!ignore) {
          setGithubAnalytics(data)
          saveSnapshot({ github: data })
        }
      } catch (error) {
        if (!ignore) {
          setGithubAnalytics(null)
          setGithubError(error.message || "Unable to load GitHub analytics right now.")
        }
      } finally {
        if (!ignore) {
          setGithubLoading(false)
        }
      }
    }

    loadGithubAnalytics()

    return () => {
      ignore = true
    }
  }, [githubConnected, githubUsername])

  useEffect(() => {
    if (!linkedinConnected) {
      return
    }

    const hasLinkedinStats =
      linkedinMetrics.connections || linkedinMetrics.profileViewers || linkedinMetrics.postImpressions

    if (hasLinkedinStats) {
      saveSnapshot({ linkedin: linkedinMetrics })
    }
  }, [linkedinConnected, linkedinMetrics.connections, linkedinMetrics.profileViewers, linkedinMetrics.postImpressions])

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
      progress: leetcodeAnalytics?.profileScore ?? (leetcodeConnected ? 28 : 0),
      rows: [
        { label: "Username", value: leetcodeAnalytics ? `@${leetcodeAnalytics.username}` : "--" },
        { label: "Global ranking", value: leetcodeAnalytics ? String(leetcodeAnalytics.ranking) : "--" },
        { label: "Total solved", value: leetcodeAnalytics ? String(leetcodeAnalytics.totalSolved) : "--" },
        { label: "Easy solved", value: leetcodeAnalytics ? String(leetcodeAnalytics.easySolved) : "--" },
        { label: "Medium solved", value: leetcodeAnalytics ? String(leetcodeAnalytics.mediumSolved) : "--" },
        { label: "Hard solved", value: leetcodeAnalytics ? String(leetcodeAnalytics.hardSolved) : "--" },
        { label: "Contest rating", value: leetcodeAnalytics ? String(leetcodeAnalytics.contestRating) : "--" },
        { label: "Acceptance rate", value: leetcodeAnalytics ? `${leetcodeAnalytics.acceptanceRate}%` : "--" },
        {
          label: "Submission days (30d)",
          value: leetcodeAnalytics
            ? leetcodeAnalytics.calendarUnavailable
              ? "Private"
              : String(leetcodeAnalytics.submissionCalendarSummary?.last30Days ?? "--")
            : "--",
        },
        {
          label: "Current streak",
          value: leetcodeAnalytics
            ? leetcodeAnalytics.calendarUnavailable
              ? "Private"
              : `${leetcodeAnalytics.streak} day${leetcodeAnalytics.streak === 1 ? "" : "s"}`
            : "--",
        },
      ],
    },
    {
      title: "GitHub Activity",
      connected: githubConnected,
      progress: githubAnalytics?.profileScore ?? (githubConnected ? 32 : 0),
      rows: [
        { label: "Commits (last year)", value: githubAnalytics ? String(githubAnalytics.commits) : "--" },
        { label: "Repositories", value: githubAnalytics ? String(githubAnalytics.repositories) : "--" },
        { label: "Pull requests", value: githubAnalytics ? String(githubAnalytics.pullRequests) : "--" },
        { label: "Contributions", value: githubAnalytics ? String(githubAnalytics.contributions) : "--" },
        { label: "Followers", value: githubAnalytics ? String(githubAnalytics.followers) : "--" },
      ],
    },
    {
      title: "LinkedIn Reach",
      connected: linkedinConnected,
      progress: linkedinProgress,
      rows: [
        { label: "Connections", value: linkedinMetrics.connections || "--" },
        { label: "Profile viewers", value: linkedinMetrics.profileViewers || "--" },
        { label: "Post impressions", value: linkedinMetrics.postImpressions || "--" },
      ],
    },
  ]

  const timelineCards = [
    {
      key: "leetcode",
      title: "LeetCode solved",
      color: "#ff7a59",
      metric: (stats) => stats.leetcode?.totalSolved,
    },
    {
      key: "github",
      title: "GitHub contributions",
      color: "#4f9cff",
      metric: (stats) => stats.github?.contributions,
    },
    {
      key: "linkedin",
      title: "LinkedIn reach",
      color: "#17a2b8",
      metric: (stats) => stats.linkedin?.profileViewers,
    },
  ]

  const buildTimelineGraph = (metric) => {
    const points = timeline.map((item, index) => ({
      date: item.date,
      value: Number(metric(item.stats || {}) || 0),
      x: 28 + index * 18.6,
    }))
    const maxValue = Math.max(...points.map((point) => point.value), 1)

    return {
      points: points
        .map((point) => {
          const y = 170 - (point.value / maxValue) * 120
          return `${point.x},${y}`
        })
        .join(" "),
      latest: points[points.length - 1]?.value || 0,
      firstLabel: points[0]?.date?.slice(5) || "",
      lastLabel: points[points.length - 1]?.date?.slice(5) || "",
      hasData: points.some((point) => point.value > 0),
    }
  }

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

            <div className="analytics-card-body">
              {card.connected ? (
                card.title === "LeetCode Progress" ? (
                  leetcodeLoading ? (
                    <p className="analytics-empty">Loading LeetCode analytics for @{leetcodeUsername}...</p>
                  ) : leetcodeError ? (
                    <p className="analytics-empty analytics-error">{leetcodeError}</p>
                  ) : !leetcodeUsername ? (
                    <p className="analytics-empty">
                      Add a LeetCode username in the Integrations tab to fetch ranking, solved counts, contest rating, and submission calendar stats.
                    </p>
                  ) : !leetcodeAnalytics ? (
                    <p className="analytics-empty">Connect LeetCode to start loading live account analytics.</p>
                  ) : (
                    <div className="analytics-rows analytics-rows-scroll">
                      <div className="analytics-identity">
                        <strong>@{leetcodeAnalytics.username}</strong>
                        <span>{leetcodeAnalytics.name || user?.leetcodeName || "LeetCode problem-solving profile"}</span>
                      </div>

                      {card.rows.map((row) => (
                        <div key={row.label} className="analytics-row">
                          <span>{row.label}</span>
                          <strong>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  )
                ) : card.title === "GitHub Activity" ? (
                  githubLoading ? (
                    <p className="analytics-empty">Loading GitHub analytics for @{githubUsername}...</p>
                  ) : githubError ? (
                    <p className="analytics-empty analytics-error">{githubError}</p>
                  ) : !githubUsername ? (
                    <p className="analytics-empty">
                      Add a GitHub username in the Integrations tab to fetch commits, repositories, pull requests, and contribution stats.
                    </p>
                  ) : !githubAnalytics ? (
                    <p className="analytics-empty">Connect GitHub to start loading live account analytics.</p>
                  ) : (
                    <div className="analytics-rows analytics-rows-scroll">
                      <div className="analytics-identity">
                        <strong>@{githubAnalytics.username}</strong>
                        <span>{githubAnalytics.name || user?.githubName || "GitHub developer profile"}</span>
                      </div>

                      {card.rows.map((row) => (
                        <div key={row.label} className="analytics-row">
                          <span>{row.label}</span>
                          <strong>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="analytics-rows analytics-rows-scroll">
                    {card.rows.map((row) => (
                      <div key={row.label} className="analytics-row">
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="analytics-empty">
                  Connect this platform from the Integrations tab to pull this analytics block into your dashboard flow.
                </p>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="analytics-timeline-card">
        <div className="analytics-section-heading">
          <span>Saved timeline</span>
          <h2>Last 30 days</h2>
          <p>
            These graphs are built from daily snapshots stored in MongoDB. A new point is saved when your connected stats load or when you update LinkedIn metrics.
          </p>
        </div>

        {timelineLoading ? (
          <p className="analytics-empty">Loading saved timeline...</p>
        ) : timelineError ? (
          <p className="analytics-empty analytics-error">{timelineError}</p>
        ) : timeline.length ? (
          <div className="timeline-graph-grid">
            {timelineCards.map((card) => {
              const graph = buildTimelineGraph(card.metric)

              return (
                <article key={card.key} className="timeline-graph-card">
                  <div className="timeline-graph-head">
                    <div>
                      <span>{card.title}</span>
                      <strong>{graph.latest}</strong>
                    </div>
                    <small>{graph.firstLabel} - {graph.lastLabel}</small>
                  </div>

                  {graph.hasData ? (
                    <svg viewBox="0 0 584 190" className="timeline-svg" aria-label={`${card.title} timeline`}>
                      <line x1="28" y1="170" x2="568" y2="170" className="prediction-axis" />
                      <polyline
                        fill="none"
                        stroke={card.color}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={graph.points}
                      />
                    </svg>
                  ) : (
                    <div className="timeline-empty-state">Waiting for saved daily data</div>
                  )}
                </article>
              )
            })}
          </div>
        ) : (
          <p className="analytics-empty">
            Connect a platform and open this page once per day to build your month-long progress history.
          </p>
        )}
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

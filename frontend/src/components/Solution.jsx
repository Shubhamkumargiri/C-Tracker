import "./Solution.css"

function Solution() {
  return (
    <section className="solution">

      <h2>The CAREER <span>TRACKER</span></h2>

      <p className="solution-subtext">
        Career Tracker connects your coding and professional platforms
        to track your consistency, analyze your progress, and predict
        your career readiness using intelligent analytics.
      </p>

      <div className="solution-cards">

        <div className="solution-card">
          <h3>Track Your Platforms</h3>
          <p>
            Connect your LeetCode, GitHub, and LinkedIn profiles
            to monitor real progress across your developer journey.
          </p>
        </div>

        <div className="solution-card">
          <h3>AI Career Score</h3>
          <p>
            Career  Tracker calculates your career readiness score
            based on coding consistency, projects, and activity.
          </p>
        </div>

        <div className="solution-card">
          <h3>Consistency Monitoring</h3>
          <p>
            Maintain streaks and daily progress to increase
            your chances of landing top tech jobs.
          </p>
        </div>

      </div>

    </section>
  )
}

export default Solution
import "./Integrations.css"

function Integrations() {
  return (
    <section className="integrations">

      <h2>Connect Your Career Platforms</h2>

      <p className="integration-subtext">
        Career Tracker integrates with the platforms that define
        your engineering journey.
      </p>

      <div className="integration-cards">

        <div className="integration-card integration-card-leetcode">
          <div className="integration-badge">LC</div>
          <h3>LeetCode</h3>
          <p>
            Track solved problems, difficulty levels,
            and coding consistency.
          </p>
        </div>

        <div className="integration-card integration-card-github">
          <div className="integration-badge">GH</div>
          <h3>GitHub</h3>
          <p>
            Monitor contributions, commits,
            and project development.
          </p>
        </div>

        <div className="integration-card integration-card-linkedin">
          <div className="integration-badge">IN</div>
          <h3>LinkedIn</h3>
          <p>
            Analyze profile activity,
            connections, and professional growth.
          </p>
        </div>

      </div>

    </section>
  )
}

export default Integrations

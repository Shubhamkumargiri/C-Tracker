import "./Problem.css"

function Problem() {
  return (
    <section className="problem">

      <h2>The Problem Engineering Students Face</h2>

      <div className="problem-cards">

        <div className="problem-card">
          <h3>No Clear Progress Tracking</h3>
          <p>
            Students solve problems on LeetCode or build projects
            on GitHub but have no clear way to measure real career growth.
          </p>
        </div>

        <div className="problem-card">
          <h3>Inconsistent Practice</h3>
          <p>
            Many start strong but lose consistency.
            Without tracking streaks and habits, progress drops quickly.
          </p>
        </div>

        <div className="problem-card">
          <h3>No Job Readiness Indicator</h3>
          <p>
            Students don't know if they are actually ready for
            placements or top tech companies.
          </p>
        </div>

      </div>

    </section>
  )
}

export default Problem
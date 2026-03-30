import "./CareerPrediction.css"

function CareerPrediction() {
  return (
    <section className="career">

      <h2>AI Career Prediction Engine</h2>

      <p className="career-subtext">
        Career Tracker analyzes your coding activity, projects,
        and professional presence to estimate your job readiness.
      </p>

      <div className="career-cards">

        <div className="career-card">
          <h3>Consistency Score</h3>
          <p>
            Measures how regularly you solve coding problems
            and contribute to projects.
          </p>
        </div>

        <div className="career-card">
          <h3>Skill Growth</h3>
          <p>
            Tracks difficulty progression from easy
            problems to advanced algorithm challenges.
          </p>
        </div>

        <div className="career-card">
          <h3>Job Readiness</h3>
          <p>
            AI predicts your readiness level
            for software engineering roles.
          </p>
        </div>

      </div>

    </section>
  )
}

export default CareerPrediction
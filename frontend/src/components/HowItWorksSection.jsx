import "./HowItWorksSection.css"

function HowItWorksSection() {
  return (
    <section className="how" id="how-it-works">

      <h2>How CAREER  <span>TRACKER</span> Works</h2>

      <div className="how-container">

        <div className="how-card">
          <div className="step">1</div>
          <h3>Connect Profiles</h3>
          <p>
            Link your LeetCode, GitHub, and LinkedIn accounts
            so NeuroMirror can track your activity.
          </p>
        </div>

        <div className="how-card">
          <div className="step">2</div>
          <h3>AI Analyzes Progress</h3>
          <p>
            Our AI evaluates your coding consistency,
            projects, and professional growth.
          </p>
        </div>

        <div className="how-card">
          <div className="step">3</div>
          <h3>Career Prediction</h3>
          <p>
            Get a real-time career readiness score
            and insights to improve your chances.
          </p>
        </div>

      </div>

    </section>
  )
}

export default HowItWorksSection

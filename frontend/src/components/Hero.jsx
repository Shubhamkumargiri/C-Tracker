import "./Hero.css"
import { Link } from "react-router-dom"

function Hero() {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="hero">
      <div className="hero-content">

        <h1>
          Track Your <span className="span">Effort.</span><br />
          <span className="span">Predict Your</span> Career.
        </h1>

        <p>
          Connect your LeetCode, GitHub, and LinkedIn profiles.
          Career Tracker AI analyzes your consistency and predicts
          your chances of landing top tech jobs.
        </p>

        <div className="hero-buttons">
          <Link to="/signup" className="btn-primary">Get Started</Link>
          <button className="btn-secondary" onClick={scrollToHowItWorks}>See How It Works</button>
        </div>

      </div>
    </section>
  )
}

export default Hero

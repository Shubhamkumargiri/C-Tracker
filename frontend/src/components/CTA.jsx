import "./CTA.css"
import { Link } from "react-router-dom"
import { getToken } from "../lib/auth"

function CTA(){
  const dashboardPath = getToken() ? "/dashboard" : "/login"

  return(

    <section className="cta">

      <h2>Start <span>Tracking </span>Your <span>Coding Journey</span> Today</h2>

      <p>
        Connect your GitHub, LeetCode and LinkedIn to unlock your
        AI-powered career insights.
      </p>

      <div className="cta-buttons">

        <Link to="/signup" className="cta-primary">
          Get Started Free
        </Link>

        <Link to={dashboardPath} className="cta-secondary">
          View Dashboard Demo
        </Link>

      </div>

    </section>

  )
}

export default CTA

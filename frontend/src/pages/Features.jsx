import "./Features.css"
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Features(){

  return(
    <>
            <Navbar/>
            <div className="features-page">

            {/* HERO */}

            <section className="features-hero">

                <h1>Powerful Features for <span>Developer Growth</span></h1>

                <p>
                CareerTracker analyzes your coding activity and professional
                footprint to deliver AI-powered career insights.
                </p>

            </section>

            {/* CORE FEATURES */}

            <section className="features-grid">

                <div className="feature-card">
                <h3>AI Career Prediction</h3>
                <p>
                    Our AI analyzes your coding consistency and projects to
                    estimate your career readiness.
                </p>
                </div>

                <div className="feature-card">
                <h3>Coding Activity Tracker</h3>
                <p>
                    Track your coding progress across platforms and visualize
                    your daily performance.
                </p>
                </div>

                <div className="feature-card">
                <h3>GitHub Repository Analysis</h3>
                <p>
                    Evaluate your project quality, commit activity,
                    and contribution patterns.
                </p>
                </div>

                <div className="feature-card">
                <h3>LeetCode Performance Insights</h3>
                <p>
                    Understand your algorithm strength and progress
                    through difficulty levels.
                </p>
                </div>

                <div className="feature-card">
                <h3>Career Readiness Score</h3>
                <p>
                    Get a real-time score representing how ready
                    you are for software engineering roles.
                </p>
                </div>

                <div className="feature-card">
                <h3>Weekly Progress Reports</h3>
                <p>
                    Receive weekly insights and actionable tips
                    to accelerate your growth.
                </p>
                </div>

            </section>

            {/* AI SECTION */}

            <section className="ai-section">

                <h2>AI-Powered Career Intelligence</h2>

                <p>
                CareerTracker uses machine learning models to analyze
                coding patterns, repository activity, and professional
                signals to guide developers toward their career goals.
                </p>

            </section>

            {/* INTEGRATIONS */}

            <section className="integrations">

                <h2>Seamless Integrations</h2>

                <div className="integration-grid">

                <div className="integration-card">GitHub</div>

                <div className="integration-card">LeetCode</div>

                <div className="integration-card">Devpost</div>

                </div>

            </section>

            {/* CTA */}

            <section className="features-cta">

                <h2>Start Tracking Your Developer Growth</h2>

                <Link to="/signup">Get Started Free</Link>

            </section>

            </div>
    </>

  )

}

export default Features

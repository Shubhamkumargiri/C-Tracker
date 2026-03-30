import "./About.css"
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";


function About(){

  return(
<>
    <Navbar />
    
    <div className="about-page">

      {/* HERO */}

      <section className="about-hero">

        <h1>About Career <span>Tracker</span></h1>

        <p>
          Career Tracker helps developers understand their career
          growth using AI-powered insights.
        </p>

      </section>


      {/* VISION */}

      <section className="vision">

        <h2>Our Vision</h2>

        <p>
          We believe developers should have clear visibility
          into their progress. NeuroMirror acts like a mirror
          for your coding journey.
        </p>

      </section>


      {/* PHILOSOPHY */}

      <section className="philosophy">

        <h2>Our Philosophy</h2>

        <div className="philosophy-grid">

          <div className="philo-card">
            <h3>Consistency</h3>
            <p>Small daily coding progress builds strong engineers.</p>
          </div>

          <div className="philo-card">
            <h3>AI Guidance</h3>
            <p>Machine intelligence helps developers grow faster.</p>
          </div>

          <div className="philo-card">
            <h3>Data Transparency</h3>
            <p>Your real coding activity should define your growth.</p>
          </div>

        </div>

      </section>


      {/* FAQ */}

      <section className="faq">

        <h2>Frequently Asked Questions</h2>

        <div className="faq-item">

          <h4>What is NeuroMirror?</h4>

          <p>
            NeuroMirror is an AI-powered platform that analyzes
            your coding activity and gives career insights.
          </p>

        </div>


        <div className="faq-item">

          <h4>Which platforms can I connect?</h4>

          <p>
            You can connect GitHub, LeetCode, and LinkedIn
            to track your developer progress.
          </p>

        </div>


        <div className="faq-item">

          <h4>Is NeuroMirror free?</h4>

          <p>
            Yes, we offer a free plan with basic analytics,
            and premium plans for advanced insights.
          </p>

        </div>


        <div className="faq-item">

          <h4>How does the AI prediction work?</h4>

          <p>
            Our AI evaluates coding consistency, project
            complexity, and algorithm performance to estimate
            career readiness.
          </p>

        </div>

      </section>


      {/* CTA */}

      <section className="about-cta">

        <h2>Start Your Developer Growth Journey</h2>

        <Link to="/signup">Get Started Free</Link>

      </section>

    </div>
    
</>

  )

}

export default About

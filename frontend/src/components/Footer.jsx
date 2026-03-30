import "./Footer.css"
import { Link } from "react-router-dom"

function Footer(){
  return(

    <footer className="footer">

      <div className="footer-container">

        <div className="footer-brand">
          <h2>Career <span>Tracker</span></h2>
          <p>
            AI powered career tracker for developers.
            Track your coding journey and grow faster.
          </p>
        </div>

        <div className="footer-links">
          <h3>Product</h3>
          <Link to="/features">Features</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/features">Integrations</Link>
        </div>

        <div className="footer-links">
          <h3>Company</h3>
          <Link to="/about">About</Link>
          <Link to="/contact">Blog</Link>
          <Link to="/contact">Careers</Link>
        </div>

        <div className="footer-links">
          <h3>Social</h3>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 Career Tracker. All rights reserved.</p>
      </div>

    </footer>

  )
}

export default Footer

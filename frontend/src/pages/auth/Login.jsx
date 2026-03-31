import "./Login.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { apiRequest } from "../../lib/api"
import { setAuthSession } from "../../lib/auth"

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    setError("")
    setIsSubmitting(true)

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      })

      setAuthSession(data)
      navigate("/dashboard")
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <Link to="/" className="auth-back">
        <span aria-hidden="true">&larr;</span> Back
      </Link>

      <div className="login-card">
        <h1>Welcome Back</h1>

        <p>
          Login to continue your Career <span className="brand-tracker">Tracker</span> journey
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="auth-row">
            <Link to="/forgot-password" className="auth-inline-link">
              Forgot password?
            </Link>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login

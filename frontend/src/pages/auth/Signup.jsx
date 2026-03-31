import "./Signup.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { apiRequest } from "../../lib/api"
import { setAuthSession } from "../../lib/auth"

const PASSWORD_RULES_MESSAGE =
  "Use at least 8 characters with 1 uppercase letter and 1 number. Special characters are optional."

const isStrongPassword = (password) =>
  /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)

function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isStrongPassword(formData.password)) {
      setError(PASSWORD_RULES_MESSAGE)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
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
    <div className="signup-page">
      <Link to="/" className="auth-back">
        <span aria-hidden="true">&larr;</span> Back
      </Link>

      <div className="signup-card">
        <h1>Create Account</h1>

        <p>
          Start tracking your developer journey with <span id="a">Career</span>
          <span id="b">Tracker</span>
        </p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

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
            minLength={8}
            required
          />

          <p className="password-hint">{PASSWORD_RULES_MESSAGE}</p>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account? <Link to="/login">login</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup

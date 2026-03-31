import "./ForgotPassword.css"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiRequest } from "../../lib/api"

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      const data = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      })

      setSuccess(data.message)
      setTimeout(() => {
        navigate("/reset-password", { state: { email } })
      }, 900)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="forgot-page">
      <Link to="/login" className="auth-back">
        <span aria-hidden="true">&larr;</span> Back
      </Link>

      <div className="forgot-card">
        <h1>Forgot Password</h1>
        <p>Enter your email to receive a one-time OTP for password reset.</p>

        <form className="forgot-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="forgot-footer">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword

import "./ResetPassword.css"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { apiRequest } from "../../lib/api"

const PASSWORD_RULES_MESSAGE =
  "Use at least 8 characters with 1 uppercase letter and 1 number. Special characters are optional."

const isStrongPassword = (password) =>
  /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)

function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || "")
  const [otp, setOtp] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [otpSuccess, setOtpSuccess] = useState("")
  const [resetSuccess, setResetSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVerifyOtp = async (e) => {
    e.preventDefault()

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP sent to your email")
      return
    }

    setError("")
    setOtpSuccess("")
    setResetSuccess("")
    setIsSubmitting(true)

    try {
      const data = await apiRequest("/api/auth/verify-reset-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      })

      setResetToken(data.resetToken)
      setOtpSuccess(data.message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((current) => ({ ...current, [name]: value }))
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!isStrongPassword(passwordData.password)) {
      setError(PASSWORD_RULES_MESSAGE)
      return
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setError("")
    setResetSuccess("")
    setIsSubmitting(true)

    try {
      const data = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          resetToken,
          password: passwordData.password,
        }),
      })

      setResetSuccess(data.message)
      setTimeout(() => navigate("/login"), 1200)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="reset-page">
      <Link to="/login" className="auth-back">
        <span aria-hidden="true">&larr;</span> Back
      </Link>

      {!resetToken ? (
        <div className="reset-card">
          <h1>Verify OTP</h1>
          <p>First verify the OTP sent to your email.</p>

          <form className="reset-form" onSubmit={handleVerifyOtp}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="text"
              name="otp"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              required
            />

            {error && <p className="auth-error">{error}</p>}
            {otpSuccess && <p className="auth-success">{otpSuccess}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </form>
        </div>
      ) : (
        <div className="reset-card">
          <h1>Set New Password</h1>
          <p>Your OTP is verified. Create a new password now.</p>

          <form className="reset-form" onSubmit={handleResetPassword}>
            <div className="reset-verified-panel">
              <span className="reset-verified-label">Verified email</span>
              <strong>{email}</strong>
            </div>

            <input
              type="password"
              name="password"
              placeholder="New Password"
              value={passwordData.password}
              onChange={handlePasswordChange}
              minLength={8}
              required
            />

            <p className="password-hint">{PASSWORD_RULES_MESSAGE}</p>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />

            {error && <p className="auth-error">{error}</p>}
            {resetSuccess && <p className="auth-success">{resetSuccess}. Redirecting to login...</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Resetting Password..." : "Set New Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ResetPassword

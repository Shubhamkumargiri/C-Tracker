import { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Settings.css"
import { clearAuthSession, getStoredUser, updateStoredUser } from "../../lib/auth"

const countriesList = [
  { name: "Afghanistan", code: "+93" }, { name: "Albania", code: "+355" }, { name: "Algeria", code: "+213" },
  { name: "Andorra", code: "+376" }, { name: "Angola", code: "+244" }, { name: "Antigua and Barbuda", code: "+1" },
  { name: "Argentina", code: "+54" }, { name: "Armenia", code: "+374" }, { name: "Australia", code: "+61" },
  { name: "Austria", code: "+43" }, { name: "Azerbaijan", code: "+994" }, { name: "Bahamas", code: "+1" },
  { name: "Bahrain", code: "+973" }, { name: "Bangladesh", code: "+880" }, { name: "Barbados", code: "+1" },
  { name: "Belarus", code: "+375" }, { name: "Belgium", code: "+32" }, { name: "Belize", code: "+501" },
  { name: "Benin", code: "+229" }, { name: "Bhutan", code: "+975" }, { name: "Bolivia", code: "+591" },
  { name: "Bosnia and Herzegovina", code: "+387" }, { name: "Botswana", code: "+267" }, { name: "Brazil", code: "+55" },
  { name: "Brunei", code: "+673" }, { name: "Bulgaria", code: "+359" }, { name: "Burkina Faso", code: "+226" },
  { name: "Burundi", code: "+257" }, { name: "Cabo Verde", code: "+238" }, { name: "Cambodia", code: "+855" },
  { name: "Cameroon", code: "+237" }, { name: "Canada", code: "+1" }, { name: "Central African Republic", code: "+236" },
  { name: "Chad", code: "+235" }, { name: "Chile", code: "+56" }, { name: "China", code: "+86" },
  { name: "Colombia", code: "+57" }, { name: "Comoros", code: "+269" }, { name: "Congo", code: "+242" },
  { name: "Costa Rica", code: "+506" }, { name: "Croatia", code: "+385" }, { name: "Cuba", code: "+53" },
  { name: "Cyprus", code: "+357" }, { name: "Czech Republic", code: "+420" }, { name: "Denmark", code: "+45" },
  { name: "Djibouti", code: "+253" }, { name: "Dominica", code: "+1" }, { name: "Dominican Republic", code: "+1" },
  { name: "Ecuador", code: "+593" }, { name: "Egypt", code: "+20" }, { name: "El Salvador", code: "+503" },
  { name: "Equatorial Guinea", code: "+240" }, { name: "Eritrea", code: "+291" }, { name: "Estonia", code: "+372" },
  { name: "Eswatini", code: "+268" }, { name: "Ethiopia", code: "+251" }, { name: "Fiji", code: "+679" },
  { name: "Finland", code: "+358" }, { name: "France", code: "+33" }, { name: "Gabon", code: "+241" },
  { name: "Gambia", code: "+220" }, { name: "Georgia", code: "+995" }, { name: "Germany", code: "+49" },
  { name: "Ghana", code: "+233" }, { name: "Greece", code: "+30" }, { name: "Grenada", code: "+1" },
  { name: "Guatemala", code: "+502" }, { name: "Guinea", code: "+224" }, { name: "Guinea-Bissau", code: "+245" },
  { name: "Guyana", code: "+592" }, { name: "Haiti", code: "+509" }, { name: "Honduras", code: "+504" },
  { name: "Hungary", code: "+36" }, { name: "Iceland", code: "+354" }, { name: "India", code: "+91" },
  { name: "Indonesia", code: "+62" }, { name: "Iran", code: "+98" }, { name: "Iraq", code: "+964" },
  { name: "Ireland", code: "+353" }, { name: "Israel", code: "+972" }, { name: "Italy", code: "+39" },
  { name: "Jamaica", code: "+1" }, { name: "Japan", code: "+81" }, { name: "Jordan", code: "+962" },
  { name: "Kazakhstan", code: "+7" }, { name: "Kenya", code: "+254" }, { name: "Kiribati", code: "+686" },
  { name: "Kuwait", code: "+965" }, { name: "Kyrgyzstan", code: "+996" }, { name: "Laos", code: "+856" },
  { name: "Latvia", code: "+371" }, { name: "Lebanon", code: "+961" }, { name: "Lesotho", code: "+266" },
  { name: "Liberia", code: "+231" }, { name: "Libya", code: "+218" }, { name: "Liechtenstein", code: "+423" },
  { name: "Lithuania", code: "+370" }, { name: "Luxembourg", code: "+352" }, { name: "Madagascar", code: "+261" },
  { name: "Malawi", code: "+265" }, { name: "Malaysia", code: "+60" }, { name: "Maldives", code: "+960" },
  { name: "Mali", code: "+223" }, { name: "Malta", code: "+356" }, { name: "Marshall Islands", code: "+692" },
  { name: "Mauritania", code: "+222" }, { name: "Mauritius", code: "+230" }, { name: "Mexico", code: "+52" },
  { name: "Micronesia", code: "+691" }, { name: "Moldova", code: "+373" }, { name: "Monaco", code: "+377" },
  { name: "Mongolia", code: "+976" }, { name: "Montenegro", code: "+382" }, { name: "Morocco", code: "+212" },
  { name: "Mozambique", code: "+258" }, { name: "Myanmar", code: "+95" }, { name: "Namibia", code: "+264" },
  { name: "Nauru", code: "+674" }, { name: "Nepal", code: "+977" }, { name: "Netherlands", code: "+31" },
  { name: "New Zealand", code: "+64" }, { name: "Nicaragua", code: "+505" }, { name: "Niger", code: "+227" },
  { name: "Nigeria", code: "+234" }, { name: "North Korea", code: "+850" }, { name: "North Macedonia", code: "+389" },
  { name: "Norway", code: "+47" }, { name: "Oman", code: "+968" }, { name: "Pakistan", code: "+92" },
  { name: "Palau", code: "+680" }, { name: "Palestine", code: "+970" }, { name: "Panama", code: "+507" },
  { name: "Papua New Guinea", code: "+675" }, { name: "Paraguay", code: "+595" }, { name: "Peru", code: "+51" },
  { name: "Philippines", code: "+63" }, { name: "Poland", code: "+48" }, { name: "Portugal", code: "+351" },
  { name: "Qatar", code: "+974" }, { name: "Romania", code: "+40" }, { name: "Russia", code: "+7" },
  { name: "Rwanda", code: "+250" }, { name: "Saint Kitts and Nevis", code: "+1" }, { name: "Saint Lucia", code: "+1" },
  { name: "Saint Vincent and the Grenadines", code: "+1" }, { name: "Samoa", code: "+685" }, { name: "San Marino", code: "+378" },
  { name: "Sao Tome and Principe", code: "+239" }, { name: "Saudi Arabia", code: "+966" }, { name: "Senegal", code: "+221" },
  { name: "Serbia", code: "+381" }, { name: "Seychelles", code: "+248" }, { name: "Sierra Leone", code: "+232" },
  { name: "Singapore", code: "+65" }, { name: "Slovakia", code: "+421" }, { name: "Slovenia", code: "+386" },
  { name: "Solomon Islands", code: "+677" }, { name: "Somalia", code: "+252" }, { name: "South Africa", code: "+27" },
  { name: "South Korea", code: "+82" }, { name: "South Sudan", code: "+211" }, { name: "Spain", code: "+34" },
  { name: "Sri Lanka", code: "+94" }, { name: "Sudan", code: "+249" }, { name: "Suriname", code: "+597" },
  { name: "Sweden", code: "+46" }, { name: "Switzerland", code: "+41" }, { name: "Syria", code: "+963" },
  { name: "Taiwan", code: "+886" }, { name: "Tajikistan", code: "+992" }, { name: "Tanzania", code: "+255" },
  { name: "Thailand", code: "+66" }, { name: "Timor-Leste", code: "+670" }, { name: "Togo", code: "+228" },
  { name: "Tonga", code: "+676" }, { name: "Trinidad and Tobago", code: "+1" }, { name: "Tunisia", code: "+216" },
  { name: "Turkey", code: "+90" }, { name: "Turkmenistan", code: "+993" }, { name: "Tuvalu", code: "+688" },
  { name: "Uganda", code: "+256" }, { name: "Ukraine", code: "+380" }, { name: "United Arab Emirates", code: "+971" },
  { name: "United Kingdom", code: "+44" }, { name: "United States", code: "+1" }, { name: "Uruguay", code: "+598" },
  { name: "Uzbekistan", code: "+998" }, { name: "Vanuatu", code: "+678" }, { name: "Vatican City", code: "+379" },
  { name: "Venezuela", code: "+58" }, { name: "Vietnam", code: "+84" },  { name: "Yemen", code: "+967" },
  { name: "Zambia", code: "+260" }, { name: "Zimbabwe", code: "+263" }
];

const SETTINGS_KEY = "dashboard-settings"
const DASHBOARD_THEME_KEY = "dashboard-theme"
const DASHBOARD_THEME_EVENT = "dashboard-theme-updated"

function getSavedPreferences() {
  if (typeof window === "undefined") {
    return {
      weeklyDigest: true,
      interviewAlerts: true,
      publicProfile: false,
    }
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)

    if (!raw) {
      return {
        weeklyDigest: true,
        interviewAlerts: true,
        publicProfile: false,
      }
    }

    return JSON.parse(raw)
  } catch {
    return {
      weeklyDigest: true,
      interviewAlerts: true,
      publicProfile: false,
    }
  }
}

function Settings() {
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const [user, setUser] = useState(() => getStoredUser())
  const [formData, setFormData] = useState(() => ({
    name: getStoredUser()?.name || "",
    country: getStoredUser()?.country || "",
    phone: getStoredUser()?.phone || "",
  }))
  const [preferences, setPreferences] = useState(() => getSavedPreferences())
  const [dashboardTheme, setDashboardTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "night"
    }

    return window.localStorage.getItem(DASHBOARD_THEME_KEY) || "night"
  })

  const completion = useMemo(() => {
    let score = 40

    if (formData.name.trim()) {
      score += 25
    }

    if (formData.country.trim()) {
      score += 10
    }
    
    if (formData.phone.trim()) {
      score += 10
    }

    if (preferences.weeklyDigest || preferences.interviewAlerts || preferences.publicProfile) {
      score += 15
    }

    return `${score}%`
  }, [formData.country, formData.phone, formData.name, preferences])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleCountrySelect = (country) => {
    setFormData((current) => ({
      ...current,
      country: country.name,
      phone: current.phone ? current.phone : `${country.code} `
    }))
    setShowCountryDropdown(false)
    setCountrySearch("")
  }

  const filteredCountries = countriesList.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))

  const handleToggle = (key) => {
    setPreferences((current) => {
      const nextPreferences = { ...current, [key]: !current[key] }
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextPreferences))
      return nextPreferences
    })
  }

  const handleSaveProfile = (event) => {
    event.preventDefault()

    const nextUser = updateStoredUser({
      name: formData.name.trim(),
      country: formData.country.trim(),
      phone: formData.phone.trim(),
    })

    setUser(nextUser)
  }

  const handleThemeChange = () => {
    const nextTheme = dashboardTheme === "day" ? "night" : "day"
    window.localStorage.setItem(DASHBOARD_THEME_KEY, nextTheme)
    window.dispatchEvent(new Event(DASHBOARD_THEME_EVENT))
    setDashboardTheme(nextTheme)
  }

  const handleDeleteAccount = () => {
    const shouldDelete = window.confirm(
      "Delete this local account from the dashboard? This will clear your saved session and preferences on this device."
    )

    if (!shouldDelete) {
      return
    }

    window.localStorage.removeItem(SETTINGS_KEY)
    window.localStorage.removeItem(DASHBOARD_THEME_KEY)
    clearAuthSession()
    navigate("/signup")
  }

  return (
    <div className="settings-page">
      <section className="settings-hero">
        <div>
          <h1>Keep your dashboard aligned with how you work.</h1>
          <p>
            Update your basic profile details, adjust reminders, and keep your workspace ready for the next application push.
          </p>
        </div>

        <div className="settings-status-card">
          <span>Setup health</span>
          <strong>{completion}</strong>
          <p>{user?.name || "Your account"} is active and ready for tracking.</p>
        </div>
      </section>

      <div className="settings-grid">
        <form className="settings-panel" onSubmit={handleSaveProfile}>
          <div className="settings-heading">
            <span>Profile</span>
            <h2>Account details</h2>
          </div>

          <label className="settings-field">
            <span>Full name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
            />
          </label>

          <label className="settings-field" style={{ position: 'relative' }} ref={dropdownRef}>
            <span>Country</span>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={(e) => {
                handleInputChange(e)
                setCountrySearch(e.target.value)
                setShowCountryDropdown(true)
              }}
              onFocus={() => setShowCountryDropdown(true)}
              placeholder="Search and select your country..."
              autoComplete="off"
            />
            {showCountryDropdown && (
              <div className="country-dropdown">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => (
                    <div key={c.name} className="country-option" onClick={() => handleCountrySelect(c)}>
                      {c.name} ({c.code})
                    </div>
                  ))
                ) : (
                  <div className="country-option" style={{ color: '#888' }}>No countries found</div>
                )}
              </div>
            )}
          </label>

          <label className="settings-field">
            <span>Phone number</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </label>

          <button type="submit" className="settings-primary-btn">
            Save changes
          </button>
        </form>

        <section className="settings-panel">
          <div className="settings-heading">
            <span>Preferences</span>
            <h2>Notifications and visibility</h2>
          </div>

          <div className="settings-toggle-list">
            <button
              type="button"
              className={`settings-toggle${preferences.weeklyDigest ? " active" : ""}`}
              onClick={() => handleToggle("weeklyDigest")}
            >
              <div>
                <strong>Weekly digest</strong>
                <p>Receive a summary of your weekly progress.</p>
              </div>
              <span>{preferences.weeklyDigest ? "On" : "Off"}</span>
            </button>

            <button
              type="button"
              className={`settings-toggle${preferences.interviewAlerts ? " active" : ""}`}
              onClick={() => handleToggle("interviewAlerts")}
            >
              <div>
                <strong>Interview reminders</strong>
                <p>Keep nudges for practice and application follow-ups.</p>
              </div>
              <span>{preferences.interviewAlerts ? "On" : "Off"}</span>
            </button>

            <button
              type="button"
              className={`settings-toggle${preferences.publicProfile ? " active" : ""}`}
              onClick={() => handleToggle("publicProfile")}
            >
              <div>
                <strong>Public profile mode</strong>
                <p>Prepare your account for portfolio-style sharing.</p>
              </div>
              <span>{preferences.publicProfile ? "On" : "Off"}</span>
            </button>
          </div>
        </section>
      </div>

      <section className="settings-panel">
        <div className="settings-heading">
          <span>Appearance</span>
          <h2>Dashboard theme</h2>
        </div>

        <button type="button" className="settings-theme-toggle" onClick={handleThemeChange}>
          <div>
            <strong>{dashboardTheme === "day" ? "Day mode" : "Night mode"}</strong>
          </div>
          <span>{dashboardTheme === "day" ? "Switch to night" : "Switch to day"}</span>
        </button>
      </section>

      <section className="settings-panel settings-actions">
        <div className="settings-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span>Account</span>
            <h2 style={{ margin: 0 }}>Account actions</h2>
          </div>
          <button type="button" className="settings-danger-btn" onClick={handleDeleteAccount} style={{ margin: 0 }}>
            Delete account
          </button>
        </div>
      </section>
    </div>
  )
}

export default Settings

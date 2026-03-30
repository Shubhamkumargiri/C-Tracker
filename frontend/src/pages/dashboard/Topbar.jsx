import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import "./Topbar.css"
import { getStoredUser, getUserInitials, subscribeToAuthSession } from "../../lib/auth"

function Topbar() {
  const [user, setUser] = useState(() => getStoredUser())
  const firstName = user?.name?.split(" ")[0] || "Developer"
  const initials = getUserInitials(user?.name)

  useEffect(() => {
    return subscribeToAuthSession(() => {
      setUser(getStoredUser())
    })
  }, [])

  return (
    <div className="topbar">
      <div className="topbar-copy">
        <h3>Welcome back, {firstName}</h3>
      </div>

      <div className="profile">
        <div className="profile-text">
          <span>{user?.name || "Developer"}</span>
          <small>{user?.email || "Tracking in progress"}</small>
        </div>

        <Link to="profile">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user?.name || "Profile"}
            />
          ) : (
            <div className="profile-avatar" aria-label={user?.name || "Profile"}>
              {initials}
            </div>
          )}
        </Link>
      </div>
    </div>
  )
}

export default Topbar

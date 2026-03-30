import { useRef, useState } from "react"
import "./Profile.css"
import { getStoredUser, clearAuthSession, getUserInitials, updateStoredUser } from "../../lib/auth"
import { useNavigate } from "react-router-dom"

function Profile(){
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getStoredUser())
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef(null)
  const initials = getUserInitials(user?.name)

  const logout = () => {
    clearAuthSession()
    navigate("/login")
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const removeProfileImage = () => {
    const nextUser = updateStoredUser({ profileImage: "" })
    setUser(nextUser)
    setUploadError("")
  }

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.")
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const nextUser = updateStoredUser({ profileImage: reader.result })
      setUser(nextUser)
      setUploadError("")
    }

    reader.onerror = () => {
      setUploadError("Could not upload the image. Please try again.")
    }

    reader.readAsDataURL(file)
  }

  return(

    <div className="profile-page">

      <div className="profile-card">

        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={user?.name || "profile"}
            className="profile-dp"
          />
        ) : (
          <div className="profile-dp profile-initials">
            {initials}
          </div>
        )}

        <h2>{user?.name || "Developer"}</h2>

        <p>{user?.email || "No email available"}</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="profile-file-input"
          onChange={handleProfileImageChange}
        />

        <div className="photo-actions">
          <button className="upload-btn" onClick={openFilePicker}>
            Add Profile Picture
          </button>

          {user?.profileImage && (
            <button className="remove-btn" onClick={removeProfileImage}>
              Remove Photo
            </button>
          )}
        </div>

        {uploadError && <p className="profile-error">{uploadError}</p>}

        <div className="profile-buttons">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>

        </div>

      </div>

    </div>

  )

}

export default Profile





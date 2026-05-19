import { useRef, useState } from "react"
import "./Profile.css"
import {
  getStoredUser,
  clearAuthSession,
  getUserInitials,
  getToken,
  persistProfileImageForUser,
  setAuthSession,
} from "../../lib/auth"
import { apiRequest } from "../../lib/api"
import { useNavigate } from "react-router-dom"

const MAX_IMAGE_DIMENSION = 512

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getStoredUser())
  const [uploadError, setUploadError] = useState("")
  const [isSavingPhoto, setIsSavingPhoto] = useState(false)
  const fileInputRef = useRef(null)
  const initials = getUserInitials(user?.name)

  const logout = () => {
    clearAuthSession()
    navigate("/login")
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const getFriendlyUploadError = (error, fallbackMessage) => {
    const message = error?.message || ""

    if (
      message.includes("Invalid or expired session") ||
      message.includes("Authentication required") ||
      message.includes("User session is no longer valid")
    ) {
      clearAuthSession()
      navigate("/login")
      return "Your session has expired. Please log in again."
    }

    if (
      message.includes("profileImage") ||
      message.includes("Cannot read properties of undefined")
    ) {
      return "Could not save the profile photo right now. Please try again."
    }

    return message || fallbackMessage
  }

  const resizeImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        const image = new Image()

        image.onload = () => {
          const scale = Math.min(
            1,
            MAX_IMAGE_DIMENSION / image.width,
            MAX_IMAGE_DIMENSION / image.height
          )
          const width = Math.max(1, Math.round(image.width * scale))
          const height = Math.max(1, Math.round(image.height * scale))
          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height

          const context = canvas.getContext("2d")

          if (!context) {
            reject(new Error("Could not process the selected image."))
            return
          }

          context.drawImage(image, 0, 0, width, height)
          resolve(canvas.toDataURL("image/jpeg", 0.82))
        }

        image.onerror = () => {
          reject(new Error("Could not process the selected image."))
        }

        image.src = reader.result
      }

      reader.onerror = () => {
        reject(new Error("Could not read the selected image."))
      }

      reader.readAsDataURL(file)
    })

  const persistProfileImage = async (profileImage) => {
    const token = getToken()
    const currentUser = getStoredUser()
    const localUser = { ...(currentUser || {}), profileImage }

    persistProfileImageForUser(localUser.email, profileImage)
    setAuthSession({ token, user: localUser })
    setUser(localUser)

    if (!token) {
      return
    }

    try {
      const data = await apiRequest("/api/auth/profile-image", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileImage }),
      })

      const nextUser = data?.user || localUser

      persistProfileImageForUser(nextUser.email, nextUser.profileImage || "")
      setAuthSession({ token, user: nextUser })
      setUser(nextUser)
    } catch (error) {
      const message = error?.message || ""

      if (
        message.includes("Invalid or expired session") ||
        message.includes("Authentication required") ||
        message.includes("User session is no longer valid")
      ) {
        throw error
      }
    }
  }

  const removeProfileImage = async () => {
    try {
      setIsSavingPhoto(true)
      await persistProfileImage("")
      setUploadError("")
    } catch (error) {
      setUploadError(getFriendlyUploadError(error, "Could not remove the photo. Please try again."))
    } finally {
      setIsSavingPhoto(false)
    }
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

    ;(async () => {
      try {
        setIsSavingPhoto(true)
        const optimizedImage = await resizeImage(file)
        await persistProfileImage(optimizedImage)
        setUploadError("")
      } catch (error) {
        setUploadError(getFriendlyUploadError(error, "Could not upload the image. Please try again."))
      } finally {
        setIsSavingPhoto(false)
      }
    })()
  }

  return (
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
          <button type="button" className="upload-btn" onClick={openFilePicker} disabled={isSavingPhoto}>
            {isSavingPhoto ? "Saving..." : "Add Profile Picture"}
          </button>

          {user?.profileImage && (
            <button type="button" className="remove-btn" onClick={removeProfileImage} disabled={isSavingPhoto}>
              Remove Photo
            </button>
          )}
        </div>

        {uploadError && <p className="profile-error">{uploadError}</p>}

        <div className="profile-buttons">
          <button type="button" className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile

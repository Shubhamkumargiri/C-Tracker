import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import "./Topbar.css"
import { getStoredUser, getUserInitials, subscribeToAuthSession } from "../../lib/auth"

const SETTINGS_KEY = "dashboard-settings"

const getSavedPreferences = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { weeklyDigest: true, interviewAlerts: true, publicProfile: false };
  } catch {
    return { weeklyDigest: true, interviewAlerts: true, publicProfile: false };
  }
};

const computeMatchScore = (job, activeProfile) => {
  if (!activeProfile) return 0;
  
  let score = 55; // Base score for matching role
  
  const title = (job.title || "").toLowerCase();
  const suggestedRole = (activeProfile.suggestedRole || "").toLowerCase();
  
  if (title.includes(suggestedRole) || suggestedRole.includes(title)) {
    score += 15;
  }
  
  const topSkills = activeProfile.topSkills || [];
  const reqSkills = job.requiredSkills || [];
  
  if (topSkills.length > 0) {
    let matchedSkills = 0;
    topSkills.forEach(skill => {
      const s = skill.toLowerCase();
      if (reqSkills.some(rs => rs.toLowerCase().includes(s))) {
        matchedSkills++;
      } else if (title.includes(s)) {
        matchedSkills++;
      }
    });
    
    const skillRatio = matchedSkills / Math.max(topSkills.length, 1);
    score += Math.round(skillRatio * 30);
  }
  
  return Math.min(score, 100);
};

function Topbar({ onToggleSidebar }) {
  const [user, setUser] = useState(() => getStoredUser())
  const firstName = user?.name?.split(" ")[0] || "Developer"
  const initials = getUserInitials(user?.name)

  // Notification States
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => getSavedPreferences().interviewAlerts
  )
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeResumeProfile, setActiveResumeProfile] = useState(() => {
    try {
      const profile = localStorage.getItem("active-resume-profile");
      return profile ? JSON.parse(profile) : null;
    } catch {
      return null;
    }
  })
  const [notifications, setNotifications] = useState(() => {
    try {
      const notifs = localStorage.getItem("job-notifications");
      return notifs ? JSON.parse(notifs) : [];
    } catch {
      return [];
    }
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isCheckingJobs, setIsCheckingJobs] = useState(false)
  const [toast, setToast] = useState({ show: false, title: "", message: "" })

  const dropdownRef = useRef(null)
  const fileInputRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Listen to Auth Changes
  useEffect(() => {
    return subscribeToAuthSession(() => {
      setUser(getStoredUser())
    })
  }, [])

  // Listen to Settings Changes
  useEffect(() => {
    const handleSettingsUpdate = () => {
      const prefs = getSavedPreferences();
      setNotificationsEnabled(prefs.interviewAlerts);
    };

    window.addEventListener("settings-updated", handleSettingsUpdate);
    window.addEventListener("storage", handleSettingsUpdate);

    return () => {
      window.removeEventListener("settings-updated", handleSettingsUpdate);
      window.removeEventListener("storage", handleSettingsUpdate);
    };
  }, []);

  // Click Outside to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Background Job Scanning
  useEffect(() => {
    if (!notificationsEnabled || !activeResumeProfile) return;

    const checkForNewJobs = async () => {
      try {
        setIsCheckingJobs(true);
        const searchRole = activeResumeProfile.suggestedRole || "Software Engineer";
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/jobs/search?role=${encodeURIComponent(searchRole)}`
        );
        
        if (res.ok) {
          const fetchedJobs = await res.json();
          if (fetchedJobs && fetchedJobs.length > 0) {
            const storedNotifs = JSON.parse(localStorage.getItem("job-notifications") || "[]");
            const existingIds = new Set(storedNotifs.map(n => n.id));
            const newNotifs = [];
            
            fetchedJobs.forEach(job => {
              if (existingIds.has(job.id)) return;
              
              const score = computeMatchScore(job, activeResumeProfile);
              if (score >= 65) {
                newNotifs.push({
                  id: job.id,
                  title: `New matching ${job.title} role!`,
                  company: job.company,
                  location: job.location,
                  salary: job.salary,
                  url: job.url,
                  matchScore: score,
                  skills: job.requiredSkills || [],
                  logo: job.logo,
                  read: false,
                  createdAt: Date.now()
                });
              }
            });
            
            if (newNotifs.length > 0) {
              const updatedNotifs = [...newNotifs, ...storedNotifs];
              setNotifications(updatedNotifs);
              localStorage.setItem("job-notifications", JSON.stringify(updatedNotifs));
              
              // Trigger blinking toast alert
              const topMatch = newNotifs.sort((a, b) => b.matchScore - a.matchScore)[0];
              setToast({
                show: true,
                title: topMatch.title,
                message: `${topMatch.company} - ${topMatch.matchScore}% Match! Location: ${topMatch.location}`
              });
              
              setTimeout(() => {
                setToast({ show: false, title: "", message: "" });
              }, 6000);
            }
          }
        }
      } catch (err) {
        console.error("Error doing background job check:", err);
      } finally {
        setIsCheckingJobs(false);
      }
    };

    checkForNewJobs();
    const interval = setInterval(checkForNewJobs, 90000); // Check every 90 seconds for responsiveness
    return () => clearInterval(interval);
  }, [activeResumeProfile, notificationsEnabled]);

  // Handle Resume Upload & Parse
  const handleUploadResume = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    const name = uploadedFile.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
      alert("Unsupported file type. Please upload a PDF or DOCX resume.");
      return;
    }
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", uploadedFile);
      formData.append("targetRole", "Software Developer");
      
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/jobs/upload-resume`,
        {
          method: "POST",
          body: formData
        }
      );
      
      if (!res.ok) {
        throw new Error("Failed to process resume. Please try again.");
      }
      
      const data = await res.json();
      if (data.resumeAnalysis) {
        const profile = data.resumeAnalysis;
        setActiveResumeProfile(profile);
        localStorage.setItem("active-resume-profile", JSON.stringify(profile));
        
        // Broadcast profile update event to other pages (e.g. JobMatcher)
        window.dispatchEvent(new Event("resume-profile-updated"));

        // Populate initial notifications from returned jobs
        if (data.jobs && data.jobs.length > 0) {
          const newNotifs = data.jobs.map(job => {
            const score = computeMatchScore(job, profile);
            return {
              id: job.id,
              title: `AI Match: ${job.title}`,
              company: job.company,
              location: job.location,
              salary: job.salary,
              url: job.url,
              matchScore: score,
              skills: job.requiredSkills || [profile.suggestedRole],
              logo: job.logo,
              read: false,
              createdAt: Date.now()
            };
          }).filter(n => n.matchScore >= 60);
          
          setNotifications(newNotifs);
          localStorage.setItem("job-notifications", JSON.stringify(newNotifs));
          
          setToast({
            show: true,
            title: "Resume Analyzed Successfully!",
            message: `Inferred Profile: ${profile.suggestedRole}. Found ${newNotifs.length} matching jobs!`
          });
          
          setTimeout(() => {
            setToast({ show: false, title: "", message: "" });
          }, 6000);
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred during parsing.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("job-notifications", JSON.stringify(updated));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("job-notifications", JSON.stringify([]));
  };

  const handleRemoveProfile = () => {
    if (window.confirm("Remove active resume profile and disable auto matching alerts?")) {
      setActiveResumeProfile(null);
      localStorage.removeItem("active-resume-profile");
      window.dispatchEvent(new Event("resume-profile-updated"));
    }
  };

  return (
    <div className="topbar">
      {/* Toast Alert */}
      {toast.show && (
        <div className="topbar-toast">
          <div className="toast-content">
            <span className="toast-icon">⚡</span>
            <div>
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </div>
          </div>
          <button className="toast-close" onClick={() => setToast({ show: false, title: "", message: "" })}>&times;</button>
        </div>
      )}

      <button 
        type="button" 
        className="topbar-toggle-btn" 
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar menu"
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      <div className="topbar-copy">
        <h3>Welcome back, {firstName}</h3>
      </div>

      <div className="topbar-actions" ref={dropdownRef}>
        {/* Notification Bell */}
        <div className="notification-bell-container">
          <button 
            type="button" 
            className={`notification-bell-btn ${dropdownOpen ? "active" : ""}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="View notifications"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="bell-icon"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {notificationsEnabled && unreadCount > 0 && (
              <span className="bell-badge-pulse"></span>
            )}
          </button>

          {/* Glassmorphic Dropdown Panel */}
          {dropdownOpen && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h4>Job Notifications</h4>
                {notifications.length > 0 && (
                  <div className="header-actions">
                    <button className="text-btn" onClick={handleMarkAllAsRead}>Mark read</button>
                    <span className="divider">|</span>
                    <button className="text-btn text-danger" onClick={handleClearNotifications}>Clear</button>
                  </div>
                )}
              </div>

              {!notificationsEnabled ? (
                <div className="dropdown-empty">
                  <span className="warning-icon">⚠️</span>
                  <p>Notifications are currently disabled.</p>
                  <Link to="settings" className="setup-link" onClick={() => setDropdownOpen(false)}>
                    Turn On in Settings
                  </Link>
                </div>
              ) : (
                <>
                  {/* Resume Upload alert system */}
                  <div className="resume-matching-setup">
                    {activeResumeProfile ? (
                      <div className="active-profile-card">
                        <div className="profile-details">
                          <span className="check-icon">✓</span>
                          <div>
                            <strong>Active Alert Resume</strong>
                            <p className="role-tag">{activeResumeProfile.suggestedRole}</p>
                            <div className="skills-row">
                              {activeResumeProfile.topSkills?.slice(0, 3).map((s, idx) => (
                                <span key={idx} className="skill-mini-tag">{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button className="remove-profile-btn" title="Remove Profile" onClick={handleRemoveProfile}>
                          &times;
                        </button>
                      </div>
                    ) : (
                      <div className="upload-alert-box">
                        <h5>📄 Set Up Job Alerts</h5>
                        <p>Upload your resume to automatically scan and notify you when matching jobs are found in India.</p>
                        <input 
                          type="file" 
                          id="dropdown-resume-upload" 
                          accept=".pdf,.docx" 
                          onChange={handleUploadResume} 
                          ref={fileInputRef} 
                          style={{ display: "none" }}
                        />
                        <button 
                          type="button" 
                          className="upload-alert-btn"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {isUploading ? "🤖 Parsing Resume..." : "📤 Add Resume for Alerts"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* List of matched jobs */}
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <div className="dropdown-empty">
                        <span className="empty-icon">🔔</span>
                        <p>No job alerts yet.</p>
                        <small className="empty-sub">Configure your resume profile above to scan for matching jobs.</small>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`notification-item ${notif.read ? "read" : "unread"}`}>
                          <div className="notif-top">
                            {notif.logo ? (
                              <img src={notif.logo} alt="Logo" className="notif-company-logo" />
                            ) : (
                              <div className="notif-logo-fallback">💼</div>
                            )}
                            <div className="notif-body">
                              <h5 className="notif-title">{notif.title}</h5>
                              <p className="notif-company">{notif.company} &bull; {notif.location}</p>
                              {notif.matchScore && (
                                <span className={`notif-score-tag ${notif.matchScore >= 80 ? "high" : "mid"}`}>
                                  {notif.matchScore}% Suitability Match
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="notif-footer">
                            <a href={notif.url} target="_blank" rel="noopener noreferrer" className="notif-apply-btn">
                              Apply Now
                            </a>
                            <span className="notif-time">Just now</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Profile Details */}
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
    </div>
  )
}

export default Topbar

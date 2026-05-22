import { useState, useRef, useEffect } from "react"
import html2pdf from "html2pdf.js"
import "./ResumeBuilder.css"

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

// Formatting utility to fix capitalization typos (e.g., UniversITY -> University)
const formatText = (str) => {
  if (!str) return "";
  return str.split(' ').map(word => {
    if (word.includes('.')) return word.charAt(0).toUpperCase() + word.slice(1);
    const hasMultipleUpper = (word.match(/[A-Z]/g) || []).length > 1;
    const isAllUpper = word === word.toUpperCase();
    if (hasMultipleUpper && !isAllUpper) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    if (word.length > 0) return word.charAt(0).toUpperCase() + word.slice(1);
    return word;
  }).join(' ');
}

function ResumeBuilder() {
  const [step, setStep] = useState("form") // "form" | "preview"

  // 1. Basic Info
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    nationality: "",
    phone: "",
    email: "",
    devpost: "",
    github: "",
    targetRole: ""
  })

  // ATS Checker States
  const [atsResult, setAtsResult] = useState(null)
  const [isCheckingATS, setIsCheckingATS] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [showAtsModal, setShowAtsModal] = useState(false)
  const [isImprovingResume, setIsImprovingResume] = useState(false)

  // Nationality Dropdown State
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const dropdownRef = useRef(null)

  // 2. Summary
  const [summary, setSummary] = useState("")

  // 3. Projects (Dynamic, max 5)
  const [projects, setProjects] = useState([
    { name: "", type: "", tech: "", description: "" }
  ])

  // 4. Skills (Single text area)
  const [skills, setSkills] = useState("")

  // 5. Education (Dynamic)
  const [education, setEducation] = useState([
    { degree: "", duration: "", institution: "" }
  ])

  // 6. Certifications (Dynamic)
  const [certifications, setCertifications] = useState([
    { title: "" }
  ])

  // 7. Experience (Dynamic & Optional)
  const [experience, setExperience] = useState([
    { role: "", company: "", duration: "", description: "" }
  ])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Generic handers
  const handleBasicInfoChange = (e) => setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value })

  const handleCountrySelect = (country) => {
    setBasicInfo({
      ...basicInfo,
      nationality: country.name,
      // If phone is empty or doesn't have a +, add the code. Otherwise append it or leave it.
      phone: basicInfo.phone ? basicInfo.phone : `${country.code} `
    })
    setShowCountryDropdown(false)
    setCountrySearch("")
  }

  const filteredCountries = countriesList.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))

  // Dynamic Array Handlers
  const handleArrayAdd = (setter, state, template, max = Infinity) => {
    if (state.length < max) setter([...state, template])
  }
  const handleArrayChange = (setter, state, index, field, value) => {
    const newState = [...state]
    newState[index][field] = value
    setter(newState)
  }
  const handleArrayRemove = (setter, state, index) => {
    const newState = [...state]
    newState.splice(index, 1)
    setter(newState)
  }

  // Skill Categorization Engine
  const getCategorizedSkills = (rawSkills) => {
    if (!rawSkills) return {};
    
    const categories = {
      "Languages": [],
      "Full-Stack Dev": [],
      "Styling & UI": [],
      "APIs & Auth": [],
      "CS Fundamentals": [],
      "Tools": [],
      "Other": []
    };

    const dictionary = {
      "java": "Languages", "javascript": "Languages", "python": "Languages", "html": "Languages", "css": "Languages", "c++": "Languages", "c#": "Languages", "typescript": "Languages", "ruby": "Languages", "go": "Languages",
      "react": "Full-Stack Dev", "node": "Full-Stack Dev", "express": "Full-Stack Dev", "mongo": "Full-Stack Dev", "sql": "Full-Stack Dev", "next": "Full-Stack Dev", "django": "Full-Stack Dev", "spring": "Full-Stack Dev",
      "tailwind": "Styling & UI", "bootstrap": "Styling & UI", "responsive": "Styling & UI", "material ui": "Styling & UI", "sass": "Styling & UI",
      "rest": "APIs & Auth", "api": "APIs & Auth", "jwt": "APIs & Auth", "oauth": "APIs & Auth", "graphql": "APIs & Auth",
      "dsa": "CS Fundamentals", "dbms": "CS Fundamentals", "operating system": "CS Fundamentals", "system design": "CS Fundamentals", "algorithm": "CS Fundamentals",
      "git": "Tools", "docker": "Tools", "postman": "Tools", "vs code": "Tools", "aws": "Tools", "azure": "Tools", "linux": "Tools", "figma": "Tools"
    };

    const skillArray = rawSkills.split(',').map(s => s.trim()).filter(s => s);
    
    skillArray.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      let found = false;
      for (const [key, category] of Object.entries(dictionary)) {
        if (lowerSkill.includes(key)) {
          categories[category].push(skill);
          found = true;
          break;
        }
      }
      if (!found) {
        categories["Other"].push(skill);
      }
    });

    const finalCategories = {};
    for (const [key, arr] of Object.entries(categories)) {
      if (arr.length > 0) finalCategories[key] = arr.join(", ");
    }
    return finalCategories;
  }

  // Auto Generate Summary
  const generateAutoSummary = () => {
    const categorized = getCategorizedSkills(skills);
    const langs = categorized["Languages"] ? categorized["Languages"].split(',')[0].trim() : 'modern technologies';
    const firstProj = projects[0]?.name ? projects[0].name : 'innovative web applications';
    return `Passionate Developer with hands-on experience building scalable, responsive applications. Proficient in ${langs} with clean code practices and strong problem-solving skills. Dedicated to continuous learning and building impactful projects like ${firstProj}.`
  }

  const handleGenerate = () => {
    if (!basicInfo.name || !basicInfo.email || !basicInfo.phone || !basicInfo.targetRole) {
      alert("Please fill in the required Basic Information fields (Name, Target Role, Phone, Email).")
      return
    }
    setStep("preview")
  }

  const handlePrint = () => {
    window.print();
  }

  const handleAIEnhance = async (text, section, setter, arrayIndex, arrayField, arrayState) => {
    if (!text || text.trim() === "") return;
    setIsEnhancing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ctai/enhance-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, section, targetRole: basicInfo.targetRole })
      });
      const data = await response.json();
      if (response.ok && data.enhancedText) {
        if (arrayIndex !== undefined && arrayField && arrayState && setter) {
          handleArrayChange(setter, arrayState, arrayIndex, arrayField, data.enhancedText);
        } else if (setter) {
          setter(data.enhancedText);
        }
      } else {
        alert(data.error || "Failed to enhance text.");
      }
    } catch (err) {
      alert("Network error while calling AI.");
    } finally {
      setIsEnhancing(false);
    }
  }

  const handleATSCheck = async () => {
    setIsCheckingATS(true);
    setShowAtsModal(true);
    try {
      const resumeData = {
        basicInfo,
        summary: summary || generateAutoSummary(),
        projects,
        skills,
        education,
        certifications,
        experience
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ctai/resume-ats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, targetRole: basicInfo.targetRole })
      });
      const data = await response.json();
      if (response.ok && data.score !== undefined) {
        setAtsResult(data);
      } else {
        setShowAtsModal(false);
        alert(data.error || "Failed to check ATS score.");
      }
    } catch (err) {
      setShowAtsModal(false);
      alert("Network error while checking ATS score.");
    } finally {
      setIsCheckingATS(false);
    }
  }

  const handleImproveResume = async () => {
    setIsImprovingResume(true);
    try {
      const resumeData = {
        basicInfo,
        summary: summary || generateAutoSummary(),
        projects,
        skills,
        education,
        certifications,
        experience
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ctai/improve-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, targetRole: basicInfo.targetRole })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.basicInfo) setBasicInfo(data.basicInfo);
        if (data.summary) setSummary(data.summary);
        if (data.projects) setProjects(data.projects);
        if (data.skills) setSkills(data.skills);
        if (data.education) setEducation(data.education);
        if (data.certifications) setCertifications(data.certifications);
        if (data.experience) setExperience(data.experience);
        alert("Your resume has been completely upgraded by AI!");
      } else {
        alert(data.error || "Failed to improve resume.");
      }
    } catch (err) {
      alert("Network error while improving resume.");
    } finally {
      setIsImprovingResume(false);
    }
  }

  const finalSummary = summary.trim() !== "" ? summary : generateAutoSummary()
  const categorizedSkills = getCategorizedSkills(skills);
  const hasValidExperience = experience.some(e => e.role || e.company)
  const hasValidCerts = certifications.some(c => c.title)

  if (step === "form") {
    return (
      <div className="resume-builder-page">
        <div className="resume-builder-header">
          <h1>Resume Details</h1>
          <p>Fill out the form below to generate your ATS-friendly resume.</p>
        </div>

        {/* Basic Info */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Full Name <span className="required-star">*</span></label>
              <input type="text" name="name" value={basicInfo.name} onChange={handleBasicInfoChange} placeholder="John Doe" />
            </div>
            
            <div className="form-group">
              <label>Target Job Role <span className="required-star">*</span></label>
              <input type="text" name="targetRole" value={basicInfo.targetRole} onChange={handleBasicInfoChange} placeholder="e.g., Frontend Developer" />
            </div>

            <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
              <label>Nationality <span className="required-star">*</span></label>
              <input 
                type="text" 
                name="nationality" 
                value={basicInfo.nationality} 
                onChange={(e) => {
                  handleBasicInfoChange(e)
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
            </div>

            <div className="form-group">
              <label>Phone Number <span className="required-star">*</span></label>
              <input type="text" name="phone" value={basicInfo.phone} onChange={handleBasicInfoChange} placeholder="+1 234 567 8900" />
            </div>
            <div className="form-group">
              <label>Email ID <span className="required-star">*</span></label>
              <input type="email" name="email" value={basicInfo.email} onChange={handleBasicInfoChange} placeholder="youremail@gmail.com" />
            </div>
            <div className="form-group">
              <label>Devpost URL</label>
              <input type="text" name="devpost" value={basicInfo.devpost} onChange={handleBasicInfoChange} placeholder="devpost.com/yourusername" />
            </div>
            <div className="form-group">
              <label>GitHub URL</label>
              <input type="text" name="github" value={basicInfo.github} onChange={handleBasicInfoChange} placeholder="github.com/yourgithubid" />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="form-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 className="form-section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Professional Summary (Optional)</h3>
            <button className="btn-ai-enhance" onClick={() => handleAIEnhance(summary, "Professional Summary", setSummary)} disabled={isEnhancing || !summary}>✨ Enhance with AI</button>
          </div>
          <p style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--dashboard-text)' }}>If left blank, a professional summary will be auto-generated based on your data.</p>
          <div className="form-group">
            <textarea 
              value={summary} 
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Passionate Full-Stack Developer with hands-on experience building scalable web applications..."
            />
          </div>
        </div>

        {/* Projects */}
        <div className="form-section">
          <h3 className="form-section-title">Projects <span className="required-star">*</span></h3>
          {projects.map((proj, idx) => (
            <div key={idx} className="dynamic-item">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Project Name</label>
                  <input type="text" value={proj.name} onChange={(e) => handleArrayChange(setProjects, projects, idx, 'name', e.target.value)} placeholder="E-Commerce Platform" />
                </div>
                <div className="form-group">
                  <label>Project Type / Role</label>
                  <input type="text" value={proj.type} onChange={(e) => handleArrayChange(setProjects, projects, idx, 'type', e.target.value)} placeholder="Full-Stack Web Application" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Languages & Tech Stack</label>
                  <input type="text" value={proj.tech} onChange={(e) => handleArrayChange(setProjects, projects, idx, 'tech', e.target.value)} placeholder="React.js, Node.js, Express.js, MongoDB" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>About Project (Bullet points, separate by new line)</label>
                    <button className="btn-ai-enhance" onClick={() => handleAIEnhance(proj.description, "Project Description", setProjects, idx, 'description', projects)} disabled={isEnhancing || !proj.description}>✨ Enhance with AI</button>
                  </div>
                  <textarea value={proj.description} onChange={(e) => handleArrayChange(setProjects, projects, idx, 'description', e.target.value)} placeholder="- Developed a scalable e-commerce platform...&#10;- Integrated Stripe API for payments..." />
                </div>
              </div>
              {projects.length > 1 && (
                <button className="btn-add" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleArrayRemove(setProjects, projects, idx)}>Remove Project</button>
              )}
            </div>
          ))}
          {projects.length < 5 && (
            <button className="btn-add" onClick={() => handleArrayAdd(setProjects, projects, { name: "", type: "", tech: "", description: "" }, 5)}>
              + Add More Project
            </button>
          )}
        </div>

        {/* Skills */}
        <div className="form-section">
          <h3 className="form-section-title">Skills <span className="required-star">*</span></h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--dashboard-text)' }}>Enter all your skills separated by commas. Our AI will automatically categorize them into Languages, Tools, etc.</p>
          <div className="form-group">
            <textarea 
              value={skills} 
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Java, JavaScript, React.js, Node.js, MongoDB, Tailwind CSS, Git, GitHub"
            />
          </div>
        </div>

        {/* Education */}
        <div className="form-section">
          <h3 className="form-section-title">Education <span className="required-star">*</span></h3>
          {education.map((edu, idx) => (
            <div key={idx} className="dynamic-item">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Degree / Class Name</label>
                  <input type="text" value={edu.degree} onChange={(e) => handleArrayChange(setEducation, education, idx, 'degree', e.target.value)} placeholder="B.Tech. in Computer Science & Engineering" />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input type="text" value={edu.duration} onChange={(e) => handleArrayChange(setEducation, education, idx, 'duration', e.target.value)} placeholder="2020–2024" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Institution Name & Location</label>
                  <input type="text" value={edu.institution} onChange={(e) => handleArrayChange(setEducation, education, idx, 'institution', e.target.value)} placeholder="University Name, City, State" />
                </div>
              </div>
              {education.length > 1 && (
                <button className="btn-add" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleArrayRemove(setEducation, education, idx)}>Remove</button>
              )}
            </div>
          ))}
          <button className="btn-add" onClick={() => handleArrayAdd(setEducation, education, { degree: "", duration: "", institution: "" })}>
            + Add More Education (School/College)
          </button>
        </div>

        {/* Certifications */}
        <div className="form-section">
          <h3 className="form-section-title">Certifications</h3>
          {certifications.map((cert, idx) => (
            <div key={idx} className="dynamic-item" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="text" value={cert.title} onChange={(e) => handleArrayChange(setCertifications, certifications, idx, 'title', e.target.value)} placeholder="AWS Certified Solutions Architect – Amazon Web Services" />
              </div>
              {certifications.length > 1 && (
                <button className="btn-add" style={{ color: '#ef4444', borderColor: '#ef4444', marginTop: '8px' }} onClick={() => handleArrayRemove(setCertifications, certifications, idx)}>Remove</button>
              )}
            </div>
          ))}
          <button className="btn-add" onClick={() => handleArrayAdd(setCertifications, certifications, { title: "" })}>
            + Add More Certification
          </button>
        </div>

        {/* Experience (Optional) */}
        <div className="form-section">
          <h3 className="form-section-title">Experience (Optional)</h3>
          {experience.map((exp, idx) => (
            <div key={idx} className="dynamic-item">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" value={exp.role} onChange={(e) => handleArrayChange(setExperience, experience, idx, 'role', e.target.value)} placeholder="Software Engineer Intern" />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input type="text" value={exp.company} onChange={(e) => handleArrayChange(setExperience, experience, idx, 'company', e.target.value)} placeholder="Tech Innovations Inc." />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input type="text" value={exp.duration} onChange={(e) => handleArrayChange(setExperience, experience, idx, 'duration', e.target.value)} placeholder="Jun 2023 - Aug 2023" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Description (Bullet points, separate by new line)</label>
                    <button className="btn-ai-enhance" onClick={() => handleAIEnhance(exp.description, "Work Experience Description", setExperience, idx, 'description', experience)} disabled={isEnhancing || !exp.description}>✨ Enhance with AI</button>
                  </div>
                  <textarea value={exp.description} onChange={(e) => handleArrayChange(setExperience, experience, idx, 'description', e.target.value)} placeholder="- Developed REST APIs...&#10;- Reduced load times by 20%..." />
                </div>
              </div>
              <button className="btn-add" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleArrayRemove(setExperience, experience, idx)}>Remove</button>
            </div>
          ))}
          <button className="btn-add" onClick={() => handleArrayAdd(setExperience, experience, { role: "", company: "", duration: "", description: "" })}>
            + Add Experience
          </button>
        </div>

        <button className="btn-primary" onClick={handleGenerate}>
          Generate Resume
        </button>
      </div>
    )
  }

  // Generate Separator correctly to prevent trailing/leading pipes if some info is missing
  const contactItems = []
  if (basicInfo.phone) contactItems.push(basicInfo.phone)
  if (basicInfo.email) contactItems.push(basicInfo.email)
  if (basicInfo.devpost) contactItems.push(basicInfo.devpost)
  if (basicInfo.github) contactItems.push(basicInfo.github)

  // Preview Step
  return (
    <div className="resume-builder-page" style={{ maxWidth: '1000px' }}>
      <div className="preview-actions">
        <button className="btn-secondary" onClick={() => setStep("form")}>
          &larr; Back to Edit
        </button>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #b026ff, #502d8c)' }} onClick={handleImproveResume} disabled={isImprovingResume}>
            {isImprovingResume ? "✨ Improving..." : "✨ Auto-Improve Resume"}
          </button>
          <button className="btn-secondary ats-check-btn" onClick={handleATSCheck}>
            🎯 Analyze ATS Score
          </button>
          <button className="btn-primary" style={{ width: 'auto' }} onClick={handlePrint}>
            Download PDF
          </button>
        </div>
      </div>

      <div className="preview-container">
        <div id="resume-pdf-container" className="shubham-resume">
          
          <div className="shubham-header">
            <h1 className="shubham-name">{formatText(basicInfo.name)}</h1>
            <div className="shubham-contact">
              {contactItems.map((item, index) => (
                <span key={index} style={{ color: '#000' }}>
                  {item}
                  {index < contactItems.length - 1 && <span className="separator"> | </span>}
                </span>
              ))}
            </div>
          </div>

          <div className="shubham-section-title">PROFESSIONAL SUMMARY</div>
          <div className="shubham-summary">{finalSummary}</div>

          {hasValidExperience && (
            <>
              <div className="shubham-section-title">EXPERIENCE</div>
              {experience.filter(e => e.role || e.company).map((exp, i) => (
                <div key={i} className="shubham-project">
                  <div className="shubham-project-title">
                    {formatText(exp.company)} – {formatText(exp.role)} {exp.duration && <span style={{fontWeight: 'normal', float: 'right'}}>{exp.duration}</span>}
                  </div>
                  {exp.description && (
                    <ul className="shubham-bullets">
                      {exp.description.split('\n').filter(l => l.trim()).map((line, j) => (
                        <li key={j}>{line.replace(/^-/, '').trim()}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          )}

          <div className="shubham-section-title">PROJECTS</div>
          {projects.filter(p => p.name).map((proj, i) => (
            <div key={i} className="shubham-project">
              <div className="shubham-project-title">
                {formatText(proj.name)} {proj.type && `– ${formatText(proj.type)}`}
              </div>
              {proj.tech && <div className="shubham-project-tech">{proj.tech}</div>}
              {proj.description && (
                <ul className="shubham-bullets">
                  {proj.description.split('\n').filter(l => l.trim()).map((line, j) => (
                    <li key={j}>{line.replace(/^-/, '').trim()}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="shubham-section-title">SKILLS</div>
          <div>
            {Object.entries(categorizedSkills).map(([category, items]) => (
              <div key={category} className="shubham-skill-row">
                <strong>{category}:</strong> {items}
              </div>
            ))}
          </div>

          <div className="shubham-section-title">EDUCATION</div>
          {education.filter(e => e.degree || e.institution).map((edu, i) => (
            <div key={i} className="shubham-edu-item">
              <div className="shubham-edu-degree"><strong>{formatText(edu.degree)}</strong> {edu.duration && `(${edu.duration})`}</div>
              <div>{formatText(edu.institution)}</div>
            </div>
          ))}

          {hasValidCerts && (
            <>
              <div className="shubham-section-title">CERTIFICATIONS</div>
              <ul className="shubham-cert-list">
                {certifications.filter(c => c.title).map((cert, i) => (
                  <li key={i}>{cert.title}</li>
                ))}
              </ul>
            </>
          )}

        </div>
      </div>

      {/* ATS Checker Modal */}
      {showAtsModal && (
        <div className="ats-modal-overlay">
          <div className="ats-modal-content">
            <button className="ats-modal-close" onClick={() => setShowAtsModal(false)}>×</button>
            <h2 className="ats-modal-title">ATS Match Score</h2>
            <p className="ats-target-role">Target Role: <strong>{basicInfo.targetRole}</strong></p>

            {isCheckingATS ? (
              <div className="ats-loading-container">
                <div className="ats-loader"></div>
                <p>Analyzing resume against ATS algorithms...</p>
              </div>
            ) : atsResult ? (
              <div className="ats-result-container">
                <div className="ats-score-circle" style={{ borderColor: atsResult.score > 80 ? '#22c55e' : atsResult.score > 60 ? '#f59e0b' : '#ef4444' }}>
                  <span className="ats-score-number">{atsResult.score}%</span>
                  <span className="ats-score-label">Match</span>
                </div>
                
                <div className="ats-keywords-section">
                  <h3>✅ Matched Keywords</h3>
                  <div className="ats-keyword-badges">
                    {atsResult.matchedKeywords && atsResult.matchedKeywords.length > 0 ? atsResult.matchedKeywords.map((k, i) => <span key={i} className="ats-badge match">{k}</span>) : <span>None</span>}
                  </div>
                  
                  <h3>❌ Missing Keywords</h3>
                  <div className="ats-keyword-badges">
                    {atsResult.missingKeywords && atsResult.missingKeywords.length > 0 ? atsResult.missingKeywords.map((k, i) => <span key={i} className="ats-badge miss">{k}</span>) : <span>None</span>}
                  </div>
                </div>

                <div className="ats-tips-section">
                  <h3>💡 Improvement Tips</h3>
                  <ul>
                    {atsResult.tips && atsResult.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p>Failed to load ATS results.</p>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default ResumeBuilder

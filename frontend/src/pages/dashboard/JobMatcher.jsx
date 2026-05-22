import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import './JobMatcher.css';

function JobMatcher() {
    const [searchRole, setSearchRole] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [jobs, setJobs] = useState([]);
    
    // Modal & Upload states
    const [selectedJob, setSelectedJob] = useState(null);
    const [file, setFile] = useState(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [matchResult, setMatchResult] = useState(null);
    
    const fileInputRef = useRef(null);
    
    // Active Alert Resume States
    const [activeResumeProfile, setActiveResumeProfile] = useState(() => {
        try {
            const profile = localStorage.getItem("active-resume-profile");
            return profile ? JSON.parse(profile) : null;
        } catch {
            return null;
        }
    });
    const [isUploadingAlertResume, setIsUploadingAlertResume] = useState(false);
    const alertFileInputRef = useRef(null);

    // Sync with Topbar Profile events
    useState(() => {
        const handleProfileUpdate = () => {
            try {
                const profile = localStorage.getItem("active-resume-profile");
                setActiveResumeProfile(profile ? JSON.parse(profile) : null);
            } catch (err) {
                console.error(err);
            }
        };

        window.addEventListener("resume-profile-updated", handleProfileUpdate);
        window.addEventListener("storage", handleProfileUpdate);

        return () => {
            window.removeEventListener("resume-profile-updated", handleProfileUpdate);
            window.removeEventListener("storage", handleProfileUpdate);
        };
    });

    const handleUploadAlertResume = async (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;
        
        const name = uploadedFile.name.toLowerCase();
        if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
            return alert("Unsupported file type. Please upload a PDF or DOCX resume.");
        }
        
        setIsUploadingAlertResume(true);
        try {
            const formData = new FormData();
            formData.append("resume", uploadedFile);
            formData.append("targetRole", "Software Developer");
            
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/jobs/upload-resume`, {
                method: "POST",
                body: formData,
            });
            
            if (!res.ok) throw new Error("Failed to upload and parse resume.");
            
            const data = await res.json();
            if (data.resumeAnalysis) {
                const profile = data.resumeAnalysis;
                setActiveResumeProfile(profile);
                localStorage.setItem("active-resume-profile", JSON.stringify(profile));
                
                // Alert Topbar to update
                window.dispatchEvent(new Event("resume-profile-updated"));
                
                // Populate matched jobs if any returned
                if (data.jobs && data.jobs.length > 0) {
                    setJobs(data.jobs);
                }
                
                alert(`Resume successfully set! Suggested role: ${profile.suggestedRole}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error parsing resume: " + error.message);
        } finally {
            setIsUploadingAlertResume(false);
        }
    };

    const handleScanMatchingJobs = () => {
        if (!activeResumeProfile) return;
        setSearchRole(activeResumeProfile.suggestedRole);
        // Trigger search by calling api directly
        triggerSearch(activeResumeProfile.suggestedRole);
    };

    const triggerSearch = async (roleName) => {
        setIsSearching(true);
        setJobs([]);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/jobs/search?role=${encodeURIComponent(roleName)}`);
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
                if (data.length === 0) {
                    alert("No jobs found for this role in India.");
                }
            } else {
                alert("Failed to fetch jobs.");
            }
        } catch (err) {
            console.error(err);
            alert("Network error.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchRole.trim()) return alert("Please enter a job role.");
        
        setIsSearching(true);
        setJobs([]);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/jobs/search?role=${encodeURIComponent(searchRole)}`);
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
                if (data.length === 0) {
                    alert("No jobs found for this role in India.");
                }
            } else {
                alert("Failed to fetch jobs.");
            }
        } catch (err) {
            console.error(err);
            alert("Network error.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleEvaluateChances = async () => {
        if (!file) return alert("Please upload a resume first.");
        
        setIsEvaluating(true);
        setMatchResult(null);

        try {
            // 1. Extract text from resume
            const formData = new FormData();
            formData.append('resume', file);

            const extractRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/jobs/extract-resume-text`, {
                method: "POST",
                body: formData,
            });

            if (!extractRes.ok) {
                const errData = await extractRes.json();
                throw new Error(errData.error || "Failed to parse resume.");
            }
            
            const { rawText } = await extractRes.json();

            // 2. Check match with selected job
            const matchRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/jobs/check-match`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText, job: selectedJob })
            });

            if (!matchRes.ok) throw new Error("Failed to evaluate chances.");
            
            const matchData = await matchRes.json();
            setMatchResult(matchData);

        } catch (error) {
            alert(error.message || "An error occurred.");
        } finally {
            setIsEvaluating(false);
        }
    };

    const closeMenu = () => {
        setSelectedJob(null);
        setFile(null);
        setMatchResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="job-matcher-container">
            {/* Header Section */}
            <div className="jm-header">
                <h1 className="jm-title">AI Job Finder</h1>
                <p className="jm-subtitle">Find real remote & local jobs in India and evaluate your chances with AI.</p>
            </div>

            {/* Active Resume Alert Profile Panel */}
            <div className="jm-alert-profile-section" style={{ marginBottom: '30px' }}>
                {activeResumeProfile ? (
                    <div className="jm-profile-card" style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(124, 58, 237, 0.12) 100%)',
                        border: '1.5px dashed rgba(168, 85, 247, 0.4)',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        flexWrap: 'wrap',
                        boxShadow: '0 10px 30px rgba(168, 85, 247, 0.05)'
                    }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'rgba(16, 185, 129, 0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#10b981', fontSize: '1.4rem', fontWeight: 'bold',
                                boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
                            }}>
                                ✓
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 6px 0', color: 'var(--dashboard-text-strong)', fontSize: '1.15rem' }}>
                                    Active AI Job Alerts Profile: <span style={{ color: '#c084fc' }}>{activeResumeProfile.suggestedRole}</span>
                                </h3>
                                <p style={{ margin: '0 0 12px 0', color: 'var(--dashboard-text-muted)', fontSize: '0.9rem' }}>
                                    Candidate: <strong>{activeResumeProfile.name || 'Developer'}</strong> &bull; Experience: <strong>{activeResumeProfile.experienceLevel}</strong>
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {activeResumeProfile.topSkills?.map((skill, idx) => (
                                        <span key={idx} style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#d8b4fe', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600' }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                                onClick={handleScanMatchingJobs}
                                className="jm-btn-primary"
                                style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                            >
                                🔍 Scan Matching Jobs
                            </button>
                            <button 
                                onClick={() => {
                                    if(window.confirm("Remove your active alert profile?")) {
                                        localStorage.removeItem("active-resume-profile");
                                        setActiveResumeProfile(null);
                                        window.dispatchEvent(new Event("resume-profile-updated"));
                                    }
                                }}
                                className="jm-btn-outline"
                                style={{ padding: '10px 18px', border: '1px solid var(--dashboard-danger)', color: 'var(--dashboard-danger)', background: 'transparent' }}
                            >
                                Remove Alerts
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="jm-profile-card" style={{
                        background: 'var(--dashboard-surface-strong)',
                        border: '1px solid var(--dashboard-border)',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        flexWrap: 'wrap',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', color: 'var(--dashboard-text-strong)', fontSize: '1.1rem' }}>
                                📄 Enable Real-Time AI Job Alerts
                            </h3>
                            <p style={{ margin: 0, color: 'var(--dashboard-text-muted)', fontSize: '0.9rem', maxWidth: '580px', lineHeight: '1.5' }}>
                                Upload your resume here. The AI will analyze your experience and skills, map your target job role, and notify you instantly on the top bar as soon as matching Indian jobs are found!
                            </p>
                        </div>
                        
                        <div>
                            <input 
                                type="file" 
                                accept=".pdf,.docx" 
                                onChange={handleUploadAlertResume} 
                                ref={alertFileInputRef} 
                                style={{ display: 'none' }}
                            />
                            <button 
                                onClick={() => alertFileInputRef.current?.click()}
                                className="jm-btn-primary"
                                disabled={isUploadingAlertResume}
                                style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
                            >
                                {isUploadingAlertResume ? "🤖 Setting Up..." : "📤 Upload Resume & Start alerts"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Section */}
            <div className="jm-search-section" style={{ marginBottom: '40px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', maxWidth: '600px' }}>
                    <input 
                        type="text" 
                        placeholder="e.g. Frontend Developer, Data Scientist..."
                        value={searchRole}
                        onChange={(e) => setSearchRole(e.target.value)}
                        className="jm-search-input"
                        style={{ 
                            flex: 1, 
                            padding: '12px 16px', 
                            borderRadius: '8px', 
                            border: '1px solid var(--dashboard-border)', 
                            background: 'var(--dashboard-surface)', 
                            color: 'var(--dashboard-text)' 
                        }}
                    />
                    <button type="submit" className="jm-btn-primary" disabled={isSearching}>
                        {isSearching ? "Searching..." : "🔍 Search Jobs"}
                    </button>
                </form>
            </div>

            {/* Jobs Grid */}
            <div className="jm-jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {jobs.map(job => (
                    <motion.div 
                        key={job.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="jm-job-card"
                        style={{
                            background: 'var(--dashboard-surface)',
                            border: '1px solid var(--dashboard-border)',
                            borderRadius: '12px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <h3 style={{ margin: 0, color: 'var(--dashboard-text-strong)', fontSize: '1.2rem' }}>{job.title}</h3>
                                {job.logo && <img src={job.logo} alt="logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }} />}
                            </div>
                            <p style={{ margin: '0 0 8px 0', color: 'var(--dashboard-text)', fontWeight: '600' }}>{job.company}</p>
                            {job.postedDate && <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--dashboard-text-muted)' }}>⏱ Posted: {job.postedDate}</p>}
                            <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--dashboard-text-muted)' }}>📍 {job.location}</p>
                            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--dashboard-text-muted)' }}>💰 {job.salary}</p>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                                    <span key={idx} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        {skill}
                                    </span>
                                ))}
                                {job.requiredSkills.length > 4 && <span style={{ fontSize: '0.8rem', color: 'var(--dashboard-text-muted)' }}>+{job.requiredSkills.length - 4}</span>}
                            </div>
                        </div>
                        <button 
                            className="jm-btn-outline" 
                            style={{ width: '100%' }}
                            onClick={() => setSelectedJob(job)}
                        >
                            Upload Resume & Check Chances
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Modal for Job Details & Upload */}
            <AnimatePresence>
                {selectedJob && (
                    <motion.div 
                        className="jm-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.6)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            zIndex: 1000, padding: '20px'
                        }}
                        onClick={closeMenu}
                    >
                        <motion.div 
                            className="jm-modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                background: 'var(--dashboard-surface)',
                                border: '1px solid var(--dashboard-border)',
                                borderRadius: '16px',
                                width: '100%', maxWidth: '700px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                position: 'relative',
                                display: 'flex', flexDirection: 'column'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button 
                                onClick={closeMenu}
                                style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--dashboard-text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                            
                            <div style={{ padding: '30px' }}>
                                <h2 style={{ color: 'var(--dashboard-text-strong)', marginBottom: '8px' }}>{selectedJob.title}</h2>
                                <h4 style={{ color: 'var(--dashboard-text)', marginBottom: '8px' }}>at {selectedJob.company}</h4>
                                {selectedJob.postedDate && <p style={{ fontSize: '0.85rem', color: 'var(--dashboard-text-muted)', marginBottom: '24px' }}>⏱ Posted: {selectedJob.postedDate}</p>}

                                {!matchResult && (
                                    <div style={{ background: 'var(--dashboard-surface-strong)', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ marginBottom: '16px' }}>Upload your resume to check your chances</h3>
                                        <input 
                                            type="file" 
                                            accept=".pdf,.docx" 
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                            style={{ marginBottom: '16px' }}
                                        />
                                        <br/>
                                        <button 
                                            className="jm-btn-primary" 
                                            onClick={handleEvaluateChances}
                                            disabled={!file || isEvaluating}
                                            style={{ margin: '0 auto' }}
                                        >
                                            {isEvaluating ? "🤖 AI is analyzing..." : "🎯 Evaluate Chances"}
                                        </button>
                                    </div>
                                )}

                                {matchResult && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{ background: 'var(--dashboard-surface-strong)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                                            <div style={{
                                                width: '100px', height: '100px', borderRadius: '50%',
                                                background: `conic-gradient(${matchResult.matchPercentage >= 70 ? '#10b981' : matchResult.matchPercentage >= 40 ? '#f59e0b' : '#ef4444'} ${matchResult.matchPercentage}%, transparent 0)`,
                                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                position: 'relative'
                                            }}>
                                                <div style={{ width: '80px', height: '80px', background: 'var(--dashboard-surface-strong)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dashboard-text-strong)' }}>{matchResult.matchPercentage}%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 style={{ color: 'var(--dashboard-text-strong)', marginBottom: '4px' }}>Match Score</h3>
                                                <p style={{ color: 'var(--dashboard-text-muted)' }}>
                                                    {matchResult.matchPercentage >= 75 ? "Excellent Match! You have high chances." :
                                                     matchResult.matchPercentage >= 50 ? "Good Match. Consider improving a few areas." :
                                                     "Low Match. You may need more relevant skills."}
                                                </p>
                                            </div>
                                        </div>

                                        <h4 style={{ color: '#10b981', marginBottom: '8px' }}>✅ Key Strengths</h4>
                                        <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                                            {matchResult.whyItMatches?.map((str, i) => <li key={i} style={{ marginBottom: '4px' }}>{str}</li>)}
                                        </ul>

                                        <h4 style={{ color: '#ef4444', marginBottom: '8px' }}>❌ Missing Skills</h4>
                                        <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                                            {matchResult.missingSkills?.map((skill, i) => <li key={i} style={{ marginBottom: '4px' }}>{skill}</li>)}
                                        </ul>

                                        <h4 style={{ color: '#a855f7', marginBottom: '8px' }}>💡 Suggestions to Improve</h4>
                                        <ul style={{ paddingLeft: '20px' }}>
                                            {matchResult.improvementTips?.map((sug, i) => <li key={i} style={{ marginBottom: '4px' }}>{sug}</li>)}
                                        </ul>
                                        
                                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                            <a href={selectedJob.url || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(selectedJob.title + ' ' + selectedJob.company)}`} target="_blank" rel="noreferrer" className="jm-btn-primary" style={{ textDecoration: 'none' }}>
                                                Apply on {selectedJob.platform}
                                            </a>
                                            <button className="jm-btn-outline" onClick={() => { setMatchResult(null); setFile(null); }}>
                                                Check another resume
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                <div>
                                    <h4 style={{ color: 'var(--dashboard-text-strong)', marginBottom: '12px' }}>Job Description</h4>
                                    <div style={{ color: 'var(--dashboard-text)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                        {/* Remotive descriptions are often HTML, we could use dangerouslySetInnerHTML or ReactMarkdown. For safety, let's use a div with dangerouslySetInnerHTML if it has HTML tags, else just text */}
                                        <div dangerouslySetInnerHTML={{ __html: selectedJob.description }} className="jm-job-desc" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default JobMatcher;

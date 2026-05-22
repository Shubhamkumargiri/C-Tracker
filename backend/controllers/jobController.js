import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import pdfParse from './pdfWrapper.cjs';
const mammoth = require('mammoth');
const cheerio = require('cheerio');

async function scrapeLinkedInJobs(role) {
    try {
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(role)}&location=India&start=0`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
        if (!res.ok) return [];
        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs = [];
        $('.base-search-card').each((i, el) => {
            const title = $(el).find('.base-search-card__title').text().trim();
            const company = $(el).find('.base-search-card__subtitle').text().trim();
            const location = $(el).find('.job-search-card__location').text().trim() || "India";
            const url = $(el).find('.base-card__full-link').attr('href') || "";
            const postedDate = $(el).find('.job-search-card__listdate').text().trim() || "Recently";
            const logo = $(el).find('.artdeco-entity-image').attr('data-delayed-url') || $(el).find('.artdeco-entity-image').attr('src') || "";
            if (title && company) {
                jobs.push({
                    id: `linkedin_${Date.now()}_${i}`,
                    title,
                    company,
                    location,
                    salary: "Not specified",
                    platform: "LinkedIn",
                    requiredSkills: [role],
                    experienceLevel: "Varies",
                    logo,
                    postedDate,
                    url,
                    description: "View full details on LinkedIn."
                });
            }
        });
        return jobs;
    } catch (e) {
        console.error("LinkedIn scrape error:", e);
        return [];
    }
}
import { getGenAI, rotateKey } from '../utils/geminiHelper.js';
const fallback_models = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-flash-latest',
    'gemini-pro-latest',
    'gemini-3.1-pro-preview'
];

// Mock jobs database for the matcher
const MOCK_JOBS = [
    {
        id: "job_1",
        title: "Frontend Developer",
        company: "Google",
        location: "Bangalore, India (Remote)",
        salary: "₹15,000,000 - ₹25,000,000",
        platform: "LinkedIn",
        url: "https://www.linkedin.com/jobs/search/?keywords=Frontend%20Developer%20Google",
        postedDate: "2 days ago",
        requiredSkills: ["React", "JavaScript", "TypeScript", "Redux", "HTML/CSS"],
        experienceLevel: "Mid-Level",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png"
    },
    {
        id: "job_2",
        title: "Backend Engineer",
        company: "Amazon",
        location: "Hyderabad, India",
        salary: "₹18,000,000 - ₹30,000,000",
        platform: "Naukri",
        url: "https://www.naukri.com/backend-engineer-jobs",
        postedDate: "1 week ago",
        requiredSkills: ["Node.js", "Express", "MongoDB", "AWS", "Docker"],
        experienceLevel: "Senior",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/2048px-Amazon_icon.svg.png"
    },
    {
        id: "job_3",
        title: "Full Stack Developer",
        company: "Microsoft",
        location: "Remote India",
        salary: "₹20,000,000 - ₹35,000,000",
        platform: "Indeed",
        url: "https://in.indeed.com/jobs?q=Full+Stack+Developer+Microsoft",
        postedDate: "3 days ago",
        requiredSkills: ["React", "Node.js", "TypeScript", "SQL", "Azure"],
        experienceLevel: "Mid-Level",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png"
    },
    {
        id: "job_4",
        title: "React Developer Intern",
        company: "Cred",
        location: "Bangalore, India",
        salary: "₹50,000/mo",
        platform: "Internshala",
        url: "https://internshala.com/internships/react-internship/",
        postedDate: "Just now",
        requiredSkills: ["React", "JavaScript", "CSS", "Tailwind"],
        experienceLevel: "Entry-Level",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/CRED_Logo.png/220px-CRED_Logo.png"
    },
    {
        id: "job_5",
        title: "Data Scientist",
        company: "Netflix",
        location: "Remote India",
        salary: "₹30,000,000 - ₹50,000,000",
        platform: "LinkedIn",
        url: "https://www.linkedin.com/jobs/search/?keywords=Data%20Scientist%20Netflix",
        postedDate: "5 days ago",
        requiredSkills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas"],
        experienceLevel: "Senior",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
    }
];

export const fetchMockJobs = (req, res) => {
    res.status(200).json(MOCK_JOBS);
};

export const searchJobs = async (req, res) => {
    const { role } = req.query;
    if (!role) {
        return res.status(400).json({ error: "Role is required" });
    }
    
    try {
        let allJobs = [];

        // Fetch Remotive
        try {
            const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(role + " india")}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const mapped = (data.jobs || []).map(job => ({
                    id: String(job.id),
                    title: job.title,
                    company: job.company_name,
                    location: job.candidate_required_location || "Remote India",
                    salary: job.salary || "Not specified",
                    platform: "Remotive",
                    requiredSkills: job.tags || [],
                    experienceLevel: "Varies",
                    logo: job.company_logo || "",
                    postedDate: job.publication_date ? new Date(job.publication_date).toLocaleDateString() : "Recently",
                    description: job.description,
                    url: job.url
                }));
                allJobs = allJobs.concat(mapped);
            }
        } catch (e) { console.error("Remotive fetch error:", e); }

        // Fetch Jobicy
        try {
            const jobicyUrl = `https://jobicy.com/api/v2/remote-jobs?geo=india`;
            const jobicyResponse = await fetch(jobicyUrl);
            if (jobicyResponse.ok) {
                const data = await jobicyResponse.json();
                const mapped = (data.jobs || []).map(job => ({
                    id: String(job.id),
                    title: job.jobTitle,
                    company: job.companyName,
                    location: job.jobGeo || "Remote India",
                    salary: job.annualSalaryMin && job.annualSalaryMax ? `$${job.annualSalaryMin} - $${job.annualSalaryMax}` : "Not Specified",
                    platform: "Jobicy",
                    requiredSkills: job.jobIndustry ? [job.jobIndustry] : [],
                    experienceLevel: job.jobLevel || "Any",
                    logo: job.companyLogo || "",
                    url: job.url || "",
                    description: job.jobDescription || ""
                }));
                allJobs = allJobs.concat(mapped);
            }
        } catch (e) { console.error("Jobicy fetch error:", e); }

        // Fetch LinkedIn Jobs using Scraper
        const linkedInJobs = await scrapeLinkedInJobs(role);
        allJobs = allJobs.concat(linkedInJobs);

        // STRICT Filter for India Only
        let jobs = allJobs.filter(job => {
            if (!job.location) return false;
            const loc = job.location.toLowerCase();
            return loc.includes("india") || loc.includes("bangalore") || loc.includes("hyderabad") || loc.includes("mumbai") || loc.includes("pune") || loc.includes("chennai") || loc.includes("delhi") || loc.includes("gurgaon") || loc.includes("noida");
        });

        // Remove duplicates by title+company
        const uniqueJobsMap = new Map();
        for (const job of jobs) {
            const key = `${job.title}_${job.company}`.toLowerCase();
            if (!uniqueJobsMap.has(key)) {
                uniqueJobsMap.set(key, job);
            }
        }
        jobs = Array.from(uniqueJobsMap.values());

        // Return top 20 jobs
        res.status(200).json(jobs.slice(0, 20));
    } catch (error) {
        console.error("Job search error:", error);
        res.status(200).json([]);
    }
};

export const extractResumeText = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        const buffer = req.file.buffer;
        const mimetype = req.file.mimetype;
        const filename = req.file.originalname;
        let rawText = "";

        if (mimetype === 'application/pdf') {
            const pdfData = await pdfParse(buffer);
            rawText = pdfData.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            mimetype === 'application/msword' ||
            filename.endsWith('.docx')
        ) {
            const docxData = await mammoth.extractRawText({ buffer });
            rawText = docxData.value;
        } else {
            return res.status(400).json({ error: "Unsupported file type. Please upload a PDF or DOCX." });
        }

        if (!rawText || rawText.trim().length === 0) {
            return res.status(400).json({ error: "Could not extract text from document." });
        }
        res.status(200).json({ rawText });
    } catch (err) {
        console.error("Extract error:", err);
        res.status(500).json({ error: "Failed to extract text." });
    }
};

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const buffer = req.file.buffer;
        const mimetype = req.file.mimetype;
        const filename = req.file.originalname;
        const targetRole = req.body.targetRole || "Software Engineer";
        let rawText = "";

        // 1. Extract text based on file type
        if (mimetype === 'application/pdf') {
            const pdfData = await pdfParse(buffer);
            rawText = pdfData.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            mimetype === 'application/msword' ||
            filename.endsWith('.docx')
        ) {
            const docxData = await mammoth.extractRawText({ buffer });
            rawText = docxData.value;
        } else {
            return res.status(400).json({ error: "Unsupported file type. Please upload a PDF or DOCX." });
        }

        if (!rawText || rawText.trim().length === 0) {
            return res.status(400).json({ error: "Could not extract text from the document. It might be an image-based PDF." });
        }

        // 2. Fetch Real Jobs from Multiple APIs (Targeting India)
        const searchTerm = targetRole || "developer";
        let fetchedJobs = [];
        try {
            const [remotiveRes, jobicyRes, arbeitnowRes] = await Promise.allSettled([
                fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchTerm + " india")}`),
                fetch(`https://jobicy.com/api/v2/remote-jobs?geo=india`),
                fetch(`https://www.arbeitnow.com/api/job-board-api`)
            ]);

            let allJobs = [];

            // Parse Remotive
            if (remotiveRes.status === 'fulfilled') {
                const apiData = await remotiveRes.value.json();
                const mapped = (apiData.jobs || []).map(job => ({
                    id: `remotive_${job.id}`,
                    title: job.title,
                    company: job.company_name,
                    location: job.candidate_required_location || "Remote India",
                    salary: job.salary || "Not Specified",
                    platform: "Remotive",
                    requiredSkills: job.tags || [],
                    experienceLevel: "Any",
                    logo: job.company_logo || "",
                    postedDate: job.publication_date ? new Date(job.publication_date).toLocaleDateString() : "Recently",
                    url: job.url || "",
                    description: job.description || ""
                }));
                allJobs = allJobs.concat(mapped);
            }

            // Parse Jobicy
            if (jobicyRes.status === 'fulfilled') {
                const apiData = await jobicyRes.value.json();
                const mapped = (apiData.jobs || []).map(job => ({
                    id: `jobicy_${job.id}`,
                    title: job.jobTitle,
                    company: job.companyName,
                    location: job.jobGeo || "Remote India",
                    salary: job.annualSalaryMin && job.annualSalaryMax ? `$${job.annualSalaryMin} - $${job.annualSalaryMax}` : "Not Specified",
                    platform: "Jobicy",
                    requiredSkills: job.jobIndustry ? [job.jobIndustry] : [],
                    experienceLevel: job.jobLevel || "Any",
                    logo: job.companyLogo || "",
                    url: job.url || "",
                    description: job.jobDescription || ""
                }));
                allJobs = allJobs.concat(mapped);
            }

            // Parse Arbeitnow
            if (arbeitnowRes.status === 'fulfilled') {
                const apiData = await arbeitnowRes.value.json();
                const mapped = (apiData.data || []).map(job => ({
                    id: `arbeitnow_${job.slug}`,
                    title: job.title,
                    company: job.company_name,
                    location: job.location || "Remote",
                    salary: "Not Specified",
                    platform: "Arbeitnow",
                    requiredSkills: job.tags || [],
                    experienceLevel: "Any",
                    logo: "",
                    postedDate: job.created_at ? new Date(job.created_at * 1000).toLocaleDateString() : "Recently",
                    url: job.url || "",
                    description: job.description || ""
                }));
                allJobs = allJobs.concat(mapped);
            }

            // Fetch LinkedIn Jobs using Scraper
            const linkedInJobs = await scrapeLinkedInJobs(searchTerm);
            allJobs = allJobs.concat(linkedInJobs);

            // STRICT Filter for India Only
            const indiaJobs = allJobs.filter(job => {
                if (!job.location) return false;
                const loc = job.location.toLowerCase();
                // If it explicitly comes from jobicy geo=india or remotive 'india' search, 
                // we still verify the location string contains india to be safe,
                // or we accept it if it's explicitly parsed as 'Remote India' above
                return loc.includes("india") || loc.includes("bangalore") || loc.includes("hyderabad") || loc.includes("mumbai") || loc.includes("pune") || loc.includes("chennai") || loc.includes("delhi") || loc.includes("gurgaon") || loc.includes("noida");
            });

            // Remove duplicates by title+company
            const uniqueJobsMap = new Map();
            for (const job of indiaJobs) {
                const key = `${job.title}_${job.company}`.toLowerCase();
                if (!uniqueJobsMap.has(key)) {
                    uniqueJobsMap.set(key, job);
                }
            }

            // Return top 15 and strip massive descriptions
            fetchedJobs = Array.from(uniqueJobsMap.values()).slice(0, 15).map(j => {
                const { description, ...rest } = j;
                return rest;
            });

        } catch (apiErr) {
            console.error("Failed to fetch jobs from Multiple APIs:", apiErr);
            fetchedJobs = []; 
        }

        // 3. Initialize Gemini prompt
        const prompt = `You are an elite AI Technical Recruiter.
I have extracted the following raw text from a candidate's resume:
"""
${rawText.substring(0, 5000)} // Truncate to save tokens if massive
"""

The candidate has specified they are specifically looking for a job as a: **${targetRole}**.

Please analyze the resume. Output ONLY raw valid JSON matching this exact structure, with NO markdown formatting, NO backticks (\`\`\`json), and NO extra conversational text.

{
  "resumeAnalysis": {
    "name": "Candidate Name (extract or infer, 'Unknown' if missing)",
    "suggestedRole": "Overall Best Fit Job Title based on their skills AND their requested target role",
    "experienceLevel": "Entry-Level, Mid-Level, or Senior",
    "topSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
    "strengthScore": <number between 0 and 100 representing overall resume strength for the target role>
  }
}`;

        let success = false;
        let aiResult = null;

        for (const modelName of fallback_models) {
            try {
                const activeModel = getGenAI().getGenerativeModel({ model: modelName });
                let result = await activeModel.generateContent(prompt);
                let textResult = result.response.text();
                
                // Better JSON extraction regex
                const jsonMatch = textResult.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    aiResult = JSON.parse(jsonMatch[0]);
                    success = true;
                    break;
                } else {
                    throw new Error("No JSON found in response");
                }
            } catch (innerErr) {
                console.error(`Model ${modelName} failed in jobMatcher:`, innerErr.message);
                if (innerErr.message && (innerErr.message.includes('429') || innerErr.message.toLowerCase().includes('quota') || innerErr.message.toLowerCase().includes('exhausted'))) {
                    rotateKey();
                }
            }
        }

        if (!success || !aiResult) {
            return res.status(503).json({ error: "AI matching failed due to quota limits. Please try again." });
        }

        res.status(200).json({
            resumeAnalysis: aiResult.resumeAnalysis,
            rawText: rawText,
            jobs: fetchedJobs
        });

    } catch (error) {
        console.error("Error in uploadResume:", error);
        res.status(500).json({ error: "Failed to process resume." });
    }
};

export const checkJobMatch = async (req, res) => {
    try {
        const { rawText, job } = req.body;

        if (!rawText || !job) {
            return res.status(400).json({ error: "Missing required data" });
        }

        const prompt = `You are an AI Technical Recruiter. Evaluate the following candidate's resume text against a specific job posting.

Candidate Resume Text:
"""
${rawText.substring(0, 5000)}
"""

Job Details:
Title: ${job.title}
Company: ${job.company}
Skills Required: ${(job.requiredSkills || []).join(", ")}
Description: ${job.description || "N/A"}

Please evaluate how suitable this candidate is for this exact job role at this company.
Return the result strictly as a JSON object matching this structure:
{
  "matchPercentage": <number from 0 to 100>,
  "whyItMatches": ["<reason 1>", "<reason 2>"],
  "missingSkills": ["<skill 1>", "<skill 2>"],
  "improvementTips": ["<tip 1>", "<tip 2>"]
}

Ensure the response contains ONLY the raw parseable JSON object.`;

        let success = false;
        let aiResult = null;

        for (const modelName of fallback_models) {
            try {
                const activeModel = getGenAI().getGenerativeModel({ model: modelName });
                let result = await activeModel.generateContent(prompt);
                let textResult = result.response.text();
                
                // Better JSON extraction regex
                const jsonMatch = textResult.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    aiResult = JSON.parse(jsonMatch[0]);
                    success = true;
                    break;
                } else {
                    throw new Error("No JSON found in response");
                }
            } catch (innerErr) {
                console.error(`Model ${modelName} failed in checkJobMatch:`, innerErr.message);
                if (innerErr.message && (innerErr.message.includes('429') || innerErr.message.toLowerCase().includes('quota') || innerErr.message.toLowerCase().includes('exhausted'))) {
                    rotateKey();
                }
            }
        }

        if (!success || !aiResult) {
            return res.status(503).json({ error: "AI matching failed." });
        }

        res.status(200).json(aiResult);

    } catch (error) {
        console.error("Error in checkJobMatch:", error);
        res.status(500).json({ error: "Failed to evaluate job match." });
    }
};

import { getGenAI, rotateKey } from '../utils/geminiHelper.js';
import dotenv from 'dotenv';
dotenv.config();
const SYSTEM_PROMPT = `
You are CT ai (formerly Jarvis), an advanced AI career assistant integrated inside a developer productivity dashboard platform.
You operate as a smart AI system INSIDE the website and help users improve their technical skills, resumes, coding profiles, job readiness, and career growth.

You have access to live user context, including their GitHub, LeetCode, and Devpost analytics.

## 🧠 CORE PERSONALITY
* Intelligent
* Futuristic
* Motivational
* Professional
* Human-like
* Concise unless detailed explanation is requested

Speak like an advanced AI assistant similar to Jarvis from Iron Man but focused on career growth and productivity.

## 📝 STRICT FORMATTING RULES (CRITICAL)
Whenever you provide an analysis of a user's profile (like GitHub, LeetCode, or Devpost) or provide recommendations, you MUST ALWAYS use clean, structured Markdown formatting. 
NEVER output a massive wall of text.
Always use:
* **H3 Headers (###)** for distinct sections
* **Bullet Points (-)** for lists of stats
* **Bold Text (**text**)** to highlight key numbers

## 🤖 BEHAVIOR RULES
1. **Be Conversational & Concise**: If the user just says a simple greeting (like "hi", "hello", "hey"), ONLY reply with a short, friendly greeting and ask how you can help them. DO NOT give them a full profile overview or data dump unless they ask for it or ask for an analysis of their profile!
2. **On-Demand Insights**: ONLY provide deep actionable insights, data-driven analysis, or smart suggestions if the user's message warrants it or if they ask for advice/stats.
3. CRITICAL INSTRUCTION: NEVER output your internal reasoning, thought process, or explain what the user is asking. Do NOT use CoT or thinking blocks. ONLY provide the final, direct answer to the user.
`;

// Store chat sessions in memory
const chatSessions = new Map();

// We will iterate through these fallback models
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

export const chatWithCTAI = async (req, res) => {
    try {
        const { message, sessionId = 'default', context = {} } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        // Fetch context data if usernames exist
        let contextData = "";
        const port = process.env.PORT || 5000;
        
        if (context.github) {
            try {
                const ghRes = await fetch(`http://localhost:${port}/api/github/analytics/${encodeURIComponent(context.github)}`);
                if (ghRes.ok) {
                    const ghData = await ghRes.json();
                    contextData += `\nGitHub Data for ${context.github}: ${JSON.stringify(ghData)}`;
                }
            } catch(e) {}
        }
        
        if (context.leetcode) {
            try {
                const lcRes = await fetch(`http://localhost:${port}/api/leetcode/analytics/${encodeURIComponent(context.leetcode)}`);
                if (lcRes.ok) {
                    const lcData = await lcRes.json();
                    contextData += `\nLeetCode Data for ${context.leetcode}: ${JSON.stringify(lcData)}`;
                }
            } catch(e) {}
        }

        const currentTime = new Date().toLocaleString();
        const dynamicSystemPrompt = SYSTEM_PROMPT + `\n\n### SYSTEM CLOCK\nThe current real-world time is: ${currentTime}\n` + (contextData ? `\n\n### USER LIVE CONTEXT\n${contextData}` : "");

        try {
            let chatHistory = chatSessions.get(sessionId);
            
            if (!chatHistory) {
                chatHistory = [
                    { role: "user", parts: [{ text: "SYSTEM_INSTRUCTION: " + dynamicSystemPrompt }] },
                    { role: "model", parts: [{ text: "Understood. I have access to the user's dashboard context and am ready to assist." }] }
                ];
            } else if (contextData) {
                chatHistory.push({ role: "user", parts: [{ text: "[SYSTEM UPDATE: User current live context data:]\n" + contextData + "\n[Do not reply to this system message, just acknowledge internally.]" }] });
                chatHistory.push({ role: "model", parts: [{ text: "Context updated." }] });
            }

            chatHistory.push({ role: "user", parts: [{ text: message }] });

            let success = false;
            let responseText = "";

            for (const modelName of fallback_models) {
                try {
                    const activeModel = getGenAI().getGenerativeModel({ model: modelName });
                    const chat = activeModel.startChat({ history: chatHistory });
                    const result = await chat.sendMessage(message);
                    responseText = result.response.text();
                    success = true;
                    break;
                } catch (e) {
                    console.error(`Model ${modelName} failed in chatWithCTAI:`, e.message);
                    if (e.message && (e.message.includes('429') || e.message.toLowerCase().includes('quota') || e.message.toLowerCase().includes('exhausted'))) {
                        rotateKey();
                    }
                }
            }

            if (!success) {
                throw new Error("All fallback models failed.");
            }

            chatHistory.push({ role: "model", parts: [{ text: responseText }] });
            chatSessions.set(sessionId, chatHistory);

            res.status(200).json({ reply: responseText });
        } catch (innerError) {
            console.error("Gemini failed:", innerError.message);
            return res.status(200).json({ reply: "My cognitive clusters are currently exhausted by API quotas. Please try again in 60 seconds." });
        }
    } catch (error) {
        console.error("Error in CT ai chat:", error);
        res.status(500).json({ error: "Failed to communicate with CT ai." });
    }
};

export const enhanceText = async (req, res) => {
    try {
        const { text, section, targetRole } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: "Text to enhance is required." });
        }

        let success = false;

        const prompt = `You are an expert Resume Writer and ATS Optimizer. 
I have a draft text for the "${section}" section of my resume.
The job role I am targeting is: ${targetRole || 'Software Engineer'}.

Draft text: 
"""
${text}
"""

Rewrite this text to be highly professional, impactful, and strictly ATS-friendly for the target role. 
Rules:
1. Use strong action verbs.
2. Quantify achievements where possible (or make it easy to insert numbers).
3. Ensure relevant keywords for the target role are naturally integrated.
4. If it's a list of bullets, keep them as a bulleted list using hyphens.
5. Do NOT output any introductory or conversational text (e.g., "Here is your rewritten text:"). Output ONLY the raw rewritten text.`;

        let enhancedText = "";

        for (const modelName of fallback_models) {
            try {
                const activeModel = getGenAI().getGenerativeModel({ model: modelName });
                const result = await activeModel.generateContent(prompt);
                enhancedText = result.response.text();
                success = true;
                break;
            } catch (innerError) {
                console.error(`Model ${modelName} failed in enhanceText:`, innerError.message);
                if (innerError.message && (innerError.message.includes('429') || innerError.message.toLowerCase().includes('quota') || innerError.message.toLowerCase().includes('exhausted'))) {
                    rotateKey();
                }
            }
        }
        
        if (!success) {
            return res.status(503).json({ error: "AI quotas exhausted. Please try again later." });
        }

        res.status(200).json({ enhancedText });

    } catch (error) {
        console.error("Error in enhanceText:", error);
        res.status(500).json({ error: "Failed to enhance text." });
    }
};

export const checkResumeATS = async (req, res) => {
    try {
        const { resumeData, targetRole } = req.body;
        
        if (!resumeData) {
            return res.status(400).json({ error: "Resume data is required." });
        }

        let atsResult = "";
        let success = false;

        const prompt = `You are an elite Applicant Tracking System (ATS) and Senior Technical Recruiter.
Evaluate the following resume data against the target job role: ${targetRole || 'Software Engineer'}.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Provide a strict ATS evaluation in the exact JSON format below. Do NOT output any markdown, code blocks, or conversational text. Output ONLY raw parseable JSON.

{
  "score": <number between 0 and 100 representing the ATS match score>,
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "tips": [
    "Tip 1 for structural or content improvement",
    "Tip 2...",
    "Tip 3..."
  ]
}`;

            for (const modelName of fallback_models) {
                try {
                    const activeModel = getGenAI().getGenerativeModel({ model: modelName });
                    let result = await activeModel.generateContent(prompt);
                    let rawText = result.response.text();
                    
                    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        atsResult = jsonMatch[0];
                        // Validate JSON
                        JSON.parse(atsResult);
                        success = true;
                        break;
                    } else {
                        throw new Error("No JSON found in response");
                    }
                } catch (innerError) {
                    console.error(`Model ${modelName} failed in checkResumeATS:`, innerError.message);
                    if (innerError.message && (innerError.message.includes('429') || innerError.message.toLowerCase().includes('quota') || innerError.message.toLowerCase().includes('exhausted'))) {
                        rotateKey();
                    }
                }
            }
            
            if (!success) {
                return res.status(503).json({ error: "AI quotas exhausted. Please try again later." });
            }

        res.status(200).json(JSON.parse(atsResult));

    } catch (error) {
        console.error("Error in checkResumeATS:", error);
        res.status(500).json({ error: "Failed to perform ATS check." });
    }
};

export const improveFullResume = async (req, res) => {
    try {
        const { resumeData, targetRole } = req.body;
        
        if (!resumeData) {
            return res.status(400).json({ error: "Resume data is required." });
        }

        let improvedResult = "";
        let success = false;

        const prompt = `You are an elite Resume Writer and ATS Optimizer.
I am providing a JSON object containing my current resume details.
My target job role is: ${targetRole || 'Software Engineer'}.

Rewrite the resume text to dramatically improve its impact, professionalism, and ATS keyword density specifically for the target role.
- Keep the exact same JSON schema structure.
- Add high-value keywords to skills and descriptions.
- Use strong action verbs in experience and project bullets.
- Do NOT make up fake experiences or fake projects, just rewrite the existing ones powerfully.
- Return ONLY valid JSON, without any markdown formatting or conversational text.

Input Resume JSON:
${JSON.stringify(resumeData, null, 2)}
`;

        for (const modelName of fallback_models) {
            try {
                const activeModel = getGenAI().getGenerativeModel({ model: modelName });
                let result = await activeModel.generateContent(prompt);
                let rawText = result.response.text();
                
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    improvedResult = jsonMatch[0];
                    // Validate JSON
                    JSON.parse(improvedResult);
                    success = true;
                    break;
                } else {
                    throw new Error("No JSON found in response");
                }
            } catch (innerError) {
                console.error(`Model ${modelName} failed in improveFullResume:`, innerError.message);
                if (innerError.message && (innerError.message.includes('429') || innerError.message.toLowerCase().includes('quota') || innerError.message.toLowerCase().includes('exhausted'))) {
                    rotateKey();
                }
            }
        }
        
        if (!success) {
            return res.status(503).json({ error: "AI quotas exhausted. Please try again later." });
        }

        res.status(200).json(JSON.parse(improvedResult));

    } catch (error) {
        console.error("Error in improveFullResume:", error);
        res.status(500).json({ error: "Failed to improve resume." });
    }
};

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";
import { SAMPLE_JOBS, SAMPLE_CANDIDATES, PRE_SCREENING_RESULTS } from "./src/data.js";
import { JobDescription, Candidate, ScreeningResult } from "./src/types.js";

// Lazy-initialized Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Configure it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: "10mb" }));

  // In-memory data structures populated with baseline datasets
  let jobs: JobDescription[] = [...SAMPLE_JOBS];
  let candidates: Candidate[] = [...SAMPLE_CANDIDATES];
  let screeningResults: ScreeningResult[] = [...PRE_SCREENING_RESULTS];

  // ==================== API ROUTES ====================

  // Get all job descriptions
  app.get("/api/jobs", (req, res) => {
    res.json(jobs);
  });

  // Create a new job description
  app.post("/api/jobs", (req, res) => {
    const { title, department, experience, location, requiredSkills, preferredSkills, descriptionText, minSalary } = req.body;
    
    if (!title || !department || !requiredSkills || !descriptionText) {
      res.status(400).json({ error: "Missing required fields for job creation." });
      return;
    }

    const newJob: JobDescription = {
      id: `job-${Date.now()}`,
      title,
      department,
      experience: experience || "Not specified",
      location: location || "Remote",
      minSalary: minSalary || undefined,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(",").map((s: string) => s.trim()),
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills ? preferredSkills.split(",").map((s: string) => s.trim()) : []),
      descriptionText,
    };

    jobs.push(newJob);
    res.status(201).json(newJob);
  });

  // Get all candidates
  app.get("/api/candidates", (req, res) => {
    res.json(candidates);
  });

  // Parse raw resume file text or base64 data using Gemini-3.5-flash with structured JSON response
  app.post("/api/parse-resume", async (req, res) => {
    const { rawText, fileBase64, mimeType, fileName } = req.body;

    if (!rawText && !fileBase64) {
      res.status(400).json({ error: "Either rawText or fileBase64 data is required for extraction." });
      return;
    }

    try {
      const ai = getGeminiClient();
      let contents: any[] = [];
      const systemPromptText = `You are an elite automated applicant tracking systems parser. 
Carefully read the provided resume document and extract key professional traits in the requested JSON structure.
If some attributes like Phone are absent from the document, formulate a valid empty or fallback value such as "Not provided" or an empty string.

Required fields in the JSON response:
1. name: Full Name of the candidate.
2. email: Contact email address of the candidate. If not present, default to empty string.
3. phone: Contact telephone or mobile number. If not present, default to 'Not provided'.
4. skills: Array of technical tools, programming languages, methodologies, or soft skills present in the resume.
5. education: Highest academic credential, degree, university, and year if listed. Keep concise.
6. experienceSummary: A high-performance professional summary or overview of candidate's career span to showcase on dashboard (1-2 sentences).
7. extractedText: A cleanly formatted, transcribed full plain-text extraction of the entire resume. Transcribe all text, bullets, achievements, and experiences accurately. This field is essential for subsequent screening analysis and candidate Q&A chat.`;

      if (fileBase64) {
        const lowerMime = (mimeType || "").toLowerCase();
        const lowerName = (fileName || "").toLowerCase();

        if (lowerMime === "application/pdf" || lowerName.endsWith(".pdf")) {
          // Pass PDF inline directly to Gemini
          contents = [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: fileBase64,
              }
            },
            {
              text: systemPromptText + "\n\nPlease analyze, transcribe, and parse the attached PDF resume details."
            }
          ];
        } else if (
          lowerMime.includes("word") || 
          lowerMime.includes("officedocument") || 
          lowerName.endsWith(".docx")
        ) {
          // Extract text from DOCX using mammoth
          const buffer = Buffer.from(fileBase64, "base64");
          const extraction = await mammoth.extractRawText({ buffer });
          const textExtract = extraction.value || "Empty Word Document";

          contents = [
            {
              text: `${systemPromptText}

[RAW TEXT EXTRACTED FROM DOCX RESUME]
"""
${textExtract}
"""`
            }
          ];
        } else {
          // Fallback / plain text (TXT, MD, etc.)
          const textExtract = Buffer.from(fileBase64, "base64").toString("utf-8");
          contents = [
            {
              text: `${systemPromptText}

[RAW TEXT EXTRACTED FROM RESUME FILE]
"""
${textExtract}
"""`
            }
          ];
        }
      } else {
        // Old rawText copy-paste format
        contents = [
          {
            text: `${systemPromptText}

[RAW TEXT PASTE]
"""
${rawText}
"""`
          }
        ];
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Full Name of the candidate." },
              email: { type: Type.STRING, description: "Contact email address of the candidate. If not present, default to empty string." },
              phone: { type: Type.STRING, description: "Contact telephone or mobile number. If not present, default to 'Not provided'." },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of technical tools, programming languages, methodologies, or soft skills present."
              },
              education: { type: Type.STRING, description: "Highest academic credential, degree, university, and year if listed. Keep concise." },
              experienceSummary: { type: Type.STRING, description: "A high-performance professional summary or overview of candidate's career span to showcase on dashboard." },
              extractedText: { type: Type.STRING, description: "Plain-text transcription/extraction of the full resume text details." }
            },
            required: ["name", "email", "phone", "skills", "education", "experienceSummary", "extractedText"]
          }
        }
      });

      const responseText = response.text ? response.text.trim() : "{}";
      const parsedData = JSON.parse(responseText);

      // Secure fallbacks
      if (!parsedData.extractedText) {
        parsedData.extractedText = rawText || "AI Parsed Candidate Details";
      }

      res.status(200).json(parsedData);
    } catch (err: any) {
      console.error("Gemini Resume Parsing Error:", err);
      res.status(500).json({ error: "Failed to automatically parse resume details: " + (err.message || String(err)) });
    }
  });

  // Create a new candidate (uploads or paste text)
  app.post("/api/candidates", (req, res) => {
    const { name, email, phone, skills, experienceSummary, education, rawResumeText } = req.body;

    if (!name || !email || !rawResumeText) {
      res.status(400).json({ error: "Candidate name, email, and resume content are required." });
      return;
    }

    const newCandidate: Candidate = {
      id: `cand-${Date.now()}`,
      name,
      email,
      phone: phone || "Not provided",
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map((s: string) => s.trim()) : []),
      experienceSummary: experienceSummary || "No summary provided",
      education: education || "Self-educated / Not specified",
      rawResumeText,
      createdAt: new Date().toISOString(),
    };

    candidates.push(newCandidate);
    res.status(201).json(newCandidate);
  });

  // Delete a candidate
  app.delete("/api/candidates/:id", (req, res) => {
    const { id } = req.params;
    candidates = candidates.filter((c) => c.id !== id);
    screeningResults = screeningResults.filter((s) => s.candidateId !== id);
    res.json({ success: true, message: "Candidate and associated screening reports removed." });
  });

  // Get all screening matches
  app.get("/api/screening-results", (req, res) => {
    res.json(screeningResults);
  });

  // Trigger Resume Screening Evaluation via Gemini-3.5-flash
  app.post("/api/screen", async (req, res) => {
    const { candidateId, jobId } = req.body;

    if (!candidateId || !jobId) {
      res.status(400).json({ error: "candidateId and jobId are required to execute dynamic screening." });
      return;
    }

    const candidate = candidates.find((c) => c.id === candidateId);
    const job = jobs.find((j) => j.id === jobId);

    if (!candidate || !job) {
      res.status(404).json({ error: "Candidate or Job Description not found." });
      return;
    }

    try {
      const ai = getGeminiClient();

      // Formulate detailed grading instruction
      const prompt = `You are an expert HR Talent Acquisition Specialist and Technical Recruiting Manager.
Analyze the following CANDIDATE RESUME against the requirements of the specified JOB DESCRIPTION.

[JOB DESCRIPTION]
Title: ${job.title}
Department: ${job.department}
Location: ${job.location}
Required Skills: ${job.requiredSkills.join(", ")}
Preferred Skills: ${job.preferredSkills.join(", ")}
Experience Required: ${job.experience}
Role Details: ${job.descriptionText}

[CANDIDATE RESUME]
Name: ${candidate.name}
Email: ${candidate.email}
Baseline Skills: ${candidate.skills.join(", ")}
Education: ${candidate.education}
Career Summary: ${candidate.experienceSummary}

Raw Resume Text:
"""
${candidate.rawResumeText}
"""

Evaluate carefully across four dimensions (overall fit, technical skills alignment, years of relevant experience depth, and educational background).
Assign a granular score (0 to 100) for each dimension.
Identify precisely which requested skills (both required & preferred) the candidate possesses and which guidelines they lack.
Generate three highly actionable, respectful candidate strengths and three potential structural gaps/weaknesses.
Wield a professional, objective tone in your final recommendation.
Suggest three targeted technical/behavior interview queries based directly on their career elements.
Produce the final evaluation as a JSON object adhering exactly to the mandated target schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER, description: "Composite ranking score from 0 (completely unmatched) to 100 (exemplary match)." },
              skillsMatchScore: { type: Type.INTEGER, description: "Relevance score focusing strictly on technical skills and alignment (0 to 100)." },
              experienceScore: { type: Type.INTEGER, description: "Score measuring the matching relevance and seniority of experience (0 to 100)." },
              educationScore: { type: Type.INTEGER, description: "Score mapping credential fit and certifications (0 to 100)." },
              matchedSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of skills matched in candidate resume that were mentioned in job requirements."
              },
              missingSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of key required or preferred skills requested by the job description but not clearly visible in the resume."
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Three clear, objective technical or qualitative strengths this candidate has."
              },
              weaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Three practical weaknesses, gaps, or areas needing close inspection."
              },
              recommendation: {
                type: Type.STRING,
                description: "A solid, professional concluding recommendation explaining fit, candidate vibe, and recommended path."
              },
              suggestedQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Three high-utility technical or situational questions tailored for an interview stage."
              },
              status: {
                type: Type.STRING,
                description: "The matching category. Must be one of: 'Qualified', 'Needs Interview', or 'Not Suitable'."
              }
            },
            required: [
              "overallScore", "skillsMatchScore", "experienceScore", "educationScore",
              "matchedSkills", "missingSkills", "strengths", "weaknesses", "recommendation",
              "suggestedQuestions", "status"
            ]
          }
        }
      });

      const responseText = response.text ? response.text.trim() : "{}";
      const resultData = JSON.parse(responseText);

      // Cast parameters to match schema requirements
      const finalReport: ScreeningResult = {
        candidateId,
        jobId,
        overallScore: typeof resultData.overallScore === "number" ? resultData.overallScore : 70,
        skillsMatchScore: typeof resultData.skillsMatchScore === "number" ? resultData.skillsMatchScore : 70,
        experienceScore: typeof resultData.experienceScore === "number" ? resultData.experienceScore : 70,
        educationScore: typeof resultData.educationScore === "number" ? resultData.educationScore : 70,
        matchedSkills: Array.isArray(resultData.matchedSkills) ? resultData.matchedSkills : [],
        missingSkills: Array.isArray(resultData.missingSkills) ? resultData.missingSkills : [],
        strengths: Array.isArray(resultData.strengths) ? resultData.strengths : ["Strong core focus"],
        weaknesses: Array.isArray(resultData.weaknesses) ? resultData.weaknesses : ["Gaps in documentation"],
        recommendation: resultData.recommendation || "Completed evaluation.",
        suggestedQuestions: Array.isArray(resultData.suggestedQuestions) ? resultData.suggestedQuestions : ["Tell us about your background."],
        status: ["Qualified", "Needs Interview", "Not Suitable"].includes(resultData.status) 
          ? resultData.status 
          : "Needs Interview"
      };

      // Upsert into our local in-memory store
      screeningResults = screeningResults.filter(
        (val) => !(val.candidateId === candidateId && val.jobId === jobId)
      );
      screeningResults.push(finalReport);

      res.status(200).json(finalReport);
    } catch (err: any) {
      console.error("Gemini Screening API Error:", err);
      res.status(500).json({ error: "Screening matching failed: " + (err.message || String(err)) });
    }
  });

  // Candidate Q&A Chat Endpoint asking detailed inquiries about candidate elements
  app.post("/api/chat", async (req, res) => {
    const { candidateId, question, messages } = req.body;

    if (!candidateId || !question) {
      res.status(400).json({ error: "candidateId and question text are required." });
      return;
    }

    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) {
      res.status(404).json({ error: "Candidate not found." });
      return;
    }

    try {
      const ai = getGeminiClient();

      // Include conversation history up to previous 10 messages for stateful feel
      const recentHistory = Array.isArray(messages) ? messages.slice(-10) : [];
      const historyContext = recentHistory
        .map((m: any) => `${m.sender === "user" ? "User" : "AI Assistant"}: ${m.text}`)
        .join("\n");

      const promptSystem = `You are an executive recruiter assistant. Review the following candidate's details and answer the question objective and concisely, only drawing from realities of the candidate resume profile. If the details do not suggest an answer, politely formulate a professional estimate or indicate what was omitted.

CANDIDATE INFO:
Name: ${candidate.name}
Email: ${candidate.email}
Skills: ${candidate.skills.join(", ")}
Education: ${candidate.education}
Career Summary: ${candidate.experienceSummary}

RAW RESUME DETAILS:
"""
${candidate.rawResumeText}
"""

[CONVERSATION HISTORY]
${historyContext}

[NEW QUESTION]
User: ${question}

Response (professional, clear visual breakdown if appropriate, concise):`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptSystem,
      });

      const responseText = result.text ? result.text.trim() : "Unable to formulate a reply about this resume.";
      res.json({ text: responseText });
    } catch (err: any) {
      console.error("Gemini Chat API Error:", err);
      res.status(500).json({ error: "Conversation Q&A failed: " + (err.message || String(err)) });
    }
  });

  // Reset database back to hardcoded samples
  app.post("/api/reset", (req, res) => {
    jobs = [...SAMPLE_JOBS];
    candidates = [...SAMPLE_CANDIDATES];
    screeningResults = [...PRE_SCREENING_RESULTS];
    res.json({ success: true, message: "System state reseeded successfully." });
  });

  // ==================== VITE / STATIC FILE SERVING ====================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve HTML entry for SPA routing index
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Resume Screening System backend running locally on port ${PORT}`);
  });
}

startServer();

export interface JobDescription {
  id: string;
  title: string;
  department: string;
  experience: string;
  requiredSkills: string[];
  preferredSkills: string[];
  descriptionText: string;
  minSalary?: string;
  location: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experienceSummary: string;
  education: string;
  rawResumeText: string;
  createdAt: string;
}

export interface ScreeningResult {
  candidateId: string;
  jobId: string;
  overallScore: number; // 0 - 100
  skillsMatchScore: number; // 0 - 100
  experienceScore: number; // 0 - 100
  educationScore: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  suggestedQuestions: string[];
  status: 'Qualified' | 'Needs Interview' | 'Not Suitable';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

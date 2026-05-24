import React, { useState } from 'react';
import { Candidate } from '../types';
import { User, Mail, Phone, Plus, X, Award, FileText, Globe, AlertCircle, Calendar, Upload, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface CandidatePanelProps {
  candidates: Candidate[];
  selectedCandidateId: string;
  onSelectCandidate: (id: string) => void;
  onAddCandidate: (candidateData: Omit<Candidate, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteCandidate: (id: string) => Promise<void>;
}

export default function CandidatePanel({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onAddCandidate,
  onDeleteCandidate,
}: CandidatePanelProps) {
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [rawResumeText, setRawResumeText] = useState('');
  
  // File Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setUploadedFileName(file.name);
    setError('');
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result;
      if (result instanceof ArrayBuffer) {
        try {
          // Convert ArrayBuffer to Base64 in chunks to prevent stack overflow for large files
          const bytes = new Uint8Array(result);
          let binary = '';
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);

          let mimeType = file.type || '';
          const fileName = file.name.toLowerCase();

          if (!mimeType) {
            if (fileName.endsWith('.pdf')) {
              mimeType = 'application/pdf';
            } else if (fileName.endsWith('.docx')) {
              mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            } else if (fileName.endsWith('.doc')) {
              mimeType = 'application/msword';
            } else if (fileName.endsWith('.txt')) {
              mimeType = 'text/plain';
            } else if (fileName.endsWith('.md')) {
              mimeType = 'text/markdown';
            }
          }

          await triggerAIParsing(base64, mimeType, file.name);
        } catch (err: any) {
          console.error("FileReader conversion error:", err);
          setError('Failed to process the uploaded file correctly.');
          setIsParsing(false);
        }
      } else {
        setError('Failed to parse uploaded binary format.');
        setIsParsing(false);
      }
    };
    reader.onerror = () => {
      setError('Could not read the uploaded file correctly.');
      setIsParsing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const triggerAIParsing = async (fileBase64: string, mimeType: string, fileName: string) => {
    setIsParsing(true);
    setError('');
    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileBase64, mimeType, fileName }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'AI Parse endpoint responded with error.');
      }

      const parsed = await res.json();
      
      // Auto-populate inputs
      if (parsed.name) setName(parsed.name);
      if (parsed.email) setEmail(parsed.email);
      if (parsed.phone) setPhone(parsed.phone);
      if (parsed.education) setEducation(parsed.education);
      if (parsed.skills) {
        const skillsString = Array.isArray(parsed.skills) 
          ? parsed.skills.join(', ') 
          : parsed.skills;
        setSkills(skillsString);
      }
      if (parsed.experienceSummary) setExperienceSummary(parsed.experienceSummary);
      if (parsed.extractedText) setRawResumeText(parsed.extractedText);
    } catch (err: any) {
      setError('AI auto-extraction encountered an issue: ' + (err.message || String(err)) + '. You can still type details manually.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !rawResumeText) {
      setError('Please provide Name, Email, and Resume Content.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await onAddCandidate({
        name,
        email,
        phone: phone || 'Not provided',
        skills: skillsArray,
        experienceSummary: experienceSummary || 'Self-pasted profile',
        education: education || 'Not specified',
        rawResumeText,
      });

      // Clear input fields
      setName('');
      setEmail('');
      setPhone('');
      setEducation('');
      setSkills('');
      setExperienceSummary('');
      setRawResumeText('');
      setUploadedFileName(null);
      setIsAddingCandidate(false);
    } catch (err: any) {
      setError(err.message || 'Failed to submit candidate profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPasteSample = () => {
    setName('Julian Foster');
    setEmail('julian.f@devspace.org');
    setPhone('+1 (555) 765-4321');
    setEducation('B.S. in Software Engineering - University of Texas (2020)');
    setSkills('React, TypeScript, CSS, Node.js, RESTful APIs, Git, PostgreSQL');
    setExperienceSummary('Frontend engineer with 3+ years experience building polished responsive client portals. Focused on React and Tailwind components.');
    setRawResumeText(`JULIAN FOSTER
Email: julian.f@devspace.org | Phone: +1 (555) 765-4321

SUMMARY:
Detail-oriented Frontend Specialist with 3 years of building high performance React dashboards. Skilled in single-screen responsive UX designs, state tuning, and API consumption.

TECHNICAL POWERHOUSE:
- Frontend: React, Redux, Tailwind CSS, TypeScript, JavaScript
- Backend: Basic Node.js, Express, PostgreSQL
- Tools: Git, GitHub, VS Code, Figma, Vite

WORK ARCHIVES:
Frontend Engineer | DevSpace | 2021 - Present
- Engineered high-traffic client portals utilizing React and Tailwind CSS.
- Handled API pipelines for RESTful interfaces.
- Reduced overall client bundle size by 30% through dead code elimination.

EDUCATION:
University of Texas, Austin
Degree: B.S. in Software Engineering (Graduated 2020)`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-100">Candidates</h2>
        </div>
        <button
          onClick={() => setIsAddingCandidate(!isAddingCandidate)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-all"
        >
          {isAddingCandidate ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Candidate</span>
            </>
          )}
        </button>
      </div>

      {isAddingCandidate ? (
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="flex justify-between items-center text-xs font-medium text-slate-300">
            <span>Import Resumes & Profile Info</span>
            <button
              type="button"
              onClick={handleQuickPasteSample}
              className="text-indigo-400 hover:text-indigo-300 underline text-[11px] font-semibold"
            >
              Fill Sample Data
            </button>
          </div>

          {/* Interactive Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer relative ${
              isDragging
                ? 'border-indigo-500 bg-indigo-950/25'
                : uploadedFileName
                ? 'border-emerald-600/65 bg-slate-950/40'
                : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
            }`}
          >
            <input
              type="file"
              id="resume-file-upload"
              accept=".txt,.md,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="resume-file-upload" className="cursor-pointer block">
              <div className="flex flex-col items-center justify-center space-y-2">
                {isParsing ? (
                  <div className="p-3 bg-indigo-950/60 rounded-full border border-indigo-800 text-indigo-400 animate-spin">
                    <Sparkles className="w-5 h-5" />
                  </div>
                ) : uploadedFileName ? (
                  <div className="p-3 bg-emerald-950/40 rounded-full border border-emerald-800 text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-slate-400">
                    <Upload className="w-5 h-5" />
                  </div>
                )}

                <div className="text-xs text-slate-200">
                  {isParsing ? (
                    <span className="text-indigo-400 font-semibold animate-pulse">Gemini parsing resume components...</span>
                  ) : uploadedFileName ? (
                    <span className="text-emerald-400 font-semibold">Loaded: {uploadedFileName}</span>
                  ) : (
                    <span>Drag & drop candidate CV here or <span className="text-indigo-400 underline">browse</span></span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  Supports .txt, .md, .pdf, or .docx text scans
                </div>
              </div>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-200 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3 text-slate-200">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder={isParsing ? "Extracting..." : "e.g., Jane Doe"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
                disabled={isParsing}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email ID *</label>
                <input
                  type="email"
                  placeholder={isParsing ? "Extracting..." : "jane.doe@domain.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                  disabled={isParsing}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder={isParsing ? "Extracting..." : "+1 (555) 000-0000"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={isParsing}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Education Credentials</label>
              <input
                type="text"
                placeholder={isParsing ? "Extracting..." : "e.g., M.S. in Computer Science - Ivy University"}
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={isParsing}
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Parsed Skills (comma separated)</label>
              <input
                type="text"
                placeholder={isParsing ? "Extracting..." : "React, CSS, Go, TypeScript"}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={isParsing}
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Professional Experience Summary</label>
              <input
                type="text"
                placeholder={isParsing ? "Extracting..." : "e.g., Software Dev with 4 years building concurrent APIs..."}
                value={experienceSummary}
                onChange={(e) => setExperienceSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={isParsing}
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Raw Resume Text * (Used for Gemini Context)</label>
              <textarea
                rows={5}
                placeholder="Paste or upload text contents to fill this field automatically..."
                value={rawResumeText}
                onChange={(e) => setRawResumeText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono"
                required
                disabled={isParsing}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isParsing}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Importing Candidate...' : 'Create Candidate Profile'}
          </button>
        </form>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {candidates.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No candidates registered. Please add a candidate profile to screen!
            </div>
          ) : (
            candidates.map((candidate) => {
              const isSelected = candidate.id === selectedCandidateId;
              const formattedDate = new Date(candidate.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <motion.div
                  key={candidate.id}
                  onClick={() => onSelectCandidate(candidate.id)}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative group ${
                    isSelected
                      ? 'border-indigo-500 bg-slate-950/80 shadow-md ring-1 ring-indigo-500/20'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-100">{candidate.name}</h3>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                        <span className="truncate">{candidate.email}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCandidate(candidate.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 rounded hover:bg-slate-900"
                      title="Delete Candidate"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 italic">
                    "{candidate.experienceSummary}"
                  </p>

                  <div className="flex items-center space-x-1 mt-2.5 text-[10px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    <span>Added {formattedDate}</span>
                  </div>

                  {/* Skills tags list */}
                  <div className="flex flex-wrap gap-1 mt-3.5 pt-2 border-t border-slate-900">
                    {candidate.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] bg-indigo-950/30 border border-slate-800/80 text-indigo-300 px-1.5 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 4 && (
                      <span className="text-[10px] bg-slate-900 text-slate-500 px-1 py-0.5 rounded">
                        +{candidate.skills.length - 4}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

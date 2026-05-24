import React, { useState, useEffect } from 'react';
import { JobDescription, Candidate, ScreeningResult, ChatMessage } from '../types';
import { 
  Sparkles, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  RefreshCw, 
  MessageSquare,
  ThumbsUp, 
  ThumbsDown, 
  Award,
  BookOpen,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface EvaluationDashboardProps {
  selectedJob: JobDescription | null;
  selectedCandidate: Candidate | null;
  screeningResult: ScreeningResult | null;
  onScreen: (candId: string, jobId: string) => Promise<void>;
  isScreening: boolean;
  onSendMessage: (candId: string, question: string) => Promise<string>;
}

export default function EvaluationDashboard({
  selectedJob,
  selectedCandidate,
  screeningResult,
  onScreen,
  isScreening,
  onSendMessage,
}: EvaluationDashboardProps) {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Clear or load chat histories when candidate changes
  useEffect(() => {
    if (selectedCandidate) {
      setChatMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hi there! I have parsed ${selectedCandidate.name}'s resume context. Ask me anything about their qualifications, project details, or potential matching concerns.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else {
      setChatMessages([]);
    }
  }, [selectedCandidate]);

  if (!selectedJob || !selectedCandidate) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="p-4 bg-slate-950 rounded-full border border-slate-800 text-indigo-400 mb-4 animate-pulse">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">Matching Canvas</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-2">
          Select both a Job Position listed on the left and a Candidate profile on the right to trigger live AI resume screening and semantic ranking.
        </p>
      </div>
    );
  }

  const handleScreeningTrigger = () => {
    onScreen(selectedCandidate.id, selectedJob.id);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userMsgText = chatInput.trim();
    setChatInput('');
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const responseText = await onSendMessage(selectedCandidate.id, userMsgText);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Sorry, we hit an issue querying the model: ${err.message || String(err)}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Prepare chart data if result exists
  const scoreData = screeningResult
    ? [
        { subject: 'Overall', score: screeningResult.overallScore, fullMark: 100 },
        { subject: 'Skills Alignment', score: screeningResult.skillsMatchScore, fullMark: 100 },
        { subject: 'Experience Fit', score: screeningResult.experienceScore, fullMark: 100 },
        { subject: 'Education Match', score: screeningResult.educationScore, fullMark: 100 },
      ]
    : [];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Qualified':
        return 'bg-emerald-950/60 border border-emerald-800 text-emerald-300';
      case 'Needs Interview':
        return 'bg-amber-950/60 border border-amber-800 text-amber-300';
      case 'Not Suitable':
        return 'bg-rose-950/60 border border-rose-800 text-rose-300';
      default:
        return 'bg-slate-800 border border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Setup Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <div className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase mb-1">
              Active Evaluation Frame
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-200 truncate">{selectedCandidate.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium text-indigo-300 truncate">{selectedJob.title}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Skills requested: {selectedJob.requiredSkills.slice(0, 5).join(', ')}
              {selectedJob.requiredSkills.length > 5 && '...'}
            </div>
          </div>
          
          <div className="flex md:justify-end gap-3">
            <button
              onClick={handleScreeningTrigger}
              disabled={isScreening}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg ${
                isScreening 
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : screeningResult 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/10'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-500/10'
              }`}
            >
              {isScreening ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                  <span>AI Parsing Resume...</span>
                </>
              ) : screeningResult ? (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Re-Evaluate Alignment</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200 animate-bounce" />
                  <span>Execute Gemini Screening</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isScreening ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="p-5 bg-indigo-950/40 rounded-full border border-indigo-800 text-indigo-300 shrink-0">
              <Cpu className="w-8 h-8 animate-spin" />
            </div>
            <div className="absolute top-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full leading-none">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h4 className="text-slate-100 font-semibold text-sm">Deep Generative Evaluation Active</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5">
              Gemini is matching resume details, scoring core metrics, and evaluating credential compliance with high precision semantic weights.
            </p>
          </div>
        </div>
      ) : screeningResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Metric Scores */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            
            {/* Visual Ranking Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col items-center justify-center text-center">
              <div className="text-xs text-slate-400 font-medium self-start mb-3">Matching Matrix Score</div>
              
              <div className="relative flex items-center justify-center w-36 h-36">
                {/* Score Dial Wrapper */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#4f46e5"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * screeningResult.overallScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-100">{screeningResult.overallScore}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Overall Match</span>
                </div>
              </div>

              <span className={`mt-5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusBadgeClass(screeningResult.status)}`}>
                {screeningResult.status}
              </span>
            </div>

            {/* Radar representation charts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between align-middle min-h-[220px]">
              <div className="text-xs text-slate-400 font-medium mb-1">Functional Dimensions</div>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={scoreData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#6366f1"
                      fill="#4f46e5"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skills Compare Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1">
              <div className="text-xs text-slate-400 font-medium mb-3">Skills Correlation</div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Matched Skills ({screeningResult.matchedSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {screeningResult.matchedSkills.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">No direct requirement match.</span>
                    ) : (
                      screeningResult.matchedSkills.map((sk) => (
                        <span key={sk} className="text-[10px] bg-emerald-950/40 border border-emerald-900 text-emerald-300 px-2 py-0.5 rounded">
                          {sk}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-medium mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Gaps & Missing Skills ({screeningResult.missingSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {screeningResult.missingSkills.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">None identified (All covered!)</span>
                    ) : (
                      screeningResult.missingSkills.map((sk) => (
                        <span key={sk} className="text-[10px] bg-rose-950/40 border border-rose-900 text-rose-300 px-2 py-0.5 rounded">
                          {sk}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Generative Summaries & Interactive Recruiter Chat */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Recommendation Analysis Tabs / Bento Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
                  <Award className="w-4 h-4" />
                  <span>Synthesized Gemini Recommendation</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {screeningResult.recommendation}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <div className="flex items-center space-x-1 px-1 py-1 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-2">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Candidate Strengths</span>
                  </div>
                  <ul className="space-y-1.5">
                    {screeningResult.strengths.map((str, idx) => (
                      <li key={idx} className="text-slate-300 text-xs flex items-start gap-1.5">
                        <span className="text-[9px] mt-1 bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center space-x-1 px-1 py-1 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-2">
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Areas of Focus / Gaps</span>
                  </div>
                  <ul className="space-y-1.5">
                    {screeningResult.weaknesses.map((weak, idx) => (
                      <li key={idx} className="text-slate-300 text-xs flex items-start gap-1.5">
                        <span className="text-[9px] mt-1 bg-amber-500/20 text-amber-400 font-bold px-1 rounded">!</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Target Interview Questions */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Suggested Candidate Inquiries</span>
                </div>
                <div className="space-y-2">
                  {screeningResult.suggestedQuestions.map((q, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg text-slate-300 text-xs hover:border-slate-700 transition-colors">
                      <span className="text-indigo-400 font-medium inline-block mr-1">Q{idx + 1}:</span> {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recruiter Instant Deep-Dive Chat */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[380px]">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-100 uppercase tracking-wider">Candidate AI Recruiter Assistant</span>
                </div>
                <span className="text-[10px] text-slate-500 italic">Stateful context: {selectedCandidate.name}</span>
              </div>

              {/* Message loop container */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-3 max-h-[250px]">
                {chatMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs flex flex-col ${
                        isUser 
                          ? 'bg-indigo-600 text-slate-100 rounded-tr-none' 
                          : 'bg-slate-950 text-slate-300 border border-slate-800 rounded-tl-none'
                      }`}>
                        <span>{msg.text}</span>
                        <span className={`text-[9px] mt-1 self-end ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl rounded-tl-none px-3 py-2 text-xs text-slate-400 flex items-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
                      <span>Digesting resume content...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., 'Does this candidate have experience relocatibility?' or 'Describe their Go experience.'"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !chatInput.trim()}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-xl flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-indigo-950/30 rounded-full border border-indigo-800 text-indigo-400 mb-3 animate-pulse">
            <Cpu className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">Alignment screening pending</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1.5">
            Click the 'Execute Gemini Screening' button above. The LLM will parse the candidate's raw professional experience against this vacancy profile.
          </p>
        </div>
      )}
    </div>
  );
}

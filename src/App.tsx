import React, { useState, useEffect } from 'react';
import { JobDescription, Candidate, ScreeningResult } from './types';
import JobPanel from './components/JobPanel';
import CandidatePanel from './components/CandidatePanel';
import EvaluationDashboard from './components/EvaluationDashboard';
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Award,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>([]);

  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');

  const [isScreening, setIsScreening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch all initial data
  const loadStateData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [jobsRes, candidatesRes, resultsRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/candidates'),
        fetch('/api/screening-results'),
      ]);

      if (!jobsRes.ok || !candidatesRes.ok || !resultsRes.ok) {
        throw new Error('Some API resources failed to retrieve.');
      }

      const jobsData = await jobsRes.json();
      const candidatesData = await candidatesRes.json();
      const resultsData = await resultsRes.json();

      setJobs(jobsData);
      setCandidates(candidatesData);
      setScreeningResults(resultsData);

      // Pre-select first items if empty state
      if (jobsData.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsData[0].id);
      }
      if (candidatesData.length > 0 && !selectedCandidateId) {
        setSelectedCandidateId(candidatesData[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not fetch recruiter data models.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStateData();
  }, []);

  // Post a new Job listing vacancy
  const handleAddJob = async (jobData: Omit<JobDescription, 'id'>) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to list job position.');
      }
      const newJob = await response.json();
      setJobs((prev) => [...prev, newJob]);
      setSelectedJobId(newJob.id);
      setStatusMessage(`Job position "${newJob.title}" listed successfully.`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed code connection.');
      throw err;
    }
  };

  // Add Candidate Profile CV
  const handleAddCandidate = async (candData: Omit<Candidate, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit candidate profile.');
      }
      const newCand = await response.json();
      setCandidates((prev) => [...prev, newCand]);
      setSelectedCandidateId(newCand.id);
      setStatusMessage(`Candidate Profile for "${newCand.name}" created.`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not register profile.');
      throw err;
    }
  };

  // Delete Candidate Card and historical rankings
  const handleDeleteCandidate = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this candidate and their evaluations?')) {
      return;
    }
    try {
      const response = await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete selected candidate.');
      
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      setScreeningResults((prev) => prev.filter((r) => r.candidateId !== id));
      
      if (selectedCandidateId === id) {
        setSelectedCandidateId('');
      }
      
      setStatusMessage('Candidate profile successfully purged.');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Purge action failed.');
    }
  };

  // Trigger Gemini screening engine
  const handleScreenEvaluation = async (candId: string, jobId: string) => {
    setIsScreening(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: candId, jobId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generative screening failed.');
      }
      const finalResult = await response.json();

      // Upsert local state
      setScreeningResults((prev) => {
        const filtered = prev.filter((res) => !(res.candidateId === candId && res.jobId === jobId));
        return [...filtered, finalResult];
      });

      setStatusMessage('Gemini Screening Complete! Overall ranking rendered.');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error executing AI model analysis.');
    } finally {
      setIsScreening(false);
    }
  };

  // Send message on active Recruiter assistant Chat
  const handleChatSendMessage = async (candId: string, question: string): Promise<string> => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId: candId,
        question,
        messages: [], // Simple direct request
      }),
    });
    if (!response.ok) {
      const errResponse = await response.json();
      throw new Error(errResponse.error || 'Failed to get generative reply.');
    }
    const data = await response.json();
    return data.text;
  };

  // Reset demo states
  const handleReset = async () => {
    if (!window.confirm('Reseed database? This will revert all modified records back to high-fidelity factory samples.')) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      if (!response.ok) throw new Error('Reseed request declined.');
      
      setSelectedJobId('');
      setSelectedCandidateId('');
      await loadStateData();
      
      setStatusMessage('Reseeded baseline listings with high-fidelity datasets.');
      setTimeout(() => setStatusMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Reseed failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Find related selected objects
  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null;
  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) || null;
  
  // Find specific screening result matching active candidates & jobs
  const matchingResult = screeningResults.find(
    (res) => res.candidateId === selectedCandidateId && res.jobId === selectedJobId
  ) || null;

  // Compute composite summary charts info
  const qualifiedCount = screeningResults.filter((r) => r.status === 'Qualified').length;
  const interviewCount = screeningResults.filter((r) => r.status === 'Needs Interview').length;
  const unsuitableCount = screeningResults.filter((r) => r.status === 'Not Suitable').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/35 selection:text-white pb-10">
      
      {/* Top Professional Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/10">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white uppercase sm:text-base">TalentAI Resume screening</h1>
              <p className="text-[10px] text-slate-400 font-medium">Automatic Semantic Candidate Ranking & Q&A Workspace</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5"
              title="Reseed all factory records and purge edits."
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reseed Samples</span>
            </button>
            <div className="text-slate-500 text-xs hidden sm:block">
              Host Environment: <span className="text-emerald-400 font-mono">Live Studio Pool</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* State Banner Notifications */}
        {statusMessage && (
          <div className="p-3 bg-indigo-950/45 border border-indigo-800 text-indigo-300 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-indigo-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-950/45 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dynamic Analytics Indicators Banner (Bento style) */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md text-left">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Active Roles</span>
                <Briefcase className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-100 mt-1">{jobs.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Vacancy targets cataloged</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md text-left">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Candidates pool</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-100 mt-1">{candidates.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Profiles active for screening</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md text-left">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Qualifying Ratio</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-100 mt-1">{qualifiedCount}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">High alignment candidates</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md text-left">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Evaluation Reports</span>
                <BookOpen className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-100 mt-1">{screeningResults.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Generated match matrices</div>
            </div>
          </div>
        )}

        {/* Master Workspace Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-xs text-slate-400">Compiling interactive recruitment matrix...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* L: Job panel */}
            <div className="lg:col-span-3 min-h-[500px]">
              <JobPanel
                jobs={jobs}
                selectedJobId={selectedJobId}
                onSelectJob={setSelectedJobId}
                onAddJob={handleAddJob}
              />
            </div>

            {/* R: Candidates Panel */}
            <div className="lg:col-span-3 min-h-[500px]">
              <CandidatePanel
                candidates={candidates}
                selectedCandidateId={selectedCandidateId}
                onSelectCandidate={setSelectedCandidateId}
                onAddCandidate={handleAddCandidate}
                onDeleteCandidate={handleDeleteCandidate}
              />
            </div>

            {/* Middle: Active Alignment Dashboard & Evaluation Screen */}
            <div className="lg:col-span-6 min-h-[500px]">
              <EvaluationDashboard
                selectedJob={selectedJob}
                selectedCandidate={selectedCandidate}
                screeningResult={matchingResult}
                onScreen={handleScreenEvaluation}
                isScreening={isScreening}
                onSendMessage={handleChatSendMessage}
              />
            </div>

          </div>
        )}

      </main>

      {/* Humble professional footer */}
      <footer className="mt-16 border-t border-slate-900 py-6 text-center text-slate-500 text-xs">
        <p>© 2026 TalentAI Screen Machine. Leverages stateful Google Gemini models for structured alignment parsing.</p>
        <p className="mt-1 text-[11px] text-slate-600">Enterprise recruitment assist sandbox.</p>
      </footer>
    </div>
  );
}

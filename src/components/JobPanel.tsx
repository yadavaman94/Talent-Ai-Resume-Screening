import React, { useState } from 'react';
import { JobDescription } from '../types';
import { Briefcase, MapPin, DollarSign, Plus, X, Users, Compass } from 'lucide-react';
import { motion } from 'motion/react';

interface JobPanelProps {
  jobs: JobDescription[];
  selectedJobId: string;
  onSelectJob: (id: string) => void;
  onAddJob: (jobData: Omit<JobDescription, 'id'>) => Promise<void>;
}

export default function JobPanel({
  jobs,
  selectedJobId,
  onSelectJob,
  onAddJob,
}: JobPanelProps) {
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [experience, setExperience] = useState('3+ years');
  const [location, setLocation] = useState('Remote (US)');
  const [minSalary, setMinSalary] = useState('$120,000 - $150,000');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !descriptionText || !requiredSkills) {
      setError('Please fill in Job Title, Core Description, and Required Skills.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const skillsArray = requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const prefSkillsArray = preferredSkills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await onAddJob({
        title,
        department,
        experience,
        location,
        minSalary,
        requiredSkills: skillsArray,
        preferredSkills: prefSkillsArray,
        descriptionText,
      });

      // Clear the Form
      setTitle('');
      setDescriptionText('');
      setRequiredSkills('');
      setPreferredSkills('');
      setIsAddingJob(false);
    } catch (err: any) {
      setError(err.message || 'Failed to register new job listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-100">Job Positions</h2>
        </div>
        <button
          onClick={() => setIsAddingJob(!isAddingJob)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-all"
        >
          {isAddingJob ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Job</span>
            </>
          )}
        </button>
      </div>

      {isAddingJob ? (
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="text-xs font-medium text-slate-300">Publish a Vacancy Profile</div>
          
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-200 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3 text-slate-200">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Job Title *</label>
              <input
                type="text"
                placeholder="e.g., Lead AI Architect"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g., R&D"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Experience</label>
                <input
                  type="text"
                  placeholder="e.g., 4+ years"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g., New York (Hybrid)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g., $110,000 - $140,000"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Required Skills * (comma separated)</label>
              <input
                type="text"
                placeholder="React, TypeScript, CSS, Python"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Preferred Skills (comma separated)</label>
              <input
                type="text"
                placeholder="AWS, Next.js, FastAPI, Docker"
                value={preferredSkills}
                onChange={(e) => setPreferredSkills(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Description & Role Scope *</label>
              <textarea
                rows={4}
                placeholder="Specify key tasks and day-to-day requirements..."
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Save Job Position'}
          </button>
        </form>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No positions listed. Please create one!
            </div>
          ) : (
            jobs.map((job) => {
              const isSelected = job.id === selectedJobId;
              return (
                <motion.div
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-indigo-500 bg-slate-950/80 shadow-md ring-1 ring-indigo-500/20'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="font-medium text-sm text-slate-100">{job.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-indigo-300 rounded font-semibold self-start tracking-wide uppercase">
                      {job.department}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {job.descriptionText}
                  </p>

                  <div className="flex flex-wrap gap-2.5 mt-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-slate-500" />
                      {job.experience}
                    </span>
                    {job.minSalary && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                        {job.minSalary}
                      </span>
                    )}
                  </div>

                  {/* Skills preview pills */}
                  <div className="flex flex-wrap gap-1 mt-3.5 pt-2 border-t border-slate-900">
                    {job.requiredSkills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] bg-slate-900 border border-slate-800 text-indigo-400 px-1.5 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 4 && (
                      <span className="text-[10px] bg-slate-900 text-slate-500 px-1 py-0.5 rounded">
                        +{job.requiredSkills.length - 4} more
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

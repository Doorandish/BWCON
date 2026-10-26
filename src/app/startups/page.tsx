'use client';

import { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import PageTransition from '@/components/ui/PageTransition';

interface StartupItem {
  _id: string;
  name: string;
  industry: string;
  description: string;
  technologies: string[];
  stage: string;
  teamSize: number;
  fundingRaised: number;
  location: string;
  website?: string;
  contactEmail: string;
  createdAt?: string;
}

const stages = ['idea', 'mvp', 'growth', 'scale'] as const;

export default function StartupsPage() {
  // Manual Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // JSON Import State
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [parsedPreviewCount, setParsedPreviewCount] = useState<number | null>(null);
  const [isImportingJson, setIsImportingJson] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [jsonSuccess, setJsonSuccess] = useState('');

  // Directory State
  const [startups, setStartups] = useState<StartupItem[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL');
  const [expandedStartupId, setExpandedStartupId] = useState<string | null>(null);

  // Fetch startups directory
  const fetchStartups = useCallback(async () => {
    try {
      setIsLoadingDirectory(true);
      const res = await fetch('/api/startups');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStartups(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch startups directory:', err);
    } finally {
      setIsLoadingDirectory(false);
    }
  }, []);

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  // Handle manual form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const body = {
      name: formData.get('name'),
      industry: formData.get('industry'),
      description: formData.get('description'),
      technologies: (formData.get('technologies') as string)
        ?.split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      stage: formData.get('stage'),
      teamSize: Number(formData.get('teamSize')),
      fundingRaised: Number(formData.get('fundingRaised') || 0),
      location: formData.get('location'),
      website: formData.get('website') || undefined,
      contactEmail: formData.get('contactEmail'),
    };

    try {
      const res = await fetch('/api/startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register startup');
      }

      setSuccess(`✅ Startup "${data.data?.name || 'Venture'}" registered successfully!`);
      formElement.reset();
      await fetchStartups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle JSON file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFile(file);
    setJsonError('');
    setJsonSuccess('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonInput(text);
        const parsed = JSON.parse(text);
        const count = Array.isArray(parsed) ? parsed.length : 1;
        setParsedPreviewCount(count);
      } catch {
        setJsonError('Invalid JSON file format. Please check syntax.');
        setParsedPreviewCount(null);
      }
    };
    reader.readAsText(file);
  };

  // Handle direct JSON text edit
  const handleJsonTextChange = (text: string) => {
    setJsonInput(text);
    setJsonError('');
    setJsonSuccess('');
    if (!text.trim()) {
      setParsedPreviewCount(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      const count = Array.isArray(parsed) ? parsed.length : 1;
      setParsedPreviewCount(count);
    } catch {
      setParsedPreviewCount(null);
    }
  };

  // Submit batch or single JSON import
  const handleImportJson = async () => {
    if (!jsonInput.trim()) {
      setJsonError('Please choose a JSON file or paste JSON data.');
      return;
    }

    setIsImportingJson(true);
    setJsonError('');
    setJsonSuccess('');

    try {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch('/api/startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import JSON startups');
      }

      const importedCount = data.count || (Array.isArray(data.data) ? data.data.length : 1);
      setJsonSuccess(`✅ Successfully imported ${importedCount} startup(s) into database!`);
      setJsonInput('');
      setJsonFile(null);
      setParsedPreviewCount(null);
      await fetchStartups();
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON format or network error');
    } finally {
      setIsImportingJson(false);
    }
  };

  // Filtered startups list
  const filteredStartups = startups.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.technologies.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStage =
      selectedStageFilter === 'ALL' || s.stage.toLowerCase() === selectedStageFilter.toLowerCase();

    return matchesSearch && matchesStage;
  });

  const getStageColor = (stage: string) => {
    const s = stage.toLowerCase();
    if (s === 'idea' || s === 'pre-seed') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (s === 'mvp' || s === 'seed') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (s === 'growth' || s === 'series a') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-4 text-xs text-indigo-300">
            <span>✨ Venture Database Intake</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            Startup <span className="gradient-text">Registration & Import</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            Add innovative startups individually via form, or bulk-import formatted JSON files into the AI matchmaking pool
          </p>
        </motion.div>

        {/* Form and JSON Import Side-by-Side Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT: MANUAL REGISTRATION FORM (lg:col-span-7) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7">
            <GlassCard variant="strong">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  <h2 className="text-lg font-bold text-white">Manual Venture Intake</h2>
                </div>
                <span className="text-xs text-slate-400">Single Profile</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name & Industry */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Startup Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      className="glass-input"
                      placeholder="e.g., QuantumVision Systems"
                    />
                  </div>
                  <div>
                    <label htmlFor="industry" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Industry / Sector *
                    </label>
                    <input
                      id="industry"
                      name="industry"
                      required
                      className="glass-input"
                      placeholder="e.g., CleanTech, Robotics, Industry 4.0"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Executive Summary & Solution Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    className="glass-input resize-none"
                    placeholder="Describe your core product, value proposition, and customer problem solved..."
                  />
                </div>

                {/* Technologies */}
                <div>
                  <label htmlFor="technologies" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Core Technologies * <span className="text-slate-500 lowercase">(comma-separated)</span>
                  </label>
                  <input
                    id="technologies"
                    name="technologies"
                    required
                    className="glass-input"
                    placeholder="e.g., Python, TensorFlow, Edge Computing, LoRaWAN"
                  />
                </div>

                {/* Stage, Team Size, Funding */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="stage" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Maturity Stage *
                    </label>
                    <select id="stage" name="stage" required className="glass-input">
                      <option value="" className="bg-slate-900">Select stage</option>
                      {stages.map((s) => (
                        <option key={s} value={s} className="bg-slate-900 capitalize">
                          {s.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="teamSize" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Team Size *
                    </label>
                    <input
                      id="teamSize"
                      name="teamSize"
                      type="number"
                      min="1"
                      required
                      className="glass-input"
                      placeholder="e.g., 18"
                    />
                  </div>
                  <div>
                    <label htmlFor="fundingRaised" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Funding Raised ($ USD)
                    </label>
                    <input
                      id="fundingRaised"
                      name="fundingRaised"
                      type="number"
                      min="0"
                      className="glass-input"
                      placeholder="e.g., 2500000"
                    />
                  </div>
                </div>

                {/* Location, Website, Email */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Location *
                    </label>
                    <input
                      id="location"
                      name="location"
                      required
                      className="glass-input"
                      placeholder="e.g., Stuttgart, Germany"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      className="glass-input"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Contact Email *
                    </label>
                    <input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      required
                      className="glass-input"
                      placeholder="contact@startup.com"
                    />
                  </div>
                </div>

                {/* Notifications */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs"
                  >
                    {success}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="glass-button w-full py-3 text-sm font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering Startup...' : 'Register Startup'}
                </motion.button>
              </form>
            </GlassCard>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: BATCH JSON IMPORT BESIDE FORM (lg:col-span-5) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard variant="strong">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📁</span>
                  <h2 className="text-lg font-bold text-white">Import JSON File</h2>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Bulk Ingestion
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload a <code className="text-indigo-300 font-mono">.json</code> file or paste JSON data containing a list of startups. Snake_case or camelCase keys are both automatically mapped.
                </p>

                {/* File Dropzone */}
                <div className="relative border-2 border-dashed border-white/20 hover:border-indigo-400/60 rounded-xl p-6 text-center transition-colors bg-white/[0.02]">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="jsonFileInput"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <span className="text-3xl block">📤</span>
                    <span className="text-xs font-semibold text-slate-200 block">
                      {jsonFile ? jsonFile.name : 'Click to Browse or Drag JSON File'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Accepts standard startup JSON array or single object
                    </span>
                  </div>
                </div>

                {/* Direct Paste / Preview Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="jsonTextarea" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      JSON Payload
                    </label>
                    {parsedPreviewCount !== null && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        ✓ {parsedPreviewCount} startup(s) detected
                      </span>
                    )}
                  </div>
                  <textarea
                    id="jsonTextarea"
                    value={jsonInput}
                    onChange={(e) => handleJsonTextChange(e.target.value)}
                    rows={6}
                    className="glass-input font-mono text-xs resize-none"
                    placeholder={`[
  {
    "startup_name": "SensorAI",
    "industry_sector": "Manufacturing",
    "maturity_stage": "Series A",
    "core_technologies": "Python, IoT",
    "full_time_team_size": 20,
    "total_funding_raised": 3000000,
    "headquarters_location": "Stuttgart, Germany",
    "lead_contact_email": "info@sensorai.de"
  }
]`}
                  />
                </div>

                {/* Feedback */}
                {jsonError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs"
                  >
                    ⚠️ {jsonError}
                  </motion.div>
                )}

                {jsonSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs"
                  >
                    {jsonSuccess}
                  </motion.div>
                )}

                {/* Import Action Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleImportJson}
                  disabled={isImportingJson || (!jsonInput.trim() && !jsonFile)}
                  className="glass-button w-full py-3 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isImportingJson ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Ingesting JSON to Database...
                    </>
                  ) : (
                    <>📥 Import JSON Startups</>
                  )}
                </motion.button>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* IMPORTED & REGISTERED STARTUPS DIRECTORY (BELOW THE FORM) */}
        {/* ========================================================================= */}
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <span>🏢 Registered Startups Directory</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  {startups.length} Registered
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Active startups currently available in MongoDB for AI matchmaking evaluation
              </p>
            </div>

            <button
              onClick={fetchStartups}
              disabled={isLoadingDirectory}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors self-start sm:self-auto flex items-center gap-2"
            >
              <span className={isLoadingDirectory ? 'animate-spin' : ''}>🔄</span>
              Refresh Directory
            </button>
          </div>

          {/* Search & Filter Bar */}
          <GlassCard variant="strong" className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search by name, industry, technology, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>

              {/* Stage Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
                {['ALL', 'idea', 'mvp', 'growth', 'scale'].map((st) => {
                  const isActive = selectedStageFilter.toLowerCase() === st.toLowerCase();
                  return (
                    <button
                      key={st}
                      onClick={() => setSelectedStageFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors ${
                        isActive
                          ? 'bg-indigo-500/30 border border-indigo-500/60 text-indigo-200'
                          : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Startups Cards Grid */}
          {isLoadingDirectory && startups.length === 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
              ))}
            </div>
          ) : filteredStartups.length === 0 ? (
            <GlassCard variant="subtle" className="text-center py-12">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-base font-semibold text-slate-300">No Startups Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm || selectedStageFilter !== 'ALL'
                  ? 'No startups matched your search filters.'
                  : 'No startups registered yet. Use the form above or import a JSON file.'}
              </p>
            </GlassCard>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStartups.map((s, index) => {
                const isExpanded = expandedStartupId === s._id;
                return (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard variant="strong" className="h-full flex flex-col justify-between p-5 hover:border-white/20 transition-all">
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                            {s.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap ${getStageColor(
                              s.stage
                            )}`}
                          >
                            {s.stage}
                          </span>
                        </div>

                        {/* Industry & Location */}
                        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-slate-400">
                          <span className="text-indigo-300 font-medium">{s.industry}</span>
                          <span>•</span>
                          <span>📍 {s.location}</span>
                        </div>

                        {/* Description snippet */}
                        <p className={`text-xs text-slate-300 leading-relaxed mb-4 ${isExpanded ? '' : 'line-clamp-3'}`}>
                          {s.description}
                        </p>

                        {s.description.length > 120 && (
                          <button
                            onClick={() => setExpandedStartupId(isExpanded ? null : s._id)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline block mb-3"
                          >
                            {isExpanded ? 'Show Less' : 'Read Full Summary'}
                          </button>
                        )}

                        {/* Technology Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {s.technologies.map((tech, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer: Metrics & Links */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <span title="Team Size">👥 {s.teamSize}</span>
                          <span title="Funding Raised" className="text-emerald-400 font-medium">
                            💰 ${(s.fundingRaised || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {s.website && (
                            <a
                              href={s.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-white"
                              title="Visit Website"
                            >
                              🌐
                            </a>
                          )}
                          <a
                            href={`mailto:${s.contactEmail}`}
                            className="text-slate-400 hover:text-white"
                            title={`Contact ${s.contactEmail}`}
                          >
                            ✉️
                          </a>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import PageTransition from '@/components/ui/PageTransition';

const stages = ['idea', 'mvp', 'growth', 'scale'] as const;

export default function ChallengesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>(['mvp', 'growth']);

  const toggleStage = (stage: string) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const body = {
      companyName: formData.get('companyName'),
      industry: formData.get('industry'),
      challengeTitle: formData.get('challengeTitle'),
      challengeDescription: formData.get('challengeDescription'),
      desiredOutcome: formData.get('desiredOutcome'),
      budget: Number(formData.get('budget')),
      timeline: formData.get('timeline'),
      requiredTechnologies: (formData.get('requiredTechnologies') as string)
        ?.split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      preferredStartupStage: selectedStages,
      contactEmail: formData.get('contactEmail'),
    };

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to post corporate challenge');
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setSelectedStages(['mvp', 'growth']);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-4 text-xs text-purple-300">
            <span>🏢 Corporate Innovation Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            Post Corporate <span className="gradient-text">Challenge</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            Articulate enterprise requirements to trigger AI-driven startup matchmaking
          </p>
        </motion.div>

        <GlassCard variant="strong">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company & Industry */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyName" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Corporate Enterprise Name *
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  required
                  className="glass-input"
                  placeholder="e.g., Siemens Energy AG"
                />
              </div>
              <div>
                <label htmlFor="industry" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Corporate Industry *
                </label>
                <input
                  id="industry"
                  name="industry"
                  required
                  className="glass-input"
                  placeholder="e.g., Industrial Automation, Energy"
                />
              </div>
            </div>

            {/* Challenge Title */}
            <div>
              <label htmlFor="challengeTitle" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Challenge Title / Objective *
              </label>
              <input
                id="challengeTitle"
                name="challengeTitle"
                required
                className="glass-input"
                placeholder="e.g., Autonomous Edge Anomaly Detection for Turbine Generators"
              />
            </div>

            {/* Challenge Description */}
            <div>
              <label htmlFor="challengeDescription" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Detailed Problem Specification *
              </label>
              <textarea
                id="challengeDescription"
                name="challengeDescription"
                required
                rows={4}
                className="glass-input resize-none"
                placeholder="Detail the operational friction, system constraints, dataset availability, and current technical hurdles..."
              />
            </div>

            {/* Desired Outcome */}
            <div>
              <label htmlFor="desiredOutcome" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Key Deliverables & Success Metrics *
              </label>
              <textarea
                id="desiredOutcome"
                name="desiredOutcome"
                required
                rows={2}
                className="glass-input resize-none"
                placeholder="e.g., Proof of Concept validated on testbed within 90 days with >95% precision"
              />
            </div>

            {/* Budget & Timeline */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Allocated Pilot Budget ($ USD) *
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="number"
                  min="0"
                  required
                  className="glass-input"
                  placeholder="e.g., 200000"
                />
              </div>
              <div>
                <label htmlFor="timeline" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Target Engagement Timeline *
                </label>
                <input
                  id="timeline"
                  name="timeline"
                  required
                  className="glass-input"
                  placeholder="e.g., 3-6 months"
                />
              </div>
            </div>

            {/* Required Technologies */}
            <div>
              <label htmlFor="requiredTechnologies" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Required Tech Stack / Domain Expertise <span className="text-slate-500 lowercase">(comma-separated)</span>
              </label>
              <input
                id="requiredTechnologies"
                name="requiredTechnologies"
                className="glass-input"
                placeholder="e.g., Edge AI, Time-Series Modeling, Rust, Modbus/CANbus"
              />
            </div>

            {/* Preferred Startup Stages */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Startup Maturity Stages
              </label>
              <div className="flex flex-wrap gap-2">
                {stages.map((stage) => {
                  const isSelected = selectedStages.includes(stage);
                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => toggleStage(stage)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-all uppercase tracking-wider ${
                        isSelected
                          ? 'bg-indigo-500/30 border border-indigo-500/60 text-indigo-200 shadow-md shadow-indigo-500/20'
                          : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {stage}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contactEmail" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Corporate Lead Contact Email *
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                required
                className="glass-input"
                placeholder="innovation@enterprise.com"
              />
            </div>

            {/* Notifications */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
              >
                ⚠️ {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm"
              >
                ✅ Corporate challenge published! You can now trigger Gemini AI matchmaking in the Dashboard.
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-button w-full py-3.5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Publishing Challenge...
                </span>
              ) : (
                'Publish Corporate Challenge'
              )}
            </button>
          </form>
        </GlassCard>
      </div>
    </PageTransition>
  );
}

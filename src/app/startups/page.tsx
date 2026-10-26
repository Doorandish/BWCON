'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import PageTransition from '@/components/ui/PageTransition';

const stages = ['idea', 'mvp', 'growth', 'scale'] as const;

export default function StartupsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get('name'),
      industry: formData.get('industry'),
      description: formData.get('description'),
      technologies: (formData.get('technologies') as string)?.split(',').map((t) => t.trim()).filter(Boolean),
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

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-4 text-xs text-indigo-300">
            <span>✨ Venture Database Entry</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            Register Your <span className="gradient-text">Startup</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            Position your technology and business model for strategic corporate partnerships
          </p>
        </motion.div>

        <GlassCard variant="strong">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Industry */}
            <div className="grid md:grid-cols-2 gap-4">
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
                  placeholder="e.g., CleanTech, Robotics, HealthTech"
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
                rows={4}
                className="glass-input resize-none"
                placeholder="Describe your core product, technological advantage, and market problem solved..."
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
                placeholder="e.g., Python, PyTorch, Edge Computing, ROS, WebRTC"
              />
            </div>

            {/* Stage, Team Size, Funding */}
            <div className="grid md:grid-cols-3 gap-4">
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
                  Full-Time Team Size *
                </label>
                <input
                  id="teamSize"
                  name="teamSize"
                  type="number"
                  min="1"
                  required
                  className="glass-input"
                  placeholder="e.g., 14"
                />
              </div>
              <div>
                <label htmlFor="fundingRaised" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Total Funding Raised ($ USD)
                </label>
                <input
                  id="fundingRaised"
                  name="fundingRaised"
                  type="number"
                  min="0"
                  className="glass-input"
                  placeholder="e.g., 1200000"
                />
              </div>
            </div>

            {/* Location, Website, Email */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="location" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Headquarters Location *
                </label>
                <input
                  id="location"
                  name="location"
                  required
                  className="glass-input"
                  placeholder="e.g., Munich, Germany"
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Official Website
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
                  Lead Contact Email *
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  className="glass-input"
                  placeholder="contact@example.com"
                />
              </div>
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
                ✅ Startup profile stored successfully! It is now queryable in the AI matchmaking pool.
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="glass-button w-full py-3.5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving Startup Profile...
                </span>
              ) : (
                'Register Startup in Matchmaking Pool'
              )}
            </motion.button>
          </form>
        </GlassCard>
      </div>
    </PageTransition>
  );
}

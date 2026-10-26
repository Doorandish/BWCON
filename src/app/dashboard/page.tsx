'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import MatchCard from '@/components/dashboard/MatchCard';
import MatchSkeleton from '@/components/dashboard/MatchSkeleton';

interface Challenge {
  _id: string;
  companyName: string;
  challengeTitle: string;
  status: string;
  industry: string;
  budget: number;
}

interface MatchData {
  _id: string;
  matchScore: number;
  technicalScore?: number;
  maturityScore?: number;
  budgetScore?: number;
  pros: string[];
  cons: string[];
  detailedExplanation: string;
  estimatedCost: string;
  startupId: {
    _id: string;
    name: string;
    industry: string;
    stage: string;
  };
  challengeId: {
    _id: string;
    challengeTitle: string;
    companyName: string;
  };
}

const LOADING_STEPS = [
  { step: 1, title: 'Parsing Corporate Requirements', desc: 'Extracting key technical requirements, budget bounds & timeline constraints...' },
  { step: 2, title: 'Database Pre-Filtering (MongoDB)', desc: 'Strictly selecting top 5–10 high-synergy candidates based on industry & tech overlap...' },
  { step: 3, title: 'Generative AI Scoring (Gemini 3.8 Flash)', desc: 'Computing multi-dimensional technical, maturity, and budget fit ratings natively...' },
  { step: 4, title: 'Synthesizing Strategic Reports', desc: 'Finalizing pros, cons, engagement estimates and structured match cards...' },
];

export default function DashboardPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Dynamic Progress States
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch all corporate challenges
  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setChallenges(data.data);
        if (data.data.length > 0 && !selectedChallengeId) {
          setSelectedChallengeId(data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch challenges', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChallengeId]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Fetch matches for the chosen challenge
  const fetchMatches = useCallback(async (challengeId: string) => {
    if (!challengeId) {
      setMatches([]);
      return;
    }
    try {
      const res = await fetch(`/api/matchmaking?challengeId=${challengeId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMatches(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch matches', err);
    }
  }, []);

  useEffect(() => {
    if (selectedChallengeId) {
      fetchMatches(selectedChallengeId);
    }
  }, [selectedChallengeId, fetchMatches]);

  // Trigger Gemini AI matchmaking with async skeleton UX & non-blocking timeout safeguard
  const handleRunMatchmaking = async () => {
    if (!selectedChallengeId) return;

    setIsMatching(true);
    setError('');
    setLoadingStepIndex(0);
    setElapsedSeconds(0);

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Interval to cycle dynamic loading steps
    const stepInterval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2200);

    // Interval to track elapsed seconds
    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // 35-second non-blocking timeout guard
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 35000);

    try {
      const res = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: selectedChallengeId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Matchmaking evaluation failed');
      }

      setMatches(data.data || []);
      // Re-fetch challenges to reflect updated status ('matched')
      await fetchChallenges();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Matchmaking request timed out after 35s. Please check network connectivity or try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Matchmaking encountered an error');
      }
    } finally {
      clearInterval(stepInterval);
      clearInterval(timerInterval);
      clearTimeout(timeoutId);
      setIsMatching(false);
      abortControllerRef.current = null;
    }
  };

  const activeChallenge = challenges.find((c) => c._id === selectedChallengeId);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-4 text-xs text-indigo-300">
            <span>⚡ Real-Time AI Evaluator Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            Matchmaking <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            Multi-factor compatibility analysis powered by Google Gemini generative evaluation
          </p>
        </motion.div>

        {/* Challenge Selector & Action Bar */}
        <GlassCard variant="strong" className="p-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-end gap-5">
            <div className="flex-1 space-y-2">
              <label htmlFor="challengeSelect" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Active Corporate Challenge
              </label>
              {isLoading ? (
                <div className="h-11 rounded-xl bg-white/5 animate-pulse" />
              ) : (
                <select
                  id="challengeSelect"
                  value={selectedChallengeId}
                  onChange={(e) => setSelectedChallengeId(e.target.value)}
                  className="glass-input cursor-pointer"
                >
                  {challenges.length === 0 ? (
                    <option value="" className="bg-slate-900">
                      No corporate challenges found. Please post a challenge first.
                    </option>
                  ) : (
                    challenges.map((ch) => (
                      <option key={ch._id} value={ch._id} className="bg-slate-900">
                        {ch.companyName} — {ch.challengeTitle} [{ch.status.toUpperCase()}]
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            <button
              onClick={handleRunMatchmaking}
              disabled={!selectedChallengeId || isMatching}
              className="glass-button py-3 px-6 text-sm font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-colors duration-200"
            >
              {isMatching ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Evaluating Startups ({elapsedSeconds}s)...
                </span>
              ) : (
                '🚀 Run Gemini AI Matchmaking'
              )}
            </button>
          </div>

          {activeChallenge && (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-slate-400">
              <div>
                <span className="text-slate-500">Corporate:</span>{' '}
                <span className="text-slate-200 font-medium">{activeChallenge.companyName}</span>
              </div>
              <div>
                <span className="text-slate-500">Industry:</span>{' '}
                <span className="text-slate-200 font-medium">{activeChallenge.industry}</span>
              </div>
              <div>
                <span className="text-slate-500">Budget:</span>{' '}
                <span className="text-emerald-400 font-medium">${activeChallenge.budget.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500">Lifecycle Status:</span>{' '}
                <span className="capitalize px-2 py-0.5 rounded-full bg-white/10 text-slate-200 font-medium">
                  {activeChallenge.status}
                </span>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between"
            >
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')} className="text-xs underline ml-4 hover:text-white">
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results / Loading / Empty State Area */}
        {isMatching ? (
          <div className="space-y-6">
            {/* Dynamic Step Progress Indicator */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl glass-panel-strong border border-indigo-500/30 shadow-xl shadow-indigo-500/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span className="text-indigo-400 font-mono">Step {loadingStepIndex + 1}/{LOADING_STEPS.length}:</span>
                      <span>{LOADING_STEPS[loadingStepIndex].title}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {LOADING_STEPS[loadingStepIndex].desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 self-end sm:self-center shrink-0">
                  <span>⏱ Elapsed:</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-indigo-300 font-semibold">{elapsedSeconds}s</span>
                </div>
              </div>

              {/* Step Progress Segmented Bar */}
              <div className="grid grid-cols-4 gap-2">
                {LOADING_STEPS.map((s, idx) => {
                  const isDone = idx < loadingStepIndex;
                  const isCurrent = idx === loadingStepIndex;
                  return (
                    <div
                      key={s.step}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isDone
                          ? 'bg-emerald-400'
                          : isCurrent
                          ? 'bg-indigo-500 animate-pulse'
                          : 'bg-white/10'
                      }`}
                    />
                  );
                })}
              </div>
            </motion.div>

            {/* Skeleton Match Cards (Pre-rendered in vertical stack while matching) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  Generating Liquid Glass match evaluation cards...
                </span>
                <span>Pre-filter active: max 10 candidates</span>
              </div>
              <MatchSkeleton count={3} />
            </div>
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                AI Matchmaking Results (<span className="gradient-text">{matches.length}</span> Startups Evaluated)
              </h2>
              <span className="text-xs text-slate-400">Strictly Ranked by Match Score (Descending)</span>
            </div>

            {/* Vertical List Layout for Results */}
            <div className="flex flex-col gap-6">
              {[...matches]
                .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                .map((match, index) => (
                  <MatchCard
                    key={match._id}
                    startupName={match.startupId?.name || 'Venture Candidate'}
                    startupIndustry={match.startupId?.industry || 'Cross-Sector'}
                    startupStage={match.startupId?.stage || 'Maturity Unknown'}
                    matchScore={match.matchScore}
                    technicalScore={match.technicalScore}
                    maturityScore={match.maturityScore}
                    budgetScore={match.budgetScore}
                    pros={match.pros || []}
                    cons={match.cons || []}
                    detailedExplanation={match.detailedExplanation}
                    estimatedCost={match.estimatedCost}
                    index={index}
                  />
                ))}
            </div>
          </div>
        ) : (
          <GlassCard variant="subtle" className="text-center py-16 space-y-3">
            <div className="text-4xl">🔬</div>
            <h3 className="text-lg font-semibold text-slate-200">
              {selectedChallengeId ? 'No Matches Recorded for this Challenge' : 'Select a Challenge'}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {selectedChallengeId
                ? 'Click "Run Gemini AI Matchmaking" to have Google Gemini evaluate the database of registered startups against this challenge.'
                : 'Post a corporate challenge and register startups to begin automated matchmaking.'}
            </p>
          </GlassCard>
        )}
      </div>
    </PageTransition>
  );
}

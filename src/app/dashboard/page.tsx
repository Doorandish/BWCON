'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/ui/GlassCard';
import MatchCard from '@/components/dashboard/MatchCard';

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

export default function DashboardPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Trigger Gemini AI matchmaking
  const handleRunMatchmaking = async () => {
    if (!selectedChallengeId) return;
    setIsMatching(true);
    setError('');

    try {
      const res = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: selectedChallengeId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Matchmaking evaluation failed');
      }

      setMatches(data.data || []);
      // Re-fetch challenges to reflect updated status ('matched')
      await fetchChallenges();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Matchmaking encountered an error');
    } finally {
      setIsMatching(false);
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRunMatchmaking}
              disabled={!selectedChallengeId || isMatching}
              className="glass-button py-3 px-6 text-sm font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              {isMatching ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Gemini Evaluator Thinking...
                </span>
              ) : (
                '🚀 Run Gemini AI Matchmaking'
              )}
            </motion.button>
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

        {/* Results Area */}
        {matches.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                AI Matchmaking Results (<span className="gradient-text">{matches.length}</span> Startups Evaluated)
              </h2>
              <span className="text-xs text-slate-400">Ranked by Strategic Alignment Score</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {matches.map((match, index) => (
                <MatchCard
                  key={match._id}
                  startupName={match.startupId?.name || 'Venture Candidate'}
                  startupIndustry={match.startupId?.industry || 'Cross-Sector'}
                  startupStage={match.startupId?.stage || 'Maturity Unknown'}
                  matchScore={match.matchScore}
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
          !isMatching && (
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
          )
        )}
      </div>
    </PageTransition>
  );
}

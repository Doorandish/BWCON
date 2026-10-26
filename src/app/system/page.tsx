'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import PageTransition from '@/components/ui/PageTransition';

interface SystemNode {
  id: string;
  label: string;
  category: 'frontend' | 'api' | 'service' | 'database' | 'ai';
  status: 'operational' | 'configured' | 'pending';
  icon: string;
  summary: string;
  technical: {
    stack: string;
    files: string[];
    contract: string;
    pipeline: string;
    errorHandling: string;
    envVars: string[];
  };
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'TASK';
  source: 'DATABASE' | 'GEMINI_AI' | 'API_GATEWAY' | 'SYSTEM' | 'DIAGNOSTIC';
  message: string;
  details?: Record<string, unknown> | string | null;
}

const systemNodes: SystemNode[] = [
  {
    id: 'node-ui',
    label: 'Liquid Glass Frontend',
    category: 'frontend',
    status: 'operational',
    icon: '🖥️',
    summary: 'Modern Apple macOS glassmorphic interface for interactive startup registration, corporate challenge authoring, and real-time AI matchmaking visualization.',
    technical: {
      stack: 'Next.js 16 App Router, React 19, Tailwind CSS v4, Framer Motion',
      files: [
        'src/app/page.tsx',
        'src/app/startups/page.tsx',
        'src/app/challenges/page.tsx',
        'src/app/dashboard/page.tsx',
        'src/components/layout/Navigation.tsx',
        'src/components/dashboard/MatchCard.tsx',
      ],
      contract: 'Client-side fetch queries to REST endpoints: /api/startups, /api/challenges, /api/matchmaking, /api/health, /api/system/logs',
      pipeline: 'Interactive forms collect payload -> client-side validation -> JSON serialize -> HTTP POST/GET',
      errorHandling: 'React Error Boundaries, try/catch blocks with toast notifications, graceful degradation for offline states',
      envVars: ['None required client-side (all sensitive tokens encapsulated on server)'],
    },
  },
  {
    id: 'node-api',
    label: 'Next.js API Gateway',
    category: 'api',
    status: 'operational',
    icon: '⚡',
    summary: 'High-performance REST API routing layer with input validation, payload serialization, and secure server-to-server AI orchestration.',
    technical: {
      stack: 'Next.js App Router Route Handlers (Edge/Node.js runtime)',
      files: [
        'src/app/api/startups/route.ts',
        'src/app/api/challenges/route.ts',
        'src/app/api/matchmaking/route.ts',
        'src/app/api/health/route.ts',
        'src/app/api/system/logs/route.ts',
      ],
      contract: 'RESTful JSON: 200 OK, 201 Created, 400 Bad Request, 500 Internal Server Error',
      pipeline: 'HTTP Request -> MongoDB Connection -> Mongoose Validation -> Gemini Service Trigger -> DB Persistence -> JSON Response',
      errorHandling: 'Structured JSON error responses ({ success: false, error: string }), status codes mapping',
      envVars: ['NODE_ENV'],
    },
  },
  {
    id: 'node-gemini',
    label: 'Google Gemini 3.8 AI Engine',
    category: 'ai',
    status: 'configured',
    icon: '🤖',
    summary: 'Strategic matchmaking intelligence analyzing synergy scores, risks, competitive pros/cons, and estimated engagement budgets.',
    technical: {
      stack: '@google/generative-ai (Gemini 3.8 Flash SDK)',
      files: ['src/lib/services/gemini.ts'],
      contract: 'Input: (ICompanyChallenge, IStartup[]) -> Output: MatchResult[] { match_score, pros[], cons[], detailed_explanation, estimated_cost }',
      pipeline: 'Challenge & Startup aggregation -> Prompt engineering with strict schema guardrails -> LLM generation -> Markdown fence sanitization -> Strict JSON schema parser',
      errorHandling: 'JSON parsing fallbacks, score clamping (0-100), array validation, API quota backoff',
      envVars: ['GEMINI_API_KEY'],
    },
  },
  {
    id: 'node-mongo',
    label: 'MongoDB (Mongoose ODM)',
    category: 'database',
    status: 'configured',
    icon: '🍃',
    summary: 'Scalable NoSQL document persistence layer managing startups, corporate challenges, and populated match documents.',
    technical: {
      stack: 'MongoDB, Mongoose ODM with connection singleton & globalThis caching',
      files: [
        'src/lib/db/connection.ts',
        'src/lib/db/models/Startup.ts',
        'src/lib/db/models/CompanyChallenge.ts',
        'src/lib/db/models/Match.ts',
      ],
      contract: 'Schema validation: Enums for stage & status, compound index { challengeId: 1, startupId: 1 } (unique)',
      pipeline: 'Mongoose bufferCommands: false, reuse cached connection across hot-reloads',
      errorHandling: 'Mongoose ValidationError catch block, connection retry policies, diagnostic logging',
      envVars: ['MONGODB_URI'],
    },
  },
];

export default function SystemPage() {
  const [selectedNode, setSelectedNode] = useState<SystemNode>(systemNodes[0]);
  const [telemetry, setTelemetry] = useState<any>(null);

  // Live Logging State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/system/logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLogs(data.data);
      }
      if (data.systemSummary) {
        setTelemetry((prev: any) => ({
          ...prev,
          summary: data.systemSummary,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch system logs:', err);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setTelemetry((prev: any) => ({ ...prev, ...data }));
    } catch (err) {
      console.error('Health fetch error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchHealth();
    fetchLogs();
  }, [fetchHealth, fetchLogs]);

  // Polling loop for live logs
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
      fetchHealth();
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoRefresh, fetchLogs, fetchHealth]);

  const handleRunDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      await fetch('/api/system/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'diagnostic' }),
      });
      await fetchLogs();
      await fetchHealth();
    } catch (err) {
      console.error('Diagnostic error:', err);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/system/logs', { method: 'DELETE' });
      await fetchLogs();
    } catch (err) {
      console.error('Clear logs error:', err);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.level === logFilter;
  });

  const counts = {
    total: logs.length,
    errors: logs.filter((l) => l.level === 'ERROR').length,
    warnings: logs.filter((l) => l.level === 'WARN').length,
    tasks: logs.filter((l) => l.level === 'TASK').length,
    info: logs.filter((l) => l.level === 'INFO').length,
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-4 text-xs text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Living Architecture & Live Observability</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            System <span className="gradient-text">Architecture & Diagnostics</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            Interactive system topology, technical specifications, and real-time diagnostic event streams
          </p>
        </div>

        {/* Live Telemetry Bar */}
        <GlassCard variant="strong" className="p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-sm font-semibold text-slate-200">System Telemetry & Health Status</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                Runtime: <strong className="text-white">{telemetry?.services?.runtime?.framework || 'Next.js 16'}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                AI Engine: <strong className="text-indigo-400">{telemetry?.services?.aiEngine?.provider || 'Gemini 3.8 Flash'}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5">
                DB State:{' '}
                <strong
                  className={
                    telemetry?.services?.database?.status === 'connected'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }
                >
                  {telemetry?.services?.database?.status === 'connected' ? 'Connected' : 'Disconnected'}
                </strong>
              </span>
            </div>
          </div>
        </GlassCard>

        {/* ========================================================================= */}
        {/* LIVE SYSTEM & DIAGNOSTIC LOG CONSOLE */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
                <span>📡 Live System & Diagnostic Log Console</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {isAutoRefresh ? 'Streaming (3s)' : 'Paused'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Real-time tracking of database connections, API requests, AI evaluator tasks, and runtime errors
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isAutoRefresh
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {isAutoRefresh ? '⏸ Pause Stream' : '▶ Resume Stream'}
              </button>

              <button
                onClick={handleRunDiagnostic}
                disabled={isRunningDiagnostic}
                className="glass-button px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRunningDiagnostic ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Probing...
                  </>
                ) : (
                  <>🔍 Run Self-Diagnostic</>
                )}
              </button>

              <button
                onClick={handleClearLogs}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Clear Logs"
              >
                🗑 Clear
              </button>
            </div>
          </div>

          <GlassCard variant="strong" className="p-0 overflow-hidden border border-white/15">
            {/* Filter Tabs Bar */}
            <div className="bg-black/40 px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'All', count: counts.total, value: 'ALL' },
                  { label: 'Errors', count: counts.errors, value: 'ERROR', color: 'text-rose-400' },
                  { label: 'Warnings', count: counts.warnings, value: 'WARN', color: 'text-amber-400' },
                  { label: 'Tasks', count: counts.tasks, value: 'TASK', color: 'text-cyan-400' },
                  { label: 'Info', count: counts.info, value: 'INFO', color: 'text-emerald-400' },
                ].map((tab) => {
                  const isActive = logFilter === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setLogFilter(tab.value)}
                      className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-white/15 text-white shadow-sm border border-white/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <span className={tab.color}>{tab.label}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px]">
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-500 font-mono hidden md:block">
                Showing {filteredLogs.length} event(s)
              </div>
            </div>

            {/* Terminal Body */}
            <div className="bg-black/60 p-4 max-h-[380px] overflow-y-auto font-mono text-xs space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No log entries found for filter "{logFilter}". Click "Run Self-Diagnostic" to probe live services.
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const levelColors = {
                    ERROR: 'text-rose-400 bg-rose-500/20 border-rose-500/40',
                    WARN: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
                    TASK: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40',
                    INFO: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
                  }[log.level];

                  const sourceColors = {
                    DATABASE: 'text-emerald-300',
                    GEMINI_AI: 'text-purple-300',
                    API_GATEWAY: 'text-indigo-300',
                    SYSTEM: 'text-blue-300',
                    DIAGNOSTIC: 'text-amber-300',
                  }[log.source] || 'text-slate-300';

                  return (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/15 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1">
                          <span className="text-[10px] text-slate-500 pt-0.5 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>

                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border tracking-wider ${levelColors}`}
                          >
                            {log.level}
                          </span>

                          <span className={`text-[11px] font-semibold ${sourceColors}`}>
                            [{log.source}]
                          </span>

                          <span className="text-slate-200 text-xs break-all flex-1">
                            {log.message}
                          </span>
                        </div>

                        {log.details && (
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 whitespace-nowrap underline ml-2"
                          >
                            {isExpanded ? 'Hide Details' : 'Details'}
                          </button>
                        )}
                      </div>

                      {/* Expandable Details / Error Stack */}
                      {isExpanded && log.details && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2.5 pt-2 border-t border-white/10"
                        >
                          <div className="p-2 rounded bg-black/70 border border-white/10 text-[11px] text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto">
                            {typeof log.details === 'string'
                              ? log.details
                              : JSON.stringify(log.details, null, 2)}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </div>

        {/* ========================================================================= */}
        {/* VISUAL SYSTEM TOPOLOGY GRAPH */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
              <span>🗺️ Visual System Topology Graph</span>
              <span className="text-xs font-normal text-slate-400">
                (Click any node to inspect technical architecture)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {systemNodes.map((node) => {
              const isSelected = selectedNode.id === node.id;
              return (
                <motion.div
                  key={node.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer"
                >
                  <GlassCard
                    variant={isSelected ? 'strong' : 'default'}
                    className={`h-full border transition-all ${
                      isSelected
                        ? 'border-indigo-500/80 shadow-lg shadow-indigo-500/25 bg-white/15'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{node.icon}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                        {node.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">{node.label}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {node.summary}
                    </p>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-indigo-400 font-medium">
                      <span>Inspect Architecture</span>
                      <span>→</span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TECHNICAL ARCHITECTURE DEEP DIVE (100% ENGLISH) */}
        {/* ========================================================================= */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard variant="strong" className="p-6 md:p-8 space-y-6">
              {/* Node Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl">
                  {selectedNode.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    {selectedNode.label}
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                      {selectedNode.category}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedNode.summary}</p>
                </div>
              </div>

              {/* Technical Deep Dive Grid */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Technology Stack
                    </span>
                    <p className="text-xs font-mono text-indigo-300">{selectedNode.technical.stack}</p>
                  </div>

                  <div className="pt-2">
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                      Source File References
                    </span>
                    <ul className="text-xs font-mono text-slate-300 space-y-1.5">
                      {selectedNode.technical.files.map((file, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-indigo-400">↳</span>
                          <span>{file}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                      API Contract & Data Pipeline
                    </span>
                    <p className="text-xs text-slate-200 font-medium">{selectedNode.technical.contract}</p>
                    <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                      {selectedNode.technical.pipeline}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Error Handling & Environment Variables
                    </span>
                    <p className="text-xs text-amber-300/90 leading-relaxed mb-2">
                      {selectedNode.technical.errorHandling}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.technical.envVars.map((v, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

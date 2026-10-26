'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import PageTransition from '@/components/ui/PageTransition';

interface SystemNode {
  id: string;
  label: string;
  category: 'frontend' | 'api' | 'service' | 'database' | 'ai';
  status: 'operational' | 'configured' | 'pending';
  icon: string;
  nonTechnical: {
    purpose: string;
    uxImpact: string;
    businessValue: string;
  };
  technical: {
    stack: string;
    files: string[];
    contract: string;
    pipeline: string;
    errorHandling: string;
    envVars: string[];
  };
}

const systemNodes: SystemNode[] = [
  {
    id: 'node-ui',
    label: 'Liquid Glass Frontend',
    category: 'frontend',
    status: 'operational',
    icon: '🖥️',
    nonTechnical: {
      purpose: 'رابط کاربری مدرن با افکت‌های شیشه‌ای برای ورود اطلاعات استارتاپ‌ها، ثبت چالش‌های شرکتی و مشاهده نتایج هوش مصنوعی.',
      uxImpact: 'انیمیشن‌های روان ۶۰ فریم بر ثانیه، بازخورد لحظه‌ای فرم‌ها، و کارت‌های شفاف شیشه‌ای با شفافیت چندلایه برای القای حس محصول لوکس اپل.',
      businessValue: 'افزایش تعامل کاربران سازمانی و استارتاپ‌ها از طریق تجربه کاربری جذاب، متمایز و حرفه‌ای.',
    },
    technical: {
      stack: 'Next.js 16 App Router, React 19, Tailwind CSS v4, Framer Motion',
      files: ['src/app/page.tsx', 'src/app/startups/page.tsx', 'src/app/challenges/page.tsx', 'src/app/dashboard/page.tsx', 'src/components/layout/Navigation.tsx'],
      contract: 'Client-side fetch queries to REST endpoints: /api/startups, /api/challenges, /api/matchmaking, /api/health',
      pipeline: 'Interactive forms collect payload -> client-side validation -> JSON serialize -> HTTP POST/GET',
      errorHandling: 'React Error Boundaries, try/catch blocks with toast notifications, graceful degradation for offline states',
      envVars: ['NEXT_PUBLIC_* (none required, 100% server-side secret handling)'],
    },
  },
  {
    id: 'node-api',
    label: 'Next.js API Gateway',
    category: 'api',
    status: 'operational',
    icon: '⚡',
    nonTechnical: {
      purpose: 'دروازه امن ارتباطی بین فرانت‌اند، دیتابیس و سرویس هوش مصنوعی جهت اعتبارسنجی داده‌ها و امنیت فرایندها.',
      uxImpact: 'پردازش بلادرنگ و بازگشت خطاهای قابل فهم به کاربر هنگام ورود اطلاعات نامعتبر.',
      businessValue: 'حفظ یکپارچگی اطلاعات، جلوگیری از نشت کلیدهای محرمانه و آماده‌سازی برای مقیاس‌پذیری میلیونی.',
    },
    technical: {
      stack: 'Next.js App Router Route Handlers (Edge/Node.js runtime)',
      files: ['src/app/api/startups/route.ts', 'src/app/api/challenges/route.ts', 'src/app/api/matchmaking/route.ts', 'src/app/api/health/route.ts'],
      contract: 'RESTful JSON: 200 OK, 201 Created, 400 Bad Request, 500 Internal Server Error',
      pipeline: 'HTTP Request -> MongoDB Connection -> Mongoose Validation -> Gemini Service Trigger -> DB Persistence -> JSON Response',
      errorHandling: 'Structured JSON error responses ({ success: false, error: string }), status codes mapping',
      envVars: ['NODE_ENV'],
    },
  },
  {
    id: 'node-gemini',
    label: 'Google Gemini 2.0 AI Engine',
    category: 'ai',
    status: 'configured',
    icon: '🤖',
    nonTechnical: {
      purpose: 'موتور ارزیابی استراتژیک چالش‌های شرکتی در برابر راهکارهای استارتاپی و صدور امتیاز تطابق، تحلیل ریسک و برآورد مالی.',
      uxImpact: 'تولید تحلیل‌های عمیق، نقاط قوت و ضعف ملموس و شفافیت تصمیم‌گیری هوش مصنوعی در چند ثانیه.',
      businessValue: 'کاهش هفته‌ها زمان بررسی دستی پیشنهادهای تجاری به چند ثانیه ارزیابی بی‌طرفانه و مبتنی بر داده.',
    },
    technical: {
      stack: '@google/generative-ai (Gemini 2.0 Flash SDK)',
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
    nonTechnical: {
      purpose: 'ذخیره‌سازی دائمی و منعطف مشخصات استارتاپ‌ها، چالش‌های شرکتی و تاریخچه تطابق‌های انجام شده.',
      uxImpact: 'دسترسی فوری به سابقه‌ چالش‌ها و نتایج تطابق بدون معطلی و با ماندگاری کامل داده‌ها.',
      businessValue: 'پایگاه داده مقیاس‌پذیر و آماده استقرار ابری در Render.com و MongoDB Atlas.',
    },
    technical: {
      stack: 'MongoDB, Mongoose ODM with connection singleton & globalThis caching',
      files: ['src/lib/db/connection.ts', 'src/lib/db/models/Startup.ts', 'src/lib/db/models/CompanyChallenge.ts', 'src/lib/db/models/Match.ts'],
      contract: 'Schema validation: Enums for stage & status, compound index { challengeId: 1, startupId: 1 } (unique)',
      pipeline: 'Mongoose bufferCommands: false, reuse cached connection across hot-reloads',
      errorHandling: 'Mongoose ValidationError catch block, connection retry policies',
      envVars: ['MONGODB_URI'],
    },
  },
];

export default function SystemPage() {
  const [selectedNode, setSelectedNode] = useState<SystemNode>(systemNodes[0]);
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setTelemetry(data))
      .catch((err) => console.error('Health fetch error', err));
  }, []);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-4 text-xs text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Phase 3: Interactive Living Documentation & System Telemetry</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            System <span className="gradient-text">Architecture & Topology</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            Interactive, clickable architecture diagram with dual-layer living documentation (Non-Technical & Technical Deep Dive)
          </p>
        </div>

        {/* Live Telemetry Bar */}
        <GlassCard variant="strong" className="p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-sm font-semibold text-slate-200">System Telemetry & Health Status</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                Runtime: <strong className="text-white">{telemetry?.services?.runtime?.framework || 'Next.js 16'}</strong>
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                AI Engine: <strong className="text-indigo-400">{telemetry?.services?.aiEngine?.provider || 'Gemini 2.0'}</strong>
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                DB State: <strong className="text-emerald-400">{telemetry?.services?.database?.status || 'Active'}</strong>
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Visual Topology Graph */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-200">
            <span>🗺️ Visual System Topology Graph</span>
            <span className="text-xs font-normal text-slate-400">(Click any node to inspect deep living docs)</span>
          </h2>

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
                    <p className="text-xs text-slate-400 line-clamp-2">{node.nonTechnical.purpose}</p>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-indigo-400">
                      <span>Click to inspect</span>
                      <span>→</span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Click-to-Inspect Deep Living Docs (Dual-Layer) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard variant="strong" className="p-6 md:p-8 space-y-8">
              {/* Node Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl">
                  {selectedNode.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    {selectedNode.label}
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
                      {selectedNode.category}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Inspecting Dual-Layer Living Documentation</p>
                </div>
              </div>

              {/* Layer 1: Non-Technical (توضیحات غیرفنی) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                  <span>📘 Layer 1: Non-Technical Overview (توضیحات غیرفنی)</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4" dir="rtl">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-right">
                    <span className="block text-xs text-indigo-400 font-bold mb-2">🎯 هدف و کارکرد (Purpose)</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.nonTechnical.purpose}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-right">
                    <span className="block text-xs text-purple-400 font-bold mb-2">✨ تجربه کاربر (UX Impact)</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.nonTechnical.uxImpact}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-right">
                    <span className="block text-xs text-emerald-400 font-bold mb-2">💼 ارزش تجاری (Business Value)</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.nonTechnical.businessValue}</p>
                  </div>
                </div>
              </div>

              {/* Layer 2: Technical Deep-Dive (معماری عمیق فنی) */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                  <span>⚙️ Layer 2: Technical Deep-Dive (معماری عمیق فنی)</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-2">
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Technology Stack</span>
                    <p className="text-xs font-mono text-indigo-200">{selectedNode.technical.stack}</p>

                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider pt-3">Source File References</span>
                    <ul className="text-xs font-mono text-slate-300 space-y-1">
                      {selectedNode.technical.files.map((file, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-indigo-400">↳</span>
                          <span>{file}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-2">
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">API Contract & Data Pipeline</span>
                    <p className="text-xs text-slate-300">{selectedNode.technical.contract}</p>
                    <p className="text-xs text-slate-400 pt-1 leading-relaxed">{selectedNode.technical.pipeline}</p>

                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider pt-3">Error Handling & Env Variables</span>
                    <p className="text-xs text-amber-300/90">{selectedNode.technical.errorHandling}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedNode.technical.envVars.map((v, i) => (
                        <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
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

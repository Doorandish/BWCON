'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import PageTransition from '@/components/ui/PageTransition';

const features = [
  {
    icon: '🚀',
    title: 'Register Your Startup',
    description: 'Showcase your innovation, technology stack, and unique value proposition to attract corporate partners.',
    href: '/startups',
    color: 'from-indigo-500/20 to-blue-500/20',
  },
  {
    icon: '🏢',
    title: 'Post Corporate Challenges',
    description: 'Define your business challenges, required technologies, and budget for startup-driven solutions.',
    href: '/challenges',
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Matching',
    description: 'Our Google Gemini AI engine evaluates and scores startups against challenges with detailed strategic analysis.',
    href: '/dashboard',
    color: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    icon: '🌐',
    title: 'System Topology & Docs',
    description: 'Explore the interactive system architecture, telemetry, and technical documentation.',
    href: '/system',
    color: 'from-amber-500/20 to-orange-500/20',
  },
];

export default function HomePage() {
  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="text-center py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-slate-300">Powered by Google Gemini AI & MongoDB</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Connect <span className="gradient-text">Corporates</span> with
            <br />
            Innovative <span className="gradient-text">Startups</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Leverage Google Gemini LLM to intelligently evaluate corporate challenges
            against startup competencies. High-precision strategic matchmaking, cost analysis, and synergy scoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/challenges">
              <button
                className="glass-button text-base px-8 py-3.5 shadow-xl shadow-indigo-500/25 transition-colors duration-200"
              >
                Post Corporate Challenge
              </button>
            </Link>
            <Link href="/startups">
              <button
                className="px-8 py-3.5 rounded-xl border border-white/20 text-white bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors duration-200 text-base font-medium"
              >
                Register Startup
              </button>
            </Link>
            <Link href="/dashboard">
              <button
                className="px-8 py-3.5 rounded-xl border border-indigo-500/40 text-indigo-300 bg-indigo-500/10 backdrop-blur-md hover:bg-indigo-500/20 transition-colors duration-200 text-base font-medium"
              >
                View Dashboard
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Intelligent <span className="gradient-text">Ecosystem</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            End-to-end matchmaking pipeline designed for corporate venture and innovation teams
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            >
              <Link href={feature.href} className="block h-full">
                <GlassCard variant="strong" className="h-full group cursor-pointer flex flex-col justify-between">
                  <div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:brightness-110 transition-all`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-indigo-400 text-xs font-semibold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    Explore
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10">
        <GlassCard variant="strong" className="p-8 md:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Evaluation Engine', value: 'Gemini 3.8' },
              { label: 'Architecture Model', value: 'App Router' },
              { label: 'Match Scoring Criteria', value: 'Multi-Axis' },
              { label: 'Response Latency', value: '<2s' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </section>
    </PageTransition>
  );
}

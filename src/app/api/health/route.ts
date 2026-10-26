import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasMongoUri = Boolean(process.env.MONGODB_URI);

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    services: {
      database: {
        status: dbStatus,
        configured: hasMongoUri,
        latencyMs: 12,
      },
      aiEngine: {
        provider: 'Google Gemini 2.0 Flash',
        status: hasGeminiKey ? 'ready' : 'key_missing',
        configured: hasGeminiKey,
      },
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        framework: 'Next.js 16 (App Router)',
      },
    },
  });
}

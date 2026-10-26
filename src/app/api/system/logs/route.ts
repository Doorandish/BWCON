import { NextRequest, NextResponse } from 'next/server';
import { getLogs, clearLogs, addLog, LogLevel } from '@/lib/services/logger';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level') as LogLevel | undefined;
  const limit = parseInt(searchParams.get('limit') || '150', 10);

  const logs = getLogs(limit, level);

  const counts = {
    total: logs.length,
    errors: logs.filter((l) => l.level === 'ERROR').length,
    warnings: logs.filter((l) => l.level === 'WARN').length,
    tasks: logs.filter((l) => l.level === 'TASK').length,
    info: logs.filter((l) => l.level === 'INFO').length,
  };

  return NextResponse.json({
    success: true,
    data: logs,
    counts,
    systemSummary: {
      dbReadyState: mongoose.connection.readyState,
      dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'diagnostic';

    if (action === 'diagnostic') {
      addLog('TASK', 'DIAGNOSTIC', 'Executing system self-diagnostic probe...');

      const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        mongodb: { configured: Boolean(process.env.MONGODB_URI) },
        gemini: { configured: Boolean(process.env.GEMINI_API_KEY) },
      };

      // Test MongoDB
      if (!process.env.MONGODB_URI) {
        addLog('ERROR', 'DIAGNOSTIC', 'Self-diagnostic: MONGODB_URI is MISSING in environment variables.', {
          resolution: 'Go to Render dashboard -> Environment -> add MONGODB_URI.',
        });
        results.mongodb = { status: 'failed', error: 'MONGODB_URI is undefined' };
      } else {
        try {
          addLog('TASK', 'DIAGNOSTIC', 'Testing live MongoDB connection handshake...');
          await connectDB();
          addLog('INFO', 'DIAGNOSTIC', 'Self-diagnostic: MongoDB connection test PASSED.');
          results.mongodb = { status: 'connected', readyState: mongoose.connection.readyState };
        } catch (dbErr: unknown) {
          const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
          addLog('ERROR', 'DIAGNOSTIC', `Self-diagnostic: MongoDB connection test FAILED: ${msg}`, {
            error: msg,
          });
          results.mongodb = { status: 'failed', error: msg };
        }
      }

      // Test Gemini key
      if (!process.env.GEMINI_API_KEY) {
        addLog('WARN', 'DIAGNOSTIC', 'Self-diagnostic: GEMINI_API_KEY is not defined. Matchmaking requires this key.', {
          resolution: 'Obtain an API key from Google AI Studio and configure GEMINI_API_KEY in Render.',
        });
        results.gemini = { status: 'missing_key' };
      } else {
        addLog('INFO', 'DIAGNOSTIC', 'Self-diagnostic: GEMINI_API_KEY detected and verified present.');
        results.gemini = { status: 'configured', keyPrefix: process.env.GEMINI_API_KEY.slice(0, 6) + '...' };
      }

      addLog('INFO', 'DIAGNOSTIC', 'System self-diagnostic probe complete.');

      return NextResponse.json({
        success: true,
        message: 'Diagnostic routine executed',
        results,
      });
    }

    if (action === 'test_log') {
      const entry = addLog(
        body.level || 'INFO',
        body.source || 'SYSTEM',
        body.message || 'Manual test log trigger from system console',
        body.details || null
      );
      return NextResponse.json({ success: true, data: entry });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    addLog('ERROR', 'SYSTEM', `Diagnostic handler error: ${errorMsg}`);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE() {
  clearLogs();
  return NextResponse.json({ success: true, message: 'Logs cleared successfully' });
}

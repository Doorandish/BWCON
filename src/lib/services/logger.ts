export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'TASK';
export type LogSource = 'DATABASE' | 'GEMINI_AI' | 'API_GATEWAY' | 'SYSTEM' | 'DIAGNOSTIC';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  details?: Record<string, unknown> | string | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __bwcon_system_logs__: LogEntry[] | undefined;
}

const MAX_LOGS = 200;

if (!global.__bwcon_system_logs__) {
  global.__bwcon_system_logs__ = [
    {
      id: 'boot-1',
      timestamp: new Date().toISOString(),
      level: 'INFO',
      source: 'SYSTEM',
      message: 'BWCON System Core initialized on Next.js 16 runtime.',
      details: {
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'production',
      },
    },
  ];
}

export function addLog(
  level: LogLevel,
  source: LogSource,
  message: string,
  details?: Record<string, unknown> | string | null
): LogEntry {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
    details: details ?? null,
  };

  const logs = global.__bwcon_system_logs__ || [];
  logs.unshift(entry);

  if (logs.length > MAX_LOGS) {
    logs.length = MAX_LOGS;
  }

  global.__bwcon_system_logs__ = logs;

  // Mirror to server console for platform-level log aggregation (e.g. Render/Datadog)
  const logPrefix = `[BWCON][${entry.level}][${entry.source}]`;
  if (level === 'ERROR') {
    console.error(logPrefix, message, details || '');
  } else if (level === 'WARN') {
    console.warn(logPrefix, message, details || '');
  } else {
    console.log(logPrefix, message, details || '');
  }

  return entry;
}

export function getLogs(limit = 100, level?: LogLevel): LogEntry[] {
  const logs = global.__bwcon_system_logs__ || [];
  if (level) {
    return logs.filter((log) => log.level === level).slice(0, limit);
  }
  return logs.slice(0, limit);
}

export function clearLogs(): void {
  global.__bwcon_system_logs__ = [
    {
      id: `clear-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      source: 'SYSTEM',
      message: 'System log buffer cleared by administrator.',
    },
  ];
}

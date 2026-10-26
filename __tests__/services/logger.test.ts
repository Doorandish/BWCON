import { addLog, getLogs, clearLogs } from '@/lib/services/logger';

describe('Logger Service', () => {
  beforeEach(() => {
    clearLogs();
  });

  it('records logs with appropriate levels and sources', () => {
    addLog('INFO', 'SYSTEM', 'System boot completed');
    addLog('ERROR', 'DATABASE', 'Connection timeout', { attempts: 3 });
    addLog('TASK', 'GEMINI_AI', 'Evaluating challenge', { candidateCount: 5 });

    const logs = getLogs();
    expect(logs.length).toBeGreaterThanOrEqual(3);

    const errorLog = logs.find((l) => l.level === 'ERROR');
    expect(errorLog).toBeDefined();
    expect(errorLog?.source).toBe('DATABASE');
    expect(errorLog?.message).toBe('Connection timeout');
  });

  it('filters logs by severity level', () => {
    addLog('INFO', 'SYSTEM', 'Info message');
    addLog('WARN', 'API_GATEWAY', 'Slow response warning');
    addLog('ERROR', 'DATABASE', 'Fatal database error');

    const errorLogs = getLogs(50, 'ERROR');
    expect(errorLogs.every((l) => l.level === 'ERROR')).toBe(true);

    const warnLogs = getLogs(50, 'WARN');
    expect(warnLogs.every((l) => l.level === 'WARN')).toBe(true);
  });

  it('clears logs when requested', () => {
    addLog('INFO', 'SYSTEM', 'Message 1');
    addLog('INFO', 'SYSTEM', 'Message 2');
    clearLogs();

    const logs = getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].message).toContain('buffer cleared');
  });
});

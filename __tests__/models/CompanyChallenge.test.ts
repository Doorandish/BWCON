import CompanyChallenge from '@/lib/db/models/CompanyChallenge';

describe('CompanyChallenge Model Validation', () => {
  const validData = {
    companyName: 'Siemens Energy AG',
    industry: 'Energy & Automation',
    challengeTitle: 'Autonomous Edge Anomaly Detection for Gas Turbines',
    challengeDescription: 'Real-time telemetry analysis from high-frequency vibration sensors with sub-50ms latency alert triggers.',
    desiredOutcome: 'Working edge container running anomaly detection model with >95% recall on sensor benchmarks.',
    budget: 350000,
    timeline: '6 months',
    requiredTechnologies: ['Rust', 'Edge AI', 'TimescaleDB', 'MQTT'],
    preferredStartupStage: ['mvp', 'growth'],
    contactEmail: 'innovation@siemens-energy.example.com',
  };

  it('validates a complete and correct challenge document', () => {
    const challenge = new CompanyChallenge(validData);
    const error = challenge.validateSync();
    expect(error).toBeUndefined();
  });

  it('defaults lifecycle status to open', () => {
    const challenge = new CompanyChallenge(validData);
    expect(challenge.status).toBe('open');
  });

  it('requires company name', () => {
    const challenge = new CompanyChallenge({ ...validData, companyName: '' });
    const error = challenge.validateSync();
    expect(error?.errors.companyName).toBeDefined();
  });

  it('requires challenge title', () => {
    const challenge = new CompanyChallenge({ ...validData, challengeTitle: '' });
    const error = challenge.validateSync();
    expect(error?.errors.challengeTitle).toBeDefined();
  });

  it('enforces maximum character length on title', () => {
    const challenge = new CompanyChallenge({ ...validData, challengeTitle: 'A'.repeat(301) });
    const error = challenge.validateSync();
    expect(error?.errors.challengeTitle).toBeDefined();
  });

  it('requires positive budget', () => {
    const challenge = new CompanyChallenge({ ...validData, budget: -1000 });
    const error = challenge.validateSync();
    expect(error?.errors.budget).toBeDefined();
  });

  it('accepts valid statuses', () => {
    const statuses = ['open', 'matching', 'matched', 'closed'];
    statuses.forEach((status) => {
      const challenge = new CompanyChallenge({ ...validData, status });
      const error = challenge.validateSync();
      expect(error).toBeUndefined();
    });

    const invalid = new CompanyChallenge({ ...validData, status: 'unknown_status' });
    const error = invalid.validateSync();
    expect(error?.errors.status).toBeDefined();
  });

  it('validates contact email format', () => {
    const challenge = new CompanyChallenge({ ...validData, contactEmail: 'not-valid-email' });
    const error = challenge.validateSync();
    expect(error?.errors.contactEmail).toBeDefined();
  });
});

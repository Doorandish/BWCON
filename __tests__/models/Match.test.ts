import mongoose from 'mongoose';
import Match from '@/lib/db/models/Match';

describe('Match Model Validation', () => {
  const validData = {
    challengeId: new mongoose.Types.ObjectId(),
    startupId: new mongoose.Types.ObjectId(),
    matchScore: 88,
    pros: [
      'Exceptional architectural alignment on edge computing constraints',
      'Demonstrated experience with high-frequency telemetry streams',
    ],
    cons: ['Limited presence in North American markets'],
    detailedExplanation: 'The candidate startup possesses ready-to-deploy edge inference pipelines that directly satisfy the sub-50ms latency metric required by the turbine inspection challenge.',
    estimatedCost: '$80,000 - $140,000',
    status: 'pending',
  };

  it('validates a complete and correct match document', () => {
    const match = new Match(validData);
    const error = match.validateSync();
    expect(error).toBeUndefined();
  });

  it('defaults status to pending', () => {
    const match = new Match(validData);
    expect(match.status).toBe('pending');
  });

  it('enforces score minimum 0 and maximum 100', () => {
    const negative = new Match({ ...validData, matchScore: -5 });
    expect(negative.validateSync()?.errors.matchScore).toBeDefined();

    const overMax = new Match({ ...validData, matchScore: 105 });
    expect(overMax.validateSync()?.errors.matchScore).toBeDefined();

    const validBoundaryMin = new Match({ ...validData, matchScore: 0 });
    expect(validBoundaryMin.validateSync()).toBeUndefined();

    const validBoundaryMax = new Match({ ...validData, matchScore: 100 });
    expect(validBoundaryMax.validateSync()).toBeUndefined();
  });

  it('requires at least one pro argument', () => {
    const match = new Match({ ...validData, pros: [] });
    const error = match.validateSync();
    expect(error?.errors.pros).toBeDefined();
  });

  it('requires detailed strategic explanation', () => {
    const match = new Match({ ...validData, detailedExplanation: '' });
    const error = match.validateSync();
    expect(error?.errors.detailedExplanation).toBeDefined();
  });

  it('requires estimated cost string', () => {
    const match = new Match({ ...validData, estimatedCost: '' });
    const error = match.validateSync();
    expect(error?.errors.estimatedCost).toBeDefined();
  });

  it('validates and stores multi-dimensional breakdown scores', () => {
    const match = new Match({
      ...validData,
      technicalScore: 95,
      maturityScore: 85,
      budgetScore: 80,
    });
    expect(match.validateSync()).toBeUndefined();
    expect(match.technicalScore).toBe(95);
    expect(match.maturityScore).toBe(85);
    expect(match.budgetScore).toBe(80);
  });

  it('enforces boundaries for breakdown scores (0 to 100)', () => {
    const invalidTech = new Match({ ...validData, technicalScore: -1 });
    expect(invalidTech.validateSync()?.errors.technicalScore).toBeDefined();

    const overMaxBudget = new Match({ ...validData, budgetScore: 101 });
    expect(overMaxBudget.validateSync()?.errors.budgetScore).toBeDefined();
  });
});

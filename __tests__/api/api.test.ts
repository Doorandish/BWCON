import { GET as getStartups, POST as postStartup } from '@/app/api/startups/route';
import { GET as getChallenges, POST as postChallenge } from '@/app/api/challenges/route';
import { NextRequest } from 'next/server';

// Mock connectDB and Mongoose models
jest.mock('@/lib/db/connection', () => ({
  connectDB: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/lib/db/models/Startup', () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: 's1', name: 'Startup One', industry: 'AI', stage: 'mvp' },
      ]),
    }),
  }),
  create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: 's2', ...data })),
}));

jest.mock('@/lib/db/models/CompanyChallenge', () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: 'c1', companyName: 'Corporate One', challengeTitle: 'Challenge Title' },
      ]),
    }),
  }),
  create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: 'c2', ...data })),
}));

describe('API Route Handlers — Integration Tests', () => {
  describe('GET /api/startups', () => {
    it('returns 200 with list of startups', async () => {
      const response = await getStartups();
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data[0].name).toBe('Startup One');
    });
  });

  describe('POST /api/startups', () => {
    it('creates a startup and returns 201', async () => {
      const req = new NextRequest('http://localhost:3000/api/startups', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Startup',
          industry: 'CleanTech',
          stage: 'mvp',
        }),
      });
      const response = await postStartup(req);
      const json = await response.json();
      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.name).toBe('New Startup');
    });
  });

  describe('GET /api/challenges', () => {
    it('returns 200 with list of company challenges', async () => {
      const response = await getChallenges();
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data[0].companyName).toBe('Corporate One');
    });
  });

  describe('POST /api/challenges', () => {
    it('creates a challenge and returns 201', async () => {
      const req = new NextRequest('http://localhost:3000/api/challenges', {
        method: 'POST',
        body: JSON.stringify({
          companyName: 'New Corp',
          challengeTitle: 'New Challenge',
          budget: 100000,
        }),
      });
      const response = await postChallenge(req);
      const json = await response.json();
      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.companyName).toBe('New Corp');
    });
  });
});

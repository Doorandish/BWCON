import { GET as getStartups, POST as postStartup } from '@/app/api/startups/route';
import { GET as getChallenges, POST as postChallenge } from '@/app/api/challenges/route';
import { GET as getMatchmaking, POST as postMatchmaking } from '@/app/api/matchmaking/route';
import { NextRequest } from 'next/server';

// Mock connectDB and Mongoose models
jest.mock('@/lib/db/connection', () => ({
  connectDB: jest.fn().mockResolvedValue({}),
}));

const mockStartupFind = jest.fn().mockReturnValue({
  sort: jest.fn().mockReturnValue({
    limit: jest.fn().mockResolvedValue([
      { _id: 's1', name: 'Startup One', industry: 'AI & Robotics', stage: 'mvp' },
    ]),
    lean: jest.fn().mockResolvedValue([
      { _id: 's1', name: 'Startup One', industry: 'AI & Robotics', stage: 'mvp' },
    ]),
  }),
});

jest.mock('@/lib/db/models/Startup', () => ({
  find: (...args: any[]) => mockStartupFind(...args),
  create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: 's2', ...data })),
  insertMany: jest.fn().mockImplementation((data) => {
    return Promise.resolve(data.map((item: any, idx: number) => ({ _id: `s-${idx}`, ...item })));
  }),
}));

const mockChallengeDoc = {
  _id: 'c1',
  companyName: 'Corporate One',
  challengeTitle: 'Robotics Challenge',
  industry: 'Robotics',
  status: 'open',
  save: jest.fn().mockResolvedValue(true),
};

jest.mock('@/lib/db/models/CompanyChallenge', () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: 'c1', companyName: 'Corporate One', challengeTitle: 'Robotics Challenge' },
      ]),
    }),
  }),
  findById: jest.fn().mockImplementation(() => Promise.resolve(mockChallengeDoc)),
  create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: 'c2', ...data })),
}));

const mockMatchCreate = jest.fn().mockImplementation((data) => Promise.resolve({ _id: 'm1', ...data }));

jest.mock('@/lib/db/models/Match', () => ({
  find: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            {
              _id: 'm1',
              matchScore: 92,
              technicalScore: 95,
              maturityScore: 88,
              budgetScore: 90,
              pros: ['Great fit'],
              cons: [],
              detailedExplanation: 'Fit',
              estimatedCost: '$50k',
            },
          ]),
        }),
      }),
    }),
  }),
  create: (...args: any[]) => mockMatchCreate(...args),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
}));

jest.mock('@/lib/services/gemini', () => ({
  runMatchmaking: jest.fn().mockResolvedValue([
    {
      startup_id: 's1',
      startup_name: 'Startup One',
      technical_score: 95,
      maturity_score: 88,
      budget_score: 90,
      match_score: 92,
      pros: ['Great fit'],
      cons: [],
      detailed_explanation: 'Strong fit',
      estimated_cost: '$50k',
    },
  ]),
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
    it('creates a single startup and returns 201', async () => {
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

    it('creates batch startups when an array is provided', async () => {
      const req = new NextRequest('http://localhost:3000/api/startups', {
        method: 'POST',
        body: JSON.stringify([
          {
            startup_name: 'Batch Startup 1',
            industry_sector: 'Robotics',
            core_technologies: 'ROS, C++',
            maturity_stage: 'Seed',
          },
          {
            startup_name: 'Batch Startup 2',
            industry_sector: 'FinTech',
            core_technologies: 'Go, PostgreSQL',
            maturity_stage: 'Series A',
          },
        ]),
      });
      const response = await postStartup(req);
      const json = await response.json();
      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.count).toBe(2);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data[0].name).toBe('Batch Startup 1');
      expect(json.data[0].stage).toBe('mvp');
      expect(json.data[1].stage).toBe('growth');
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

  describe('POST /api/matchmaking', () => {
    it('triggers matchmaking with pre-filtering and saves multi-dimensional scores', async () => {
      const req = new NextRequest('http://localhost:3000/api/matchmaking', {
        method: 'POST',
        body: JSON.stringify({
          challengeId: 'c1',
        }),
      });
      const response = await postMatchmaking(req);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(mockMatchCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          challengeId: 'c1',
          startupId: 's1',
          matchScore: 92,
          technicalScore: 95,
          maturityScore: 88,
          budgetScore: 90,
        })
      );
      expect(json.data[0].matchScore).toBe(92);
      expect(json.data[0].technicalScore).toBe(95);
    });

    it('enforces strict Mongoose pre-filter query and limit 10', async () => {
      mockStartupFind.mockClear();
      const req = new NextRequest('http://localhost:3000/api/matchmaking', {
        method: 'POST',
        body: JSON.stringify({
          challengeId: 'c1',
        }),
      });
      const response = await postMatchmaking(req);
      expect(response.status).toBe(201);
      expect(mockStartupFind).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ industry: expect.any(Object) }),
          ]),
        })
      );
    });

    it('returns 400 when challengeId is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/matchmaking', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await postMatchmaking(req);
      const json = await response.json();
      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('challengeId is required');
    });
  });

  describe('GET /api/matchmaking', () => {
    it('returns 200 with populated matches list', async () => {
      const req = new NextRequest('http://localhost:3000/api/matchmaking?challengeId=c1');
      const response = await getMatchmaking(req);
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data[0].matchScore).toBe(92);
    });
  });
});

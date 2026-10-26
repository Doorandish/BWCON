import { parseGeminiResponse, runMatchmaking, probeGeminiConnectivity, matchmakingResponseSchema } from '@/lib/services/gemini';
import { ICompanyChallenge } from '@/lib/db/models/CompanyChallenge';
import { IStartup } from '@/lib/db/models/Startup';
import mongoose from 'mongoose';

// Mock the GoogleGenerativeAI SDK
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockImplementation(() => ({
  generateContent: mockGenerateContent,
}));

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
    SchemaType: {
      STRING: 'string',
      NUMBER: 'number',
      INTEGER: 'integer',
      BOOLEAN: 'boolean',
      ARRAY: 'array',
      OBJECT: 'object',
    },
  };
});

describe('Gemini AI Service — JSON Parsing, Fallback & Probing Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-gemini-key-12345';
  });

  describe('parseGeminiResponse', () => {
    const validJsonArray = JSON.stringify([
      {
        startup_id: '64a1f89c9e88d71234567890',
        startup_name: 'QuantumVision Systems',
        match_score: 92,
        pros: [
          'Direct experience with industrial edge inference',
          'Proven integration with Siemens PLC environments',
        ],
        cons: ['Higher deployment cost'],
        detailed_explanation: 'Outstanding alignment on core latency and sensor processing requirements.',
        estimated_cost: '$75,000 - $120,000',
      },
    ]);

    it('successfully parses clean JSON array with multi-dimensional scores', () => {
      const detailedJson = JSON.stringify([
        {
          startup_id: '64a1f89c9e88d71234567890',
          startup_name: 'QuantumVision Systems',
          technical_score: 96,
          maturity_score: 88,
          budget_score: 85,
          match_score: 91,
          pros: [
            'Direct experience with industrial edge inference',
            'Proven integration with Siemens PLC environments',
          ],
          cons: ['Higher deployment cost'],
          detailed_explanation: 'Outstanding alignment on core latency and sensor processing requirements.',
          estimated_cost: '$75,000 - $120,000',
        },
      ]);
      const results = parseGeminiResponse(detailedJson);
      expect(results).toHaveLength(1);
      expect(results[0].startup_name).toBe('QuantumVision Systems');
      expect(results[0].match_score).toBe(91);
      expect(results[0].technical_score).toBe(96);
      expect(results[0].maturity_score).toBe(88);
      expect(results[0].budget_score).toBe(85);
      expect(results[0].pros).toHaveLength(2);
      expect(results[0].cons).toHaveLength(1);
      expect(results[0].estimated_cost).toBe('$75,000 - $120,000');
    });

    it('enforces schema contract and structure', () => {
      expect(matchmakingResponseSchema).toBeDefined();
      expect(matchmakingResponseSchema.type).toBe('array');
    });

    it('strips markdown code blocks (```json ... ```)', () => {
      const fenced = `\`\`\`json\n${validJsonArray}\n\`\`\``;
      const results = parseGeminiResponse(fenced);
      expect(results).toHaveLength(1);
      expect(results[0].startup_id).toBe('64a1f89c9e88d71234567890');
    });

    it('strips generic markdown code blocks (``` ... ```)', () => {
      const fenced = `\`\`\`\n${validJsonArray}\n\`\`\``;
      const results = parseGeminiResponse(fenced);
      expect(results).toHaveLength(1);
    });

    it('rounds floating-point scores to integer', () => {
      const floatJson = JSON.stringify([
        {
          startup_id: '123',
          startup_name: 'Test Startup',
          match_score: 87.6,
          pros: ['Strong fit'],
          cons: [],
          detailed_explanation: 'Solid fit across all operational constraints.',
          estimated_cost: '$50,000',
        },
      ]);
      const results = parseGeminiResponse(floatJson);
      expect(results[0].match_score).toBe(88);
    });

    it('throws error when JSON is not an array', () => {
      const singleObject = JSON.stringify({ match_score: 80 });
      expect(() => parseGeminiResponse(singleObject)).toThrow('Gemini response is not a JSON array');
    });

    it('throws error on out-of-range match_score (>100)', () => {
      const invalidScore = JSON.stringify([
        {
          startup_id: '123',
          startup_name: 'Test',
          match_score: 110,
          pros: ['Pro'],
          cons: [],
          detailed_explanation: 'Fit',
          estimated_cost: '$50k',
        },
      ]);
      expect(() => parseGeminiResponse(invalidScore)).toThrow('Invalid match_score');
    });

    it('throws error on negative match_score', () => {
      const invalidScore = JSON.stringify([
        {
          startup_id: '123',
          startup_name: 'Test',
          match_score: -5,
          pros: ['Pro'],
          cons: [],
          detailed_explanation: 'Fit',
          estimated_cost: '$50k',
        },
      ]);
      expect(() => parseGeminiResponse(invalidScore)).toThrow('Invalid match_score');
    });

    it('throws error when pros is empty or missing', () => {
      const emptyPros = JSON.stringify([
        {
          startup_id: '123',
          startup_name: 'Test',
          match_score: 85,
          pros: [],
          cons: [],
          detailed_explanation: 'Explanation',
          estimated_cost: '$50k',
        },
      ]);
      expect(() => parseGeminiResponse(emptyPros)).toThrow('pros must be a non-empty array');
    });

    it('throws error when detailed_explanation is empty', () => {
      const emptyExp = JSON.stringify([
        {
          startup_id: '123',
          startup_name: 'Test',
          match_score: 85,
          pros: ['Strong team'],
          cons: [],
          detailed_explanation: '',
          estimated_cost: '$50k',
        },
      ]);
      expect(() => parseGeminiResponse(emptyExp)).toThrow('detailed_explanation must be a non-empty string');
    });
  });

  describe('runMatchmaking (Mocked Gemini Execution & Fallback)', () => {
    const mockChallenge = {
      _id: new mongoose.Types.ObjectId(),
      companyName: 'Bosch Mobility',
      industry: 'Automotive',
      challengeTitle: 'Autonomous Fleet Telemetry Analysis',
      challengeDescription: 'High-throughput edge processing for connected vehicles.',
      desiredOutcome: 'Sub-second anomaly alert system.',
      budget: 500000,
      timeline: '6 months',
      requiredTechnologies: ['Kafka', 'Rust', 'TimescaleDB'],
      preferredStartupStage: ['mvp', 'growth'],
    } as unknown as ICompanyChallenge;

    const mockStartups = [
      {
        _id: new mongoose.Types.ObjectId('64a1f89c9e88d71234567891'),
        name: 'AutoTelemetry AI',
        industry: 'Automotive Tech',
        description: 'Streaming analytics for vehicular CAN bus and sensors.',
        technologies: ['Rust', 'Kafka', 'Python'],
        stage: 'growth',
        teamSize: 15,
        fundingRaised: 2000000,
        location: 'Berlin, Germany',
      },
    ] as unknown as IStartup[];

    it('returns empty array when no startups are available without calling Gemini', async () => {
      const matches = await runMatchmaking(mockChallenge, []);
      expect(matches).toEqual([]);
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('invokes Gemini API and returns parsed structured matches on first model success', async () => {
      const mockGeminiOutput = JSON.stringify([
        {
          startup_id: '64a1f89c9e88d71234567891',
          startup_name: 'AutoTelemetry AI',
          match_score: 95,
          pros: ['Native Rust tech stack matches latency requirements', 'Experienced in vehicular CAN bus protocols'],
          cons: ['Already committed to existing OEM pilots'],
          detailed_explanation: 'Strongest possible technological fit. Their existing telemetry engine aligns directly with the challenge.',
          estimated_cost: '$150,000 - $250,000',
        },
      ]);

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => `\`\`\`json\n${mockGeminiOutput}\n\`\`\``,
        },
      });

      const matches = await runMatchmaking(mockChallenge, mockStartups);

      expect(mockGetGenerativeModel).toHaveBeenCalledWith(
        expect.objectContaining({
          generationConfig: expect.objectContaining({
            responseMimeType: 'application/json',
            responseSchema: matchmakingResponseSchema,
          }),
        })
      );
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(matches).toHaveLength(1);
      expect(matches[0].startup_name).toBe('AutoTelemetry AI');
      expect(matches[0].match_score).toBe(95);
    });

    it('falls back to secondary model if first model rejects call (e.g. model not found/deprecated)', async () => {
      const mockGeminiOutput = JSON.stringify([
        {
          startup_id: '64a1f89c9e88d71234567891',
          startup_name: 'AutoTelemetry AI',
          match_score: 91,
          pros: ['Great fallback match'],
          cons: [],
          detailed_explanation: 'Evaluated on secondary model successfully.',
          estimated_cost: '$100,000',
        },
      ]);

      // First model fails (simulating deprecated model error)
      mockGenerateContent.mockRejectedValueOnce(new Error('models/gemini-2.0-flash is not found or expired'));
      // Second model succeeds
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => mockGeminiOutput,
        },
      });

      const matches = await runMatchmaking(mockChallenge, mockStartups);
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      expect(matches).toHaveLength(1);
      expect(matches[0].match_score).toBe(91);
    });

    it('throws error when GEMINI_API_KEY is not defined', async () => {
      delete process.env.GEMINI_API_KEY;
      await expect(runMatchmaking(mockChallenge, mockStartups)).rejects.toThrow('GEMINI_API_KEY is not configured');
    });
  });

  describe('probeGeminiConnectivity', () => {
    it('returns success: true when model handshake passes', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'OK',
        },
      });

      const result = await probeGeminiConnectivity('test-key');
      expect(result.success).toBe(true);
      expect(result.response).toBe('OK');
    });

    it('returns error when API key is missing', async () => {
      delete process.env.GEMINI_API_KEY;
      const result = await probeGeminiConnectivity('');
      expect(result.success).toBe(false);
      expect(result.error).toContain('GEMINI_API_KEY is not defined');
    });
  });
});

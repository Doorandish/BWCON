import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai';
import { IStartup } from '@/lib/db/models/Startup';
import { ICompanyChallenge } from '@/lib/db/models/CompanyChallenge';
import { addLog } from '@/lib/services/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. AI matchmaking will not function until configured.');
}

export interface MatchResult {
  startup_id: string;
  startup_name: string;
  technical_score: number;
  maturity_score: number;
  budget_score: number;
  match_score: number;
  pros: string[];
  cons: string[];
  detailed_explanation: string;
  estimated_cost: string;
}

/**
 * Strict Native JSON Response Schema enforced at the Gemini API level
 */
export const matchmakingResponseSchema: ResponseSchema = {
  type: SchemaType.ARRAY,
  description: 'Evaluated matches between corporate challenge and candidate startups with multi-dimensional scoring',
  items: {
    type: SchemaType.OBJECT,
    properties: {
      startup_id: { type: SchemaType.STRING, description: 'Exact candidate startup ID' },
      startup_name: { type: SchemaType.STRING, description: 'Candidate startup name' },
      technical_score: { type: SchemaType.INTEGER, description: 'Technical capability and stack synergy score (0-100)' },
      maturity_score: { type: SchemaType.INTEGER, description: 'Team readiness, stage, and operational track record score (0-100)' },
      budget_score: { type: SchemaType.INTEGER, description: 'Budget and engagement cost fit score (0-100)' },
      match_score: { type: SchemaType.INTEGER, description: 'Weighted composite match score (0-100)' },
      pros: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: 'Key strategic synergies and advantages (2-5 items)',
      },
      cons: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: 'Key risks or integration challenges (1-3 items)',
      },
      detailed_explanation: { type: SchemaType.STRING, description: 'Detailed strategic fit rationale (2-4 sentences)' },
      estimated_cost: { type: SchemaType.STRING, description: 'Estimated project engagement budget range (e.g., "$50,000 - $120,000")' },
    },
    required: [
      'startup_id',
      'startup_name',
      'technical_score',
      'maturity_score',
      'budget_score',
      'match_score',
      'pros',
      'cons',
      'detailed_explanation',
      'estimated_cost',
    ],
  },
};

// Ordered list of candidate models for maximum resilience and cross-version compatibility
export const DEFAULT_CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.8-flash',
  'gemini-3.1-pro-preview',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
].filter(Boolean) as string[];

function buildMatchmakingPrompt(
  challenge: ICompanyChallenge,
  startups: IStartup[]
): string {
  const startupData = startups.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    industry: s.industry,
    description: s.description,
    technologies: s.technologies,
    stage: s.stage,
    teamSize: s.teamSize,
    fundingRaised: s.fundingRaised,
    location: s.location,
  }));

  return `You are an expert corporate-startup matchmaking evaluator. Analyze the following corporate challenge and available startups.

CORPORATE CHALLENGE:
- Company: ${challenge.companyName}
- Industry: ${challenge.industry}
- Challenge: ${challenge.challengeTitle}
- Description: ${challenge.challengeDescription}
- Desired Outcome: ${challenge.desiredOutcome}
- Budget: $${challenge.budget.toLocaleString()}
- Timeline: ${challenge.timeline}
- Required Technologies: ${challenge.requiredTechnologies.join(', ') || 'None specified'}
- Preferred Startup Stages: ${challenge.preferredStartupStage.join(', ') || 'Any'}

AVAILABLE STARTUPS:
${JSON.stringify(startupData, null, 2)}

INSTRUCTIONS & SCORING METHODOLOGY:
1. Multi-Dimensional Scoring (0-100 per dimension):
   - technical_score: Depth of technological synergy, stack alignment (${challenge.requiredTechnologies.join(', ') || 'general'}), and feasibility of achieving: "${challenge.desiredOutcome}".
   - maturity_score: Operational readiness, team capacity (${challenge.preferredStartupStage.join(', ') || 'any stage'}), and ability to deliver within ${challenge.timeline}.
   - budget_score: Commercial viability and alignment with corporate budget of $${challenge.budget.toLocaleString()}.
2. Weighted Composite Score:
   Calculate match_score strictly using this formula:
   match_score = Math.round((0.45 * technical_score) + (0.35 * maturity_score) + (0.20 * budget_score))
3. Threshold:
   Only return startups where match_score >= 30.
4. Output Format:
   Return a JSON array adhering to the native schema.`;
}

export function parseGeminiResponse(responseText: string): MatchResult[] {
  // Strip markdown code fences if present (fallback for legacy or edge-case completions)
  let cleaned = responseText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error('Gemini response is not a JSON array');
  }

  // Validate and sanitize each match result with multi-dimensional scoring support
  return parsed.map((item: Record<string, unknown>) => {
    const rawScore = Number(item.match_score);
    if (isNaN(rawScore) || rawScore < 0 || rawScore > 100) {
      throw new Error(`Invalid match_score: ${item.match_score}`);
    }

    const technicalScore = item.technical_score !== undefined
      ? Math.round(Math.max(0, Math.min(100, Number(item.technical_score) || 0)))
      : Math.round(rawScore);

    const maturityScore = item.maturity_score !== undefined
      ? Math.round(Math.max(0, Math.min(100, Number(item.maturity_score) || 0)))
      : Math.round(rawScore);

    const budgetScore = item.budget_score !== undefined
      ? Math.round(Math.max(0, Math.min(100, Number(item.budget_score) || 0)))
      : Math.round(rawScore);

    if (!Array.isArray(item.pros) || item.pros.length === 0) {
      throw new Error('pros must be a non-empty array');
    }
    if (!Array.isArray(item.cons)) {
      throw new Error('cons must be an array');
    }
    if (typeof item.detailed_explanation !== 'string' || !item.detailed_explanation) {
      throw new Error('detailed_explanation must be a non-empty string');
    }
    if (typeof item.estimated_cost !== 'string' || !item.estimated_cost) {
      throw new Error('estimated_cost must be a non-empty string');
    }

    return {
      startup_id: String(item.startup_id),
      startup_name: String(item.startup_name),
      technical_score: technicalScore,
      maturity_score: maturityScore,
      budget_score: budgetScore,
      match_score: Math.round(rawScore),
      pros: item.pros.map(String),
      cons: item.cons.map(String),
      detailed_explanation: String(item.detailed_explanation),
      estimated_cost: String(item.estimated_cost),
    };
  });
}

/**
 * Probes the Gemini API with a lightweight handshake to verify key validity and model availability
 */
export async function probeGeminiConnectivity(apiKey?: string): Promise<{
  success: boolean;
  modelUsed?: string;
  response?: string;
  error?: string;
}> {
  const key = apiKey || process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!key) {
    return {
      success: false,
      error: 'GEMINI_API_KEY is not defined in process.env.',
    };
  }

  const genAI = new GoogleGenerativeAI(key);
  let lastError: string = 'Unknown error';

  for (const modelName of DEFAULT_CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const testResult = await model.generateContent('Respond with "OK"');
      const text = testResult.response.text();
      return {
        success: true,
        modelUsed: modelName,
        response: text.trim(),
      };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      addLog('WARN', 'GEMINI_AI', `Probe on model "${modelName}" failed: ${lastError}. Attempting fallback...`);
    }
  }

  return {
    success: false,
    error: `All candidate models failed. Last error: ${lastError}`,
  };
}

export async function runMatchmaking(
  challenge: ICompanyChallenge,
  startups: IStartup[]
): Promise<MatchResult[]> {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!apiKey) {
    const errorMsg = 'GEMINI_API_KEY is not configured in process.env. Please configure GEMINI_API_KEY in Render.com or local environment.';
    addLog('ERROR', 'GEMINI_AI', errorMsg, {
      hint: 'Get an API key from Google AI Studio and configure GEMINI_API_KEY in your environment variables.',
    });
    throw new Error(errorMsg);
  }

  if (startups.length === 0) {
    addLog('WARN', 'GEMINI_AI', 'Matchmaking triggered with 0 available startups in database.', {
      challengeId: String(challenge._id),
      challengeTitle: challenge.challengeTitle,
    });
    return [];
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildMatchmakingPrompt(challenge, startups);

  let lastError: Error | null = null;

  for (const modelName of DEFAULT_CANDIDATE_MODELS) {
    addLog('TASK', 'GEMINI_AI', `Attempting evaluation with model "${modelName}" for challenge "${challenge.challengeTitle}"...`, {
      model: modelName,
      candidateCount: startups.length,
    });

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: matchmakingResponseSchema,
        },
      });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const matches = parseGeminiResponse(text);

      addLog('INFO', 'GEMINI_AI', `Gemini (${modelName}) successfully evaluated and generated ${matches.length} strategic match(es).`, {
        modelUsed: modelName,
        challengeTitle: challenge.challengeTitle,
        matchesReturned: matches.length,
        topScore: matches[0]?.match_score || 0,
      });

      return matches;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      addLog('WARN', 'GEMINI_AI', `Model "${modelName}" evaluation failed: ${lastError.message}. Trying next candidate model...`, {
        failedModel: modelName,
        error: lastError.message,
      });
    }
  }

  const finalMessage = `All Gemini candidate models failed. Last error: ${lastError?.message || 'Unknown'}`;
  addLog('ERROR', 'GEMINI_AI', finalMessage);
  throw new Error(finalMessage);
}

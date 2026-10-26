import { GoogleGenerativeAI } from '@google/generative-ai';
import { IStartup } from '@/lib/db/models/Startup';
import { ICompanyChallenge } from '@/lib/db/models/CompanyChallenge';
import { addLog } from '@/lib/services/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. AI matchmaking will not function.');
}

export interface MatchResult {
  startup_id: string;
  startup_name: string;
  match_score: number;
  pros: string[];
  cons: string[];
  detailed_explanation: string;
  estimated_cost: string;
}

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

  return `You are an expert corporate-startup matchmaking evaluator. Analyze the following corporate challenge and available startups. Return a JSON array of matches.

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

INSTRUCTIONS:
1. Evaluate each startup against the corporate challenge.
2. Only include startups with a match_score >= 30.
3. For each matched startup, provide:
   - startup_id: The exact startup ID string
   - startup_name: The startup's name
   - match_score: A number from 0-100 based on alignment
   - pros: An array of 2-5 specific advantages
   - cons: An array of 1-3 specific risks or disadvantages
   - detailed_explanation: A 2-4 sentence strategic fit analysis
   - estimated_cost: An estimated engagement cost range string (e.g., "$50,000 - $150,000")

RESPOND WITH ONLY A VALID JSON ARRAY. No markdown, no explanation outside the JSON.
Example format:
[
  {
    "startup_id": "abc123",
    "startup_name": "TechStartup",
    "match_score": 85,
    "pros": ["Strong tech alignment", "Experienced team"],
    "cons": ["Limited funding history"],
    "detailed_explanation": "This startup aligns well because...",
    "estimated_cost": "$50,000 - $100,000"
  }
]`;
}

export function parseGeminiResponse(responseText: string): MatchResult[] {
  // Strip markdown code fences if present
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

  // Validate and sanitize each match result
  return parsed.map((item: Record<string, unknown>) => {
    if (typeof item.match_score !== 'number' || item.match_score < 0 || item.match_score > 100) {
      throw new Error(`Invalid match_score: ${item.match_score}`);
    }
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
      match_score: Math.round(item.match_score),
      pros: item.pros.map(String),
      cons: item.cons.map(String),
      detailed_explanation: String(item.detailed_explanation),
      estimated_cost: String(item.estimated_cost),
    };
  });
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

  addLog('TASK', 'GEMINI_AI', `Running Gemini 2.0 Flash matchmaking evaluation for challenge "${challenge.challengeTitle}" across ${startups.length} candidate startup(s)...`, {
    challengeTitle: challenge.challengeTitle,
    company: challenge.companyName,
    candidateCount: startups.length,
    model: 'gemini-2.0-flash',
  });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = buildMatchmakingPrompt(challenge, startups);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const matches = parseGeminiResponse(text);

    addLog('INFO', 'GEMINI_AI', `Gemini successfully evaluated and generated ${matches.length} strategic match(es).`, {
      challengeTitle: challenge.challengeTitle,
      matchesReturned: matches.length,
      topScore: matches[0]?.match_score || 0,
    });

    return matches;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    addLog('ERROR', 'GEMINI_AI', `Gemini matchmaking evaluation failed: ${errorMsg}`, {
      rawError: errorMsg,
      challengeTitle: challenge.challengeTitle,
    });
    throw err;
  }
}

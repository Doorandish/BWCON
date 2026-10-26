import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import CompanyChallenge from '@/lib/db/models/CompanyChallenge';
import Startup, { IStartup } from '@/lib/db/models/Startup';
import Match from '@/lib/db/models/Match';
import { runMatchmaking } from '@/lib/services/gemini';
import { addLog } from '@/lib/services/logger';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');

    const query = challengeId ? { challengeId } : {};
    const matches = await Match.find(query)
      .populate('startupId')
      .populate('challengeId')
      .sort({ matchScore: -1 })
      .lean();

    return NextResponse.json({ success: true, data: matches }, { status: 200 });
  } catch (error) {
    console.error('GET /api/matchmaking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: 'challengeId is required' },
        { status: 400 }
      );
    }

    // Fetch the challenge
    const challenge = await CompanyChallenge.findById(challengeId);
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Update challenge status
    challenge.status = 'matching';
    await challenge.save();

    // Strict Database Pre-Filtering (MongoDB)
    // 1. Extract industry tokens
    const industryTokens = (challenge.industry || '')
      .split(/[,/&|]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2);

    // 2. Extract required technologies tokens
    const techTokens = (challenge.requiredTechnologies || [])
      .flatMap((t) => t.split(/[,/&|]+/))
      .map((t) => t.trim())
      .filter((t) => t.length > 1);

    const queryFilters: Record<string, any>[] = [];

    if (industryTokens.length > 0) {
      const industryRegexes = industryTokens.map((t) => new RegExp(t, 'i'));
      queryFilters.push({ industry: { $in: industryRegexes } });
      queryFilters.push({ description: { $in: industryRegexes } });
    }

    if (techTokens.length > 0) {
      const techRegexes = techTokens.map((t) => new RegExp(t, 'i'));
      queryFilters.push({ technologies: { $in: techRegexes } });
      queryFilters.push({ description: { $in: techRegexes } });
    }

    let startups: IStartup[] = [];

    // Query with strict limit of 10 candidates to minimize payload & context footprint
    if (queryFilters.length > 0) {
      startups = await Startup.find({ $or: queryFilters })
        .sort({ updatedAt: -1 })
        .limit(10);
    }

    // 3. Fallback: If strict filtering yielded under 3 candidates, broaden to top 10 most recent startups
    if (startups.length < 3) {
      startups = await Startup.find()
        .sort({ updatedAt: -1 })
        .limit(10);
    }

    addLog('INFO', 'API_GATEWAY', `Strict Mongoose pre-filter selected ${startups.length} startup(s) (strictly capped at 10) for challenge "${challenge.challengeTitle}".`, {
      challengeIndustry: challenge.industry,
      requiredTechnologies: challenge.requiredTechnologies,
      candidatesSelected: startups.length,
      maxCandidateLimit: 10,
      tokenProtectionActive: true,
    });

    if (startups.length === 0) {
      challenge.status = 'open';
      await challenge.save();
      return NextResponse.json(
        { success: false, error: 'No startups available for matching' },
        { status: 400 }
      );
    }

    // Run AI matchmaking with Native Structured Outputs
    const matchResults = await runMatchmaking(challenge, startups);

    // Delete previous matches for this challenge
    await Match.deleteMany({ challengeId: challenge._id });

    // Save new matches with multi-dimensional scoring breakdown
    const savedMatches = await Promise.all(
      matchResults.map(async (result) => {
        const match = await Match.create({
          challengeId: challenge._id,
          startupId: result.startup_id,
          matchScore: result.match_score,
          technicalScore: result.technical_score,
          maturityScore: result.maturity_score,
          budgetScore: result.budget_score,
          pros: result.pros,
          cons: result.cons,
          detailedExplanation: result.detailed_explanation,
          estimatedCost: result.estimated_cost,
        });
        return match;
      })
    );

    // Update challenge status
    challenge.status = 'matched';
    await challenge.save();

    // Return populated matches
    const populatedMatches = await Match.find({ challengeId: challenge._id })
      .populate('startupId')
      .populate('challengeId')
      .sort({ matchScore: -1 })
      .lean();

    return NextResponse.json(
      { success: true, data: populatedMatches },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/matchmaking error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Matchmaking failed' },
      { status: 500 }
    );
  }
}

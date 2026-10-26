import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import CompanyChallenge from '@/lib/db/models/CompanyChallenge';
import Startup from '@/lib/db/models/Startup';
import Match from '@/lib/db/models/Match';
import { runMatchmaking } from '@/lib/services/gemini';

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

    // Fetch all startups
    const startups = await Startup.find();

    if (startups.length === 0) {
      challenge.status = 'open';
      await challenge.save();
      return NextResponse.json(
        { success: false, error: 'No startups available for matching' },
        { status: 400 }
      );
    }

    // Run AI matchmaking
    const matchResults = await runMatchmaking(challenge, startups);

    // Delete previous matches for this challenge
    await Match.deleteMany({ challengeId: challenge._id });

    // Save new matches
    const savedMatches = await Promise.all(
      matchResults.map(async (result) => {
        const match = await Match.create({
          challengeId: challenge._id,
          startupId: result.startup_id,
          matchScore: result.match_score,
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

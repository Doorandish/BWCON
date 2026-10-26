import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import CompanyChallenge from '@/lib/db/models/CompanyChallenge';

export async function GET() {
  try {
    await connectDB();
    const challenges = await CompanyChallenge.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: challenges }, { status: 200 });
  } catch (error) {
    console.error('GET /api/challenges error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const challenge = await CompanyChallenge.create(body);
    return NextResponse.json({ success: true, data: challenge }, { status: 201 });
  } catch (error) {
    console.error('POST /api/challenges error:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}

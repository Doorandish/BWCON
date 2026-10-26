import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Startup from '@/lib/db/models/Startup';

export async function GET() {
  try {
    await connectDB();
    const startups = await Startup.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: startups }, { status: 200 });
  } catch (error) {
    console.error('GET /api/startups error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch startups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const startup = await Startup.create(body);
    return NextResponse.json({ success: true, data: startup }, { status: 201 });
  } catch (error) {
    console.error('POST /api/startups error:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create startup' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Startup from '@/lib/db/models/Startup';
import { addLog } from '@/lib/services/logger';

type ValidStage = 'idea' | 'mvp' | 'growth' | 'scale';

const stageMap: Record<string, ValidStage> = {
  'pre-seed': 'idea',
  'seed': 'mvp',
  'series a': 'growth',
  'series b': 'scale',
  'series c': 'scale',
  'series a+': 'scale',
  'idea': 'idea',
  'mvp': 'mvp',
  'growth': 'growth',
  'scale': 'scale',
};

function normalizeStartup(raw: Record<string, any>) {
  const name = String(raw.name || raw.startup_name || '').trim();
  const industry = String(raw.industry || raw.industry_sector || '').trim();
  const description = String(raw.description || raw.executive_summary_and_solution_description || '').trim();
  
  let technologies: string[] = [];
  if (Array.isArray(raw.technologies)) {
    technologies = raw.technologies.map(String);
  } else if (typeof (raw.technologies || raw.core_technologies) === 'string') {
    technologies = (raw.technologies || raw.core_technologies).split(',').map((t: string) => t.trim()).filter(Boolean);
  }

  const rawStage = String(raw.stage || raw.maturity_stage || 'mvp').toLowerCase();
  const stage: ValidStage = stageMap[rawStage] || (['idea', 'mvp', 'growth', 'scale'].includes(rawStage) ? (rawStage as ValidStage) : 'mvp');
  
  const teamSize = Number(raw.teamSize || raw.full_time_team_size || 1);
  const fundingRaised = Number(raw.fundingRaised ?? raw.total_funding_raised ?? 0);
  const location = String(raw.location || raw.headquarters_location || 'Unknown').trim();
  const website = raw.website || raw.official_website || undefined;
  const contactEmail = String(raw.contactEmail || raw.lead_contact_email || 'contact@startup.com').trim();

  return {
    name,
    industry,
    description,
    technologies,
    stage,
    teamSize,
    fundingRaised,
    location,
    website,
    contactEmail,
  };
}

export async function GET() {
  try {
    await connectDB();
    const startups = await Startup.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: startups.length, data: startups }, { status: 200 });
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

    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Empty JSON array provided' },
          { status: 400 }
        );
      }

      const normalizedList = body.map(normalizeStartup);
      // Use insertMany or create for array
      const createdStartups = await Startup.insertMany(normalizedList);

      addLog('INFO', 'API_GATEWAY', `Batch imported ${createdStartups.length} startup(s) successfully.`, {
        count: createdStartups.length,
        firstStartup: normalizedList[0]?.name,
      });

      return NextResponse.json(
        { success: true, count: createdStartups.length, data: createdStartups },
        { status: 201 }
      );
    }

    const normalizedSingle = normalizeStartup(body);
    const startup = await Startup.create(normalizedSingle);

    addLog('INFO', 'API_GATEWAY', `Startup "${startup.name}" registered successfully.`, {
      id: String(startup._id),
      name: startup.name,
    });

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
      { success: false, error: error instanceof Error ? error.message : 'Failed to create startup' },
      { status: 500 }
    );
  }
}

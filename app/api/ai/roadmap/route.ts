import { NextResponse } from 'next/server';
import { runGoalAgent } from '@/lib/agents/goal-agent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = body.title || 'Personal Goal';
    const description = body.description || '';

    const milestones = await runGoalAgent(title, description);
    return NextResponse.json({ success: true, milestones });
  } catch (error) {
    console.error('API Roadmap Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

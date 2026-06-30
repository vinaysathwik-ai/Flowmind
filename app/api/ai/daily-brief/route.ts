import { NextResponse } from 'next/server';
import { runInsightAgent } from '@/lib/agents/insight-agent';
import { runPrioritizationAgent } from '@/lib/agents/prioritization-agent';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name ?? user.email ?? 'User';

    // Fetch pending and in-progress tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_progress'])
      .order('ai_score', { ascending: false });

    const taskList = tasks ?? [];

    // Run prioritization to get scores/summaries
    const prioritization = await runPrioritizationAgent(taskList);

    // Count at-risk tasks (critical + high priority past due or soon due)
    const now = new Date();
    const atRiskCount = taskList.filter(t => {
      if (!t.due_date) return false;
      const daysUntilDue = (new Date(t.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return (t.priority === 'critical' || t.priority === 'high') && daysUntilDue <= 3;
    }).length;

    const completedToday = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('completed_at', new Date().toISOString().split('T')[0]);

    const completedCount = (completedToday.count ?? 0);

    const prioritySummary = prioritization.slice(0, 3)
      .map((p: { title: string; score: number }) => `${p.title} (score: ${p.score})`)
      .join('. ');

    // Run insight agent with live data
    const brief = await runInsightAgent(
      userName,
      atRiskCount,
      completedCount,
      prioritySummary || 'No critical items at this time.'
    );

    // Persist or update today's daily brief in the database
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('daily_briefs').upsert({
      user_id: user.id,
      brief_date: today,
      at_risk_count: atRiskCount,
      recommendation: brief.recommendation,
      summary: brief,
    }, { onConflict: 'user_id, brief_date' });

    return NextResponse.json({ success: true, brief, at_risk_count: atRiskCount, completed_count: completedCount });
  } catch (error) {
    console.error('Daily Brief API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

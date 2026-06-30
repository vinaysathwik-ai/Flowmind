import { NextResponse } from 'next/server';
import { runPrioritizationAgent } from '@/lib/agents/prioritization-agent';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all pending and in_progress tasks for this user
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    const result = await runPrioritizationAgent(tasks ?? []);

    // Write AI scores and reasons back to the tasks table
    if (result?.length) {
      await Promise.all(
        result.map(({ task_id, score, reason }: { task_id: string; score: number; reason: string }) =>
          supabase
            .from('tasks')
            .update({ ai_score: score, ai_reason: reason, is_ai_sorted: true })
            .eq('id', task_id)
            .eq('user_id', user.id)
        )
      );
    }

    return NextResponse.json({ success: true, priorities: result });
  } catch (error) {
    console.error('Prioritize API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

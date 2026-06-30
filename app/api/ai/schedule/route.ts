import { NextResponse } from 'next/server';
import { runSchedulingAgent } from '@/lib/agents/scheduling-agent';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch at-risk tasks (critical/high, not completed)
    const { data: atRiskTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('priority', ['critical', 'high'])
      .in('status', ['pending', 'in_progress'])
      .order('ai_score', { ascending: false })
      .limit(10);

    // Fetch today's calendar events to avoid scheduling conflicts
    const today = new Date().toISOString().split('T')[0];
    const { data: events } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', `${today}T00:00:00`)
      .lte('start_time', `${today}T23:59:59`);

    // Fetch user profile for peak hours
    const { data: profile } = await supabase
      .from('profiles')
      .select('peak_focus_start, peak_focus_end')
      .eq('id', user.id)
      .single();

    const peakStart = profile?.peak_focus_start ?? '09:00';
    const peakEnd = profile?.peak_focus_end ?? '12:00';

    const result = await runSchedulingAgent(
      atRiskTasks ?? [],
      events ?? [],
      peakStart,
      peakEnd
    );

    // Save generated focus blocks to calendar_events
    if (result.scheduled_blocks?.length) {
      const inserts = result.scheduled_blocks.map(block => ({
        user_id: user.id,
        title: block.title,
        start_time: block.start_time,
        end_time: block.end_time,
        color_code: block.color_code,
        task_id: block.task_id ?? null,
        is_ai_scheduled: true,
        source: 'flowmind',
      }));

      await supabase.from('calendar_events').insert(inserts);
    }

    // Mark deferred tasks
    if (result.deferred_task_ids?.length) {
      await supabase
        .from('tasks')
        .update({ is_deferred: true, status: 'deferred' })
        .in('id', result.deferred_task_ids)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true, schedule: result });
  } catch (error) {
    console.error('Schedule API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

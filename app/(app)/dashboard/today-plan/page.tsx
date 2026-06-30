'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MOCK_CALENDAR_EVENTS, MOCK_HABITS, MOCK_TASKS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { CalendarEvent, Habit, Task } from '@/types';

const COLOR_STYLES: Record<string, { bar: string; bg: string; text: string }> = {
  purple: { bar: 'bg-[var(--color-brand-purple)]', bg: 'bg-[var(--color-purple-light)]', text: 'text-[var(--color-brand-purple)]' },
  green:  { bar: 'bg-[var(--color-teal)]', bg: 'bg-[var(--color-teal-light)]', text: 'text-[var(--color-teal)]' },
  amber:  { bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  gray:   { bar: 'bg-[var(--color-gray)]', bg: 'bg-[var(--color-gray-light)]', text: 'text-[var(--color-gray)]' },
  red:    { bar: 'bg-[var(--color-red)]', bg: 'bg-[var(--color-red-light)]', text: 'text-[var(--color-red)]' },
};

const DEADLINE_RISK: Record<string, string> = { critical: 'risk-bar-red', high: 'risk-bar-amber', medium: 'risk-bar-purple' };

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function TodayPlanPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(isSupabaseConfigured() ? [] : MOCK_CALENDAR_EVENTS);
  const [habits, setHabits] = useState<Habit[]>(isSupabaseConfigured() ? [] : MOCK_HABITS);
  const [tasks, setTasks] = useState<Task[]>(isSupabaseConfigured() ? [] : MOCK_TASKS);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch calendar events for today
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: dbEvents } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', `${todayStr}T00:00:00`)
          .lte('start_time', `${todayStr}T23:59:59`)
          .order('start_time', { ascending: true });

        if (dbEvents) setEvents(dbEvents);

        // Fetch habits
        const { data: dbHabits } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('order_index', { ascending: true });

        if (dbHabits) setHabits(dbHabits);

        // Fetch tasks
        const { data: dbTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['pending', 'in_progress']);

        if (dbTasks) setTasks(dbTasks);
      } catch (err) {
        console.error('Failed to fetch plan data:', err);
      }
    })();
  }, []);

  const atRiskTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high');
  const activeHabits = habits.filter(h => (h.streak_count ?? 0) > 0);

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Today&apos;s Plan</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/dashboard" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Dashboard
        </Link>
        <Link href="/dashboard/today-plan" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          Today's Plan
        </Link>
        <Link href="/dashboard/streaks" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Streaks &amp; Deadlines
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left: Timeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              AI-Built Timeline
            </h2>
            <span className="badge-ai text-[10px] px-2 py-0.5 rounded-full">AI built</span>
          </div>
          <div className="space-y-2">
            {events.map((event) => {
              return (
                <div key={event.id}
                  className={cn('card-base flex gap-3', `border-l-2 border-[var(--color-brand-purple)]`)}
                  style={{ borderLeftColor: event.color_code === 'purple' ? 'var(--color-brand-purple)' : event.color_code === 'green' ? 'var(--color-teal)' : '#D97706' }}
                >
                  <div className="flex-shrink-0 text-right" style={{ minWidth: '60px' }}>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {format(new Date(event.start_time), 'h:mm a')}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {format(new Date(event.end_time), 'h:mm a')}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{event.title}</p>
                      {event.is_ai_scheduled && (
                        <span className="badge-ai text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles size={8} /> AI scheduled
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{event.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {events.length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                No events scheduled for today. Run scheduling agent on the dashboard to build your timeline!
              </p>
            )}
          </div>
        </div>

        {/* Right: Streaks & Deadlines */}
        <div className="space-y-5">
          {/* Streaks */}
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Active Streaks
            </h2>
            <div className="space-y-2">
              {activeHabits.map(habit => (
                <div key={habit.id} className="card-base flex items-center gap-3"
                  style={{ borderLeft: `3px solid ${habit.color === 'teal' ? 'var(--color-teal)' : 'var(--color-brand-purple)'}` }}>
                  <span className="text-base">{habit.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{habit.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {habit.color === 'teal' ? 'Exercise' : 'Focus'} habit
                    </p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-teal)' }}>
                    {habit.streak_count}d 🔥
                  </span>
                </div>
              ))}
              {activeHabits.length === 0 && (
                <p className="text-xs text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                  No active habit streaks yet. Complete your habits daily to build streaks!
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Upcoming Deadlines
            </h2>
            <div className="space-y-2">
              {atRiskTasks.map(task => {
                const riskClass = DEADLINE_RISK[task.priority] ?? 'risk-bar-purple';
                return (
                  <div key={task.id} className="card-base flex gap-3">
                    <div className={cn('w-1 rounded-full flex-shrink-0 self-stretch', riskClass)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{task.title}</p>
                      {task.project_tag && (
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{task.project_tag}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[11px] font-medium" style={{ color: task.priority === 'critical' ? 'var(--color-red)' : 'var(--color-amber)' }}>
                        {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'No date'}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {task.completed_pct}% done
                      </p>
                    </div>
                  </div>
                );
              })}
              {atRiskTasks.length === 0 && (
                <p className="text-xs text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                  No critical or high-priority deadlines approaching.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

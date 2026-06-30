'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';
import type { Task, Priority } from '@/types';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

const lanes: { id: Priority; label: string; dotColor: string }[] = [
  { id: 'critical', label: 'Critical Priority', dotColor: 'bg-[var(--color-red)]' },
  { id: 'high', label: 'High Priority', dotColor: 'bg-[#D97706]' },
  { id: 'medium', label: 'Medium Priority', dotColor: 'bg-[var(--color-brand-purple)]' },
  { id: 'low', label: 'Low / Deferred', dotColor: 'bg-[var(--color-gray)]' },
];

export default function TaskRoadmapPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('ai_score', { ascending: false, nullsFirst: false });
        if (data) setTasks(data);
      } catch (err) {
        console.error('Roadmap fetch error:', err);
      }
    })();
  }, []);

  const getTasksInLane = (laneId: Priority) => {
    if (laneId === 'low') {
      return tasks.filter(t => t.priority === 'low' || t.priority === 'deferred' || t.is_deferred);
    }
    return tasks.filter(t => t.priority === laneId && !t.is_deferred);
  };

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Task Roadmap</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/ai-planning" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          AI Walkthrough
        </Link>
        <Link href="/ai-planning/roadmap" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          Task Roadmap
        </Link>
        <Link href="/ai-planning/timeline" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Today&apos;s Timeline
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {lanes.map(lane => {
          const laneTasks = getTasksInLane(lane.id);
          return (
            <div key={lane.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--color-border)' }}>
                <span className={`w-2.5 h-2.5 rounded-full ${lane.dotColor}`} />
                <h2 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {lane.label}
                </h2>
                <span className="text-[10px] ml-auto px-1.5 rounded-full font-medium"
                  style={{ background: 'var(--color-gray-light)', color: 'var(--color-text-secondary)' }}>
                  {laneTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[400px] rounded-lg">
                {laneTasks.length === 0 ? (
                  <div className="text-center py-8 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    No tasks in this lane.
                  </div>
                ) : (
                  laneTasks.map(task => {
                    const isDeferred = task.is_deferred || task.priority === 'deferred';
                    return (
                      <div
                        key={task.id}
                        className={`card-base flex flex-col gap-3 relative overflow-hidden transition-all ${
                          isDeferred ? 'task-deferred' : ''
                        } ${task.status === 'completed' ? 'task-completed' : ''}`}
                      >
                        <div className="space-y-1">
                          <h3 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {task.title}
                          </h3>
                          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                            {task.project_tag ? `#${task.project_tag}` : 'No tag'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px]">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Progress</span>
                            <span style={{ color: 'var(--color-text-primary)' }}>{task.completed_pct ?? 0}%</span>
                          </div>
                          <div className="w-full h-1 bg-[var(--color-gray-light)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[var(--color-brand-purple)]"
                              style={{ width: `${task.completed_pct ?? 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[9px] pt-1.5 border-t"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar size={10} />
                              <span>{format(new Date(task.due_date), 'MMM d')}</span>
                            </div>
                          )}
                          {task.estimated_hours && (
                            <div className="flex items-center gap-1">
                              <Clock size={10} />
                              <span>{task.estimated_hours}h</span>
                            </div>
                          )}
                          {task.ai_score && (
                            <div className="flex items-center gap-1 ml-auto text-[var(--color-brand-purple)] font-medium">
                              <Star size={9} fill="var(--color-brand-purple)" />
                              <span>{task.ai_score}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

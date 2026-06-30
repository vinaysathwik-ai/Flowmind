'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Calendar, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Task } from '@/types';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function DeadlinesPage() {
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
          .neq('status', 'completed')
          .not('due_date', 'is', null)
          .order('due_date', { ascending: true });
        if (data) setTasks(data);
      } catch (err) {
        console.error('Deadlines fetch error:', err);
      }
    })();
  }, []);

  const activeDeadlines = tasks.filter(t => t.due_date && t.status !== 'completed');

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Upcoming Deadlines</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/tasks" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          All Tasks
        </Link>
        <Link href="/tasks/calendar" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Calendar
        </Link>
        <Link href="/tasks/deadlines" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          Upcoming Deadlines
        </Link>
      </div>

      {activeDeadlines.length === 0 ? (
        <div className="card-base text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
          <AlertTriangle size={28} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No upcoming deadlines found.</p>
          <p className="text-xs mt-1">Add tasks with due dates to see them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeDeadlines.map(task => {
            const daysLeft = Math.ceil(
              (new Date(task.due_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            const isOverdue = daysLeft < 0;
            const isCritical = task.priority === 'critical';
            
            let riskLabel = 'Low Risk';
            let riskColor = 'var(--color-teal)';
            let bgClass = 'risk-bar-purple';

            if (isOverdue || isCritical) {
              riskLabel = 'CRITICAL RISK';
              riskColor = 'var(--color-red)';
              bgClass = 'risk-bar-red';
            } else if (daysLeft <= 3) {
              riskLabel = 'MEDIUM RISK';
              riskColor = '#D97706';
              bgClass = 'risk-bar-amber';
            }

            return (
              <div key={task.id} className="card-base relative overflow-hidden flex flex-col gap-4">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${bgClass}`} />

                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pl-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {task.title}
                      </h2>
                      {task.project_tag && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={{ background: 'var(--color-gray-light)', color: 'var(--color-text-muted)' }}>
                          {task.project_tag}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold border"
                    style={{
                      borderColor: `color-mix(in srgb, ${riskColor} 20%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${riskColor} 8%, transparent)`,
                      color: riskColor,
                    }}
                  >
                    <ShieldAlert size={12} />
                    {riskLabel}
                  </div>
                </div>

                <div className="space-y-1.5 pl-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Project Progress</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{task.completed_pct ?? 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-gray-light)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${task.completed_pct ?? 0}%`,
                        backgroundColor: 'var(--color-brand-purple)',
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] pt-1 pl-2 border-t"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <div className="flex items-center gap-1">
                    <Calendar size={13} />
                    <span>Due: {format(new Date(task.due_date!), 'MMM d, yyyy')}</span>
                  </div>
                  {task.estimated_hours && (
                    <div className="flex items-center gap-1">
                      <Clock size={13} />
                      <span>Est. effort: {task.estimated_hours} hours</span>
                    </div>
                  )}
                  <div className="font-semibold text-xs ml-auto" style={{ color: riskColor }}>
                    {isOverdue
                      ? `${Math.abs(daysLeft)} days overdue`
                      : daysLeft === 0
                      ? 'Due today'
                      : `${daysLeft} days remaining`
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

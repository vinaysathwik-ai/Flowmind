'use client';

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Target, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { MOCK_GOALS, MOCK_HABITS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const EVENT_DATES = [new Date(), new Date(Date.now() + 2 * 86400000), new Date(Date.now() + 4 * 86400000)];
const DEADLINE_DATES = [new Date(Date.now() + 2 * 86400000)];

export default function RightPanel() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDow = monthStart.getDay();
  const blanks = Array(startDow).fill(null);

  const activeGoal = MOCK_GOALS[1];
  const topHabits = MOCK_HABITS.slice(0, 3);

  return (
    <aside className="w-[280px] flex-shrink-0 h-screen sticky top-0 overflow-y-auto border-l py-5 px-4 space-y-5"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

      {/* Mini Calendar */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--color-purple-light)] transition-colors"
              aria-label="Previous month">
              <ChevronLeft size={12} style={{ color: 'var(--color-text-muted)' }} />
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--color-purple-light)] transition-colors"
              aria-label="Next month">
              <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-medium py-1"
              style={{ color: 'var(--color-text-muted)' }}>{d}</div>
          ))}
          {blanks.map((_, i) => <div key={`b${i}`} />)}
          {days.map(day => {
            const isEv = EVENT_DATES.some(d => isSameDay(d, day));
            const isDead = DEADLINE_DATES.some(d => isSameDay(d, day));
            const today = isToday(day);
            return (
              <div key={day.toISOString()} className="flex flex-col items-center py-0.5 gap-0.5">
                <span className={cn(
                  'w-6 h-6 flex items-center justify-center text-[11px] rounded-full transition-colors cursor-pointer',
                  today ? 'text-white font-medium' : 'hover:bg-[var(--color-purple-light)]'
                )}
                  style={today ? { background: 'var(--color-brand-purple)' } : { color: 'var(--color-text-primary)' }}>
                  {format(day, 'd')}
                </span>
                {(isEv || isDead) && (
                  <div className={cn('w-1.5 h-1.5 rounded-full', isDead ? 'bg-[var(--color-red)]' : 'bg-[var(--color-brand-purple)]')} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-brand-purple)' }} />
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Event</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-red)' }} />
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Deadline</span>
          </div>
        </div>
      </section>

      <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Goal Progress */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Target size={13} style={{ color: 'var(--color-brand-purple)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Goal Progress</span>
        </div>
        <div className="card-base space-y-2">
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{activeGoal.title}</p>
          <Progress value={activeGoal.progress_pct} className="h-1.5" />
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{activeGoal.progress_pct}% complete</p>
        </div>
      </section>

      <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Habit Streaks */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Active Streaks</span>
        </div>
        <div className="space-y-2">
          {topHabits.map(habit => (
            <div key={habit.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{habit.icon}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>{habit.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {habit.risk_level === 'high' && (
                  <AlertTriangle size={10} style={{ color: 'var(--color-amber)' }} />
                )}
                <span className="text-xs font-medium" style={{ color: 'var(--color-teal)' }}>
                  {habit.streak_count}d
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

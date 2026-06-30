'use client';

import { useState, useEffect } from 'react';
import { MOCK_HABITS, MOCK_TASKS } from '@/lib/mock-data';
import { HabitRow } from '@/components/habits/HabitRow';
import { PriorityBadge } from '@/components/tasks/Badges';
import { Flame, AlertTriangle, Calendar, Award } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Habit, Task } from '@/types';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function StreaksPage() {
  const [habits, setHabits] = useState<Habit[]>(isSupabaseConfigured() ? [] : MOCK_HABITS);
  const [tasks, setTasks] = useState<Task[]>(isSupabaseConfigured() ? [] : MOCK_TASKS);
  const [userId, setUserId] = useState<string>('mock-user-id');

  const fetchHabitsAndTasks = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Fetch habits
      const { data: dbHabits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      // Fetch logs
      const { data: dbLogs } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id);

      const mappedHabits = (dbHabits || []).map(h => ({
        ...h,
        logs: (dbLogs || []).filter(log => log.habit_id === h.id),
      }));
      setHabits(mappedHabits);

      // Fetch tasks
      const { data: dbTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress']);

      if (dbTasks) setTasks(dbTasks);
    } catch (err) {
      console.error('Failed to fetch streaks data:', err);
    }
  };

  useEffect(() => {
    fetchHabitsAndTasks();
  }, []);

  const handleDeleteHabit = async (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('habits').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete habit:', err);
      }
    }
  };

  const handleEditHabit = async (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('habits').update({
          name: updates.name,
          icon: updates.icon,
          color: updates.color,
        }).eq('id', id);
      } catch (err) {
        console.error('Failed to edit habit:', err);
      }
    }
  };

  const handleToggleToday = async (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const existingLog = habit.logs?.find(l => l.logged_date === todayStr);
    const newCompleted = !existingLog?.completed;

    // Optimistically update local state
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const updatedLogs = h.logs ? [...h.logs] : [];
      const logIndex = updatedLogs.findIndex(l => l.logged_date === todayStr);
      if (logIndex >= 0) {
        updatedLogs[logIndex] = { ...updatedLogs[logIndex], completed: newCompleted };
      } else {
        updatedLogs.push({
          id: `log-${Date.now()}`,
          habit_id: id,
          user_id: userId,
          logged_date: todayStr,
          completed: newCompleted,
          created_at: new Date().toISOString(),
        });
      }
      // Simple local streak modifier
      const baseStreak = h.streak_count ?? 0;
      const newStreak = newCompleted ? baseStreak + 1 : Math.max(0, baseStreak - 1);
      return { ...h, logs: updatedLogs, streak_count: newStreak };
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        if (existingLog) {
          await supabase
            .from('habit_logs')
            .update({ completed: newCompleted })
            .eq('id', existingLog.id);
        } else {
          await supabase
            .from('habit_logs')
            .insert({
              habit_id: id,
              user_id: userId,
              logged_date: todayStr,
              completed: newCompleted,
            });
        }
      } catch (err) {
        console.error('Failed to toggle habit:', err);
      }
    }
  };

  // Sort tasks by due date
  const deadlines = [...tasks]
    .filter(t => t.due_date && t.status !== 'completed')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  // Find longest habit streak
  const longestStreakHabit = habits.length > 0
    ? [...habits].sort((a, b) => (b.streak_count ?? 0) - (a.streak_count ?? 0))[0]
    : null;

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Streaks &amp; Deadlines</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/dashboard" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Dashboard
        </Link>
        <Link href="/dashboard/today-plan" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Today's Plan
        </Link>
        <Link href="/dashboard/streaks" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          Streaks &amp; Deadlines
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habits / Streaks section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame size={18} style={{ color: 'var(--color-brand-purple)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Habit Streaks</h2>
          </div>

          <div className="card-base space-y-4">
            {habits.map(habit => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onDelete={handleDeleteHabit}
                onEdit={handleEditHabit}
                onToggleToday={handleToggleToday}
              />
            ))}
            {habits.length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                No habits configured. Create habits under the Routine tab to track them!
              </p>
            )}
          </div>

          {longestStreakHabit && (longestStreakHabit.streak_count ?? 0) > 0 && (
            <div className="card-base flex items-start gap-3 bg-[var(--color-purple-light)]/40 border-[var(--color-border-secondary)]">
              <Award className="mt-0.5 flex-shrink-0" size={16} style={{ color: 'var(--color-brand-purple)' }} />
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>Longest Streak Milestone</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Your &quot;{longestStreakHabit.name}&quot; streak is {longestStreakHabit.streak_count} days. Complete it today to extend your best streak!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Deadlines Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} style={{ color: 'var(--color-red)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Upcoming Deadlines</h2>
          </div>

          <div className="space-y-3">
            {deadlines.map(task => {
              const daysLeft = Math.ceil(
                (new Date(task.due_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              
              // Get risk color config
              const isOverdue = daysLeft < 0;
              const isUrgent = daysLeft >= 0 && daysLeft <= 2;
              const barClass = isOverdue || task.priority === 'critical'
                ? 'risk-bar-red'
                : isUrgent
                ? 'risk-bar-amber'
                : 'risk-bar-purple';

              return (
                <div key={task.id} className="card-base flex gap-4 relative overflow-hidden">
                  {/* Left indicator bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${barClass}`} />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {task.title}
                        </h3>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {task.project_tag ? `#${task.project_tag}` : 'No project tag'}
                        </p>
                      </div>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <div className="flex items-center gap-4 text-[11px] pt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No date'}
                      </span>
                      <span className="font-medium text-xs">
                        {isOverdue 
                          ? `${Math.abs(daysLeft)} days overdue` 
                          : daysLeft === 0 
                          ? 'Due today' 
                          : `${daysLeft} days left`
                        }
                      </span>
                    </div>

                    {/* Completion bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Completion</span>
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{task.completed_pct}%</span>
                      </div>
                      <div className="w-full h-1 bg-[var(--color-gray-light)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${task.completed_pct}%`,
                            backgroundColor: 'var(--color-brand-purple)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {deadlines.length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                No upcoming deadlines. Everything is caught up!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

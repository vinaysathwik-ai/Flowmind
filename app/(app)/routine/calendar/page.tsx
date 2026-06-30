'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckSquare, Award, Check } from 'lucide-react';
import { MOCK_HABITS, MOCK_ROUTINES } from '@/lib/mock-data';
import type { Habit, Routine, ColorCode } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const getDayOfWeekStr = (date: Date): string => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[date.getDay()];
};

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function RoutineCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userId, setUserId] = useState<string>('mock-user-id');

  // Real data state
  const [habits, setHabits] = useState<Habit[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [completedHabitsMap, setCompletedHabitsMap] = useState<Record<string, string[]>>({});
  const [completedRoutinesMap, setCompletedRoutinesMap] = useState<Record<string, string[]>>({});

  // ── Fetch all data and build maps ─────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Use mock data fallback
      setHabits(MOCK_HABITS);
      setRoutines(MOCK_ROUTINES);

      // Populate mock maps
      const initialHabitsMap: Record<string, string[]> = {};
      MOCK_HABITS.forEach(habit => {
        habit.logs?.forEach(log => {
          if (log.completed) {
            if (!initialHabitsMap[log.logged_date]) {
              initialHabitsMap[log.logged_date] = [];
            }
            initialHabitsMap[log.logged_date].push(habit.id);
          }
        });
      });

      // Seed some historical data for mock mode
      const today = new Date();
      for (let i = 1; i <= 45; i++) {
        const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dStr = format(d, 'yyyy-MM-dd');
        if (!initialHabitsMap[dStr]) {
          initialHabitsMap[dStr] = [];
          MOCK_HABITS.forEach(habit => {
            if ((d.getDate() + habit.name.length) % 3 !== 0) {
              initialHabitsMap[dStr].push(habit.id);
            }
          });
        }
      }
      setCompletedHabitsMap(initialHabitsMap);

      const initialRoutinesMap: Record<string, string[]> = {};
      for (let i = 0; i <= 45; i++) {
        const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dStr = format(d, 'yyyy-MM-dd');
        const dayOfWeek = getDayOfWeekStr(d);

        initialRoutinesMap[dStr] = [];
        MOCK_ROUTINES.forEach(routine => {
          if (routine.recurrence.includes(dayOfWeek)) {
            const routineNum = parseInt(routine.id.replace(/\D/g, '') || '0') || 7;
            if ((d.getDate() + routineNum) % 5 !== 0) {
              initialRoutinesMap[dStr].push(routine.id);
            }
          }
        });
      }
      setCompletedRoutinesMap(initialRoutinesMap);
      return;
    }

    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        // Fetch habits and routines
        const { data: dbHabits } = await supabase.from('habits').select('*').eq('user_id', user.id);
        const { data: dbRoutines } = await supabase.from('routines').select('*').eq('user_id', user.id);
        
        if (dbHabits) setHabits(dbHabits);
        if (dbRoutines) setRoutines(dbRoutines);

        // Fetch habit logs
        const { data: dbHabitLogs } = await supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('completed', true);
        const hMap: Record<string, string[]> = {};
        dbHabitLogs?.forEach(log => {
          if (!hMap[log.logged_date]) hMap[log.logged_date] = [];
          hMap[log.logged_date].push(log.habit_id);
        });
        setCompletedHabitsMap(hMap);

        // Routines do not have a dedicated logs table yet in the schema, but we can track completion locally
        // or support it. Let's initialize a local completed map for routines.
        setCompletedRoutinesMap({});
      } catch (err) {
        console.error('Failed to load calendar logs:', err);
      }
    })();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = getDay(monthStart);
  const padCells = Array.from({ length: startDayOfWeek });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Determine active habits and routines for a given day
  const getDayPlan = (day: Date) => {
    const dayOfWeek = getDayOfWeekStr(day);
    const dayStr = format(day, 'yyyy-MM-dd');

    // Habits active on this weekday
    const activeHabits = habits.filter(h => h.target_days.includes(dayOfWeek));
    // Routines active on this weekday
    const activeRoutines = routines.filter(r => r.recurrence.includes(dayOfWeek));

    const completedHabits = completedHabitsMap[dayStr] || [];
    const completedRoutines = completedRoutinesMap[dayStr] || [];

    const totalCount = activeHabits.length + activeRoutines.length;
    const completedCount = 
      activeHabits.filter(h => completedHabits.includes(h.id)).length +
      activeRoutines.filter(r => completedRoutines.includes(r.id)).length;

    return {
      activeHabits,
      activeRoutines,
      completedHabits,
      completedRoutines,
      total: totalCount,
      completed: completedCount,
    };
  };

  // Toggle handlers for the selected day panel
  const toggleHabit = async (habitId: string) => {
    const dayStr = format(selectedDate, 'yyyy-MM-dd');
    const currentList = completedHabitsMap[dayStr] || [];
    const isDone = currentList.includes(habitId);
    const newList = isDone
      ? currentList.filter(id => id !== habitId)
      : [...currentList, habitId];

    setCompletedHabitsMap(prev => ({ ...prev, [dayStr]: newList }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        if (isDone) {
          await supabase
            .from('habit_logs')
            .delete()
            .eq('habit_id', habitId)
            .eq('logged_date', dayStr);
        } else {
          await supabase
            .from('habit_logs')
            .insert({
              habit_id: habitId,
              user_id: userId,
              logged_date: dayStr,
              completed: true,
            });
        }
      } catch (err) {
        console.error('Failed to save habit log toggle:', err);
      }
    }
  };

  const toggleRoutine = (routineId: string) => {
    const dayStr = format(selectedDate, 'yyyy-MM-dd');
    setCompletedRoutinesMap(prev => {
      const currentList = prev[dayStr] || [];
      const newList = currentList.includes(routineId)
        ? currentList.filter(id => id !== routineId)
        : [...currentList, routineId];
      return { ...prev, [dayStr]: newList };
    });
  };

  const selectedDayInfo = useMemo(() => getDayPlan(selectedDate), [selectedDate, habits, routines, completedHabitsMap, completedRoutinesMap]);

  const colorMap: Record<ColorCode, { border: string; bg: string; dot: string }> = {
    purple: { border: 'border-l-2 border-[var(--color-brand-purple)]', bg: 'bg-[var(--color-purple-light)]/20', dot: 'bg-[var(--color-brand-purple)]' },
    green: { border: 'border-l-2 border-[var(--color-teal)]', bg: 'bg-[var(--color-teal-light)]/20', dot: 'bg-[var(--color-teal)]' },
    amber: { border: 'border-l-2 border-[#D97706]', bg: 'bg-[#FAEEDA]/30', dot: 'bg-[#D97706]' },
    gray: { border: 'border-l-2 border-[var(--color-gray)]', bg: 'bg-[var(--color-gray-light)]/20', dot: 'bg-[var(--color-gray)]' },
    red: { border: 'border-l-2 border-[var(--color-red)]', bg: 'bg-[var(--color-red-light)]/20', dot: 'bg-[var(--color-red)]' }
  };

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Global statistics calculation based on past tracked days
  const performanceStats = useMemo(() => {
    let perfectDays = 0;
    let totalTrackedDays = 0;
    let sumCompletionRate = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const info = getDayPlan(d);
      if (info.total > 0) {
        totalTrackedDays++;
        const rate = info.completed / info.total;
        sumCompletionRate += rate;
        if (info.completed === info.total) {
          perfectDays++;
        }
      }
    }

    const averageRate = totalTrackedDays > 0 ? Math.round((sumCompletionRate / totalTrackedDays) * 100) : 0;

    return {
      averageRate,
      trackedDays: totalTrackedDays,
      perfectDays,
    };
  }, [habits, routines, completedHabitsMap, completedRoutinesMap]);

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Routine Calendar</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/routine" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Daily Routine
        </Link>
        <Link href="/routine/habits" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Habit Tracker
        </Link>
        <Link href="/routine/calendar" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          Routine Calendar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-2 card-base space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                Compliance heat map (combined Habits + Daily Routine)
              </p>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border hover:bg-[var(--color-purple-light)]/40 transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border hover:bg-[var(--color-purple-light)]/40 transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-center border-b pb-2 mb-2" style={{ borderColor: 'var(--color-border)' }}>
            {WEEKDAYS.map(day => (
              <span key={day} className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {padCells.map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {daysInMonth.map(day => {
              const { completed, total } = getDayPlan(day);
              const isFuture = day > new Date();
              const today = isToday(day);
              const isSelected = isSameDay(day, selectedDate);
              
              let cellBg = 'transparent';
              let textColor = 'var(--color-text-primary)';

              if (!isFuture && total > 0) {
                const rate = completed / total;
                if (rate >= 0.8) {
                  cellBg = 'bg-[var(--color-teal-light)] text-[var(--color-teal)]';
                } else if (rate >= 0.5) {
                  cellBg = 'bg-[var(--color-purple-light)] text-[var(--color-brand-purple)]';
                } else if (rate > 0) {
                  cellBg = 'bg-[#FAEEDA]/70 text-[#D97706]';
                } else {
                  cellBg = 'bg-red-50 text-[var(--color-red)] dark:bg-[var(--color-red-light)]/10';
                }
              } else if (isFuture) {
                textColor = 'var(--color-text-muted)';
              }

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'aspect-square flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all hover:scale-105',
                    isSelected 
                      ? 'border-[var(--color-brand-purple)] ring-2 ring-[var(--color-brand-purple)]/20' 
                      : 'border-transparent',
                    today && 'ring-1 ring-[var(--color-brand-purple)]'
                  )}
                >
                  <span className="text-[11px] font-semibold" style={{ color: textColor }}>
                    {format(day, 'd')}
                  </span>

                  {!isFuture && total > 0 ? (
                    <span className={cn('text-[9px] px-1.5 py-0.2 rounded font-semibold w-full text-center truncate', cellBg)}>
                      {completed}/{total}
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Day Details Panel */}
        <div className="card-raised space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <CalendarIcon size={14} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <h2 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
              </h2>
            </div>
          </div>

          {/* Daily Routine Blocks section */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
              <CheckSquare size={11} />
              Daily Routine Blocks
            </h3>
            {selectedDayInfo.activeRoutines.length === 0 ? (
              <p className="text-[11px] italic py-2" style={{ color: 'var(--color-text-muted)' }}>
                No routine blocks scheduled.
              </p>
            ) : (
              <div className="space-y-1.5">
                {selectedDayInfo.activeRoutines.map(routine => {
                  const isDone = selectedDayInfo.completedRoutines.includes(routine.id);
                  return (
                    <div
                      key={routine.id}
                      onClick={() => toggleRoutine(routine.id)}
                      className={cn(
                        'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent hover:border-var(--color-border)',
                        isDone ? 'bg-gray-50/50 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-900/10'
                      )}
                      style={{ borderLeft: `3px solid ${routine.color === 'purple' ? 'var(--color-brand-purple)' : routine.color === 'green' ? 'var(--color-teal)' : '#D97706'}` }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                          isDone ? 'bg-[var(--color-brand-purple)] border-[var(--color-brand-purple)]' : 'border-gray-300'
                        )}>
                          {isDone && <Check size={8} color="white" strokeWidth={3} />}
                        </div>
                        <div className="min-w-0">
                          <p className={cn('text-xs font-medium truncate', isDone && 'line-through opacity-60')} style={{ color: 'var(--color-text-primary)' }}>
                            {routine.title}
                          </p>
                          <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
                            {routine.start_time} - {routine.end_time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Habits section */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Award size={11} />
              Habits Tracker
            </h3>
            {selectedDayInfo.activeHabits.length === 0 ? (
              <p className="text-[11px] italic py-2" style={{ color: 'var(--color-text-muted)' }}>
                No habits targeted for today.
              </p>
            ) : (
              <div className="space-y-1.5">
                {selectedDayInfo.activeHabits.map(habit => {
                  const isDone = selectedDayInfo.completedHabits.includes(habit.id);
                  const bgColor = habit.color === 'teal' 
                    ? 'var(--color-teal-light)' 
                    : habit.color === 'amber' 
                    ? 'var(--color-amber-light)' 
                    : 'var(--color-purple-light)';
                  return (
                    <div
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      className={cn(
                        'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent hover:border-var(--color-border)',
                        isDone ? 'bg-gray-50/50 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-900/10'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                          isDone ? 'bg-[var(--color-brand-purple)] border-[var(--color-brand-purple)]' : 'border-gray-300'
                        )}>
                          {isDone && <Check size={8} color="white" strokeWidth={3} />}
                        </div>
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs" style={{ background: bgColor }}>
                          {habit.icon}
                        </div>
                        <p className={cn('text-xs font-medium truncate', isDone && 'line-through opacity-60')} style={{ color: 'var(--color-text-primary)' }}>
                          {habit.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend and stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-base space-y-2">
          <h3 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>Calendar Legend</h3>
          <div className="grid grid-cols-2 gap-2 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[var(--color-teal-light)] block" />
              <span>High compliance (80%+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[var(--color-purple-light)] block" />
              <span>Medium compliance (50%+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#FAEEDA]/70 block" />
              <span>Low compliance (1-49%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-50 dark:bg-[var(--color-red-light)]/10 block" />
              <span>No items completed</span>
            </div>
          </div>
        </div>

        <div className="card-base flex flex-col justify-between">
          <h3 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>Performance Summary</h3>
          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Average completion</p>
              <p className="text-base font-bold text-[var(--color-teal)]">{performanceStats.averageRate}%</p>
            </div>
            <div>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Days tracked</p>
              <p className="text-base font-bold text-[var(--color-brand-purple)]">{performanceStats.trackedDays} days</p>
            </div>
            <div>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Perfect days</p>
              <p className="text-base font-bold text-[#D97706]">{performanceStats.perfectDays} days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Task, CalendarEvent } from '@/types';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function TasksCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: dbTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .neq('status', 'completed');
        if (dbTasks) setTasks(dbTasks);
        const { data: dbEvents } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id);
        if (dbEvents) setEvents(dbEvents);
      } catch (err) {
        console.error('Calendar fetch error:', err);
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

  const getDeadlinesForDay = (day: Date) =>
    tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), day) && t.status !== 'completed');
  const getEventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.start_time), day));

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedDeadlines = getDeadlinesForDay(selectedDay);
  const selectedEvents = getEventsForDay(selectedDay);

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Calendar View</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/tasks" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          All Tasks
        </Link>
        <Link href="/tasks/calendar" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          Calendar
        </Link>
        <Link href="/tasks/deadlines" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Upcoming Deadlines
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Grid */}
        <div className="md:col-span-2 space-y-4">
          <div className="card-base">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {format(currentDate, 'MMMM yyyy')}
              </h2>
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
            <div className="grid grid-cols-7 gap-y-3">
              {/* Empty padding cells */}
              {padCells.map((_, i) => (
                <div key={`pad-${i}`} className="h-10" />
              ))}

              {/* Day cells */}
              {daysInMonth.map(day => {
                const dayDeadlines = getDeadlinesForDay(day);
                const dayEvents = getEventsForDay(day);
                const selected = isSameDay(day, selectedDay);
                const today = isToday(day);

                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDay(day)}
                    className="h-10 flex flex-col items-center justify-between py-1.5 rounded-lg transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-purple)]"
                    style={{
                      backgroundColor: selected
                        ? 'var(--color-brand-purple)'
                        : today
                        ? 'var(--color-purple-light)'
                        : 'transparent',
                    }}
                  >
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: selected
                          ? 'white'
                          : today
                          ? 'var(--color-brand-purple)'
                          : 'var(--color-text-primary)',
                      }}
                    >
                      {format(day, 'd')}
                    </span>

                    {/* Dots indicators */}
                    <div className="flex gap-0.5 justify-center mt-1">
                      {dayDeadlines.length > 0 && (
                        <span className="w-1 h-1 rounded-full bg-[var(--color-red)]" />
                      )}
                      {dayEvents.length > 0 && (
                        <span className="w-1 h-1 rounded-full bg-[var(--color-brand-purple)]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="card-base flex gap-6 justify-center text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-red)]" />
              <span>Critical Deadline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-brand-purple)]" />
              <span>Focus Block / Event</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-purple-light)] border border-[var(--color-brand-purple)]" />
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} style={{ color: 'var(--color-brand-purple)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Agenda · {format(selectedDay, 'MMM d')}
            </h2>
          </div>

          <div className="space-y-3">
            {selectedDeadlines.length === 0 && selectedEvents.length === 0 ? (
              <div className="card-base py-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                No deadlines or focus blocks scheduled.
              </div>
            ) : (
              <>
                {/* Deadlines */}
                {selectedDeadlines.map(task => (
                  <div key={task.id} className="card-base relative overflow-hidden flex flex-col gap-1.5 border-l-2 border-[var(--color-red)]">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-red)]">
                      Deadline
                    </span>
                    <h3 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {task.title}
                    </h3>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                      Est. effort: {task.estimated_hours}h
                    </p>
                  </div>
                ))}

                {/* Scheduled Events */}
                {selectedEvents.map(event => (
                  <div key={event.id} className="card-base relative overflow-hidden flex flex-col gap-1.5 border-l-2 border-[var(--color-brand-purple)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-brand-purple)]">
                        Event
                      </span>
                      {event.is_ai_scheduled && (
                        <span className="flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded font-medium"
                          style={{ background: 'var(--color-purple-light)', color: 'var(--color-brand-purple)' }}>
                          <Sparkles size={8} />
                          AI
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {event.title}
                    </h3>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                      {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

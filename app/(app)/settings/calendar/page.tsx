'use client';

import { Calendar, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';

const tabClass = (active: boolean) =>
  `px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all ${
    active
      ? 'border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold'
      : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
  }`;

const features = [
  { icon: '📅', label: 'Routine Calendar', desc: 'Visual heatmap of your daily routine compliance.', href: '/routine/calendar' },
  { icon: '✅', label: 'Habit Tracker', desc: 'Streak calendar for all your habits.', href: '/routine/habits' },
  { icon: '🧠', label: 'AI Daily Brief', desc: 'AI-scheduled focus blocks on your dashboard.', href: '/dashboard' },
  { icon: '🗂️', label: 'Task Deadlines', desc: 'Deadline view sorted by AI priority score.', href: '/tasks' },
];

export default function CalendarSettingsPage() {
  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Calendar</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/settings" className={tabClass(false)}>Profile</Link>
        <Link href="/settings/calendar" className={tabClass(true)}>Calendar</Link>
        <Link href="/settings/notifications" className={tabClass(false)}>Notifications</Link>
        <Link href="/settings/ai-preferences" className={tabClass(false)}>AI Preferences</Link>
      </div>

      {/* Built-in calendar info */}
      <div className="card-raised space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-purple-light)' }}>
            <Calendar size={20} style={{ color: 'var(--color-brand-purple)' }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Built-in FlowMind Calendar
            </h2>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              All scheduling is handled natively — no external calendar app required.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map(f => (
            <Link href={f.href} key={f.label}
              className="card-base flex items-start gap-3 hover:border-[var(--color-brand-purple)] transition-colors">
              <span className="text-xl">{f.icon}</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{f.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="card-base flex items-start gap-3"
        style={{ background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.2)' }}>
        <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-400" />
        <div>
          <p className="text-xs font-semibold text-emerald-400">All calendar features are active</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            FlowMind&apos;s built-in scheduling system works entirely within the app — no Google Calendar, iCloud, or Outlook integration needed. Your routine, habits, and task deadlines are all managed through FlowMind directly.
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="card-base flex items-start gap-3">
        <Info size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-brand-purple)' }} />
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>Why no external calendar sync?</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Google Calendar API requires a billing account. To keep FlowMind 100% free, we built a powerful native calendar system instead — with heatmaps, habit streaks, compliance tracking, and AI-scheduled focus blocks, all without any external billing.
          </p>
        </div>
      </div>
    </div>
  );
}

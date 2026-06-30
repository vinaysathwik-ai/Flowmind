'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, ShieldAlert, Sparkles, Flame, Moon, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  getPushStatus,
} from '@/lib/push-notifications';

export default function NotificationsSettingsPage() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushStatus, setPushStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported' | 'loading'>('loading');
  const [pushLoading, setPushLoading] = useState(false);

  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [proactiveNudges, setProactiveNudges] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(false);
  const [dailySummary, setDailySummary] = useState(true);
  const [focusSilence, setFocusSilence] = useState(false);

  // Check current push status on mount
  useEffect(() => {
    if (!isPushSupported()) {
      setPushStatus('unsupported');
      return;
    }
    getPushStatus().then(status => {
      setPushStatus(status);
      setPushEnabled(status === 'granted');
    });
  }, []);

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        const ok = await unsubscribeFromPush();
        if (ok) { setPushEnabled(false); setPushStatus('default'); }
      } else {
        const ok = await subscribeToPush();
        if (ok) { setPushEnabled(true); setPushStatus('granted'); }
        else if (Notification.permission === 'denied') {
          setPushStatus('denied');
        }
      }
    } finally {
      setPushLoading(false);
    }
  };

  const statusBadge = () => {
    if (pushStatus === 'loading') return null;
    if (pushStatus === 'unsupported') return (
      <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
        <XCircle size={11} /> Not supported in this browser
      </span>
    );
    if (pushStatus === 'denied') return (
      <span className="flex items-center gap-1 text-[10px] text-orange-400">
        <XCircle size={11} /> Blocked — enable in browser settings
      </span>
    );
    if (pushStatus === 'granted') return (
      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
        <CheckCircle2 size={11} /> Notifications active
      </span>
    );
    return (
      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Click to enable</span>
    );
  };

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all ${
      active
        ? 'border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold'
        : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
    }`;

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Notifications Settings</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/settings" className={tabClass(false)}>Profile</Link>
        <Link href="/settings/calendar" className={tabClass(false)}>Calendar</Link>
        <Link href="/settings/notifications" className={tabClass(true)}>Notifications</Link>
        <Link href="/settings/ai-preferences" className={tabClass(false)}>AI Preferences</Link>
      </div>

      {/* Push Notifications Master Switch */}
      <div className="card-raised space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
              style={{ background: pushEnabled ? 'rgba(16,185,129,0.15)' : 'var(--color-purple-light)' }}>
              {pushEnabled
                ? <Bell size={16} className="text-emerald-400" />
                : <BellOff size={16} style={{ color: 'var(--color-brand-purple)' }} />
              }
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Browser Push Notifications
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Receive deadline alerts and reminders directly in your browser — even when the app is closed.
              </p>
              <div className="mt-1">{statusBadge()}</div>
            </div>
          </div>
          <button
            onClick={handleTogglePush}
            disabled={pushLoading || pushStatus === 'unsupported' || pushStatus === 'denied'}
            className="ml-4 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
            style={{
              background: pushEnabled ? 'rgba(239,68,68,0.12)' : 'var(--color-brand-purple)',
              color: pushEnabled ? 'var(--color-red)' : 'white',
              border: pushEnabled ? '1px solid rgba(239,68,68,0.3)' : 'none',
            }}
          >
            {pushLoading
              ? 'Loading...'
              : pushEnabled ? 'Disable' : 'Enable Push'}
          </button>
        </div>

        {/* Info notice */}
        {pushStatus === 'denied' && (
          <div className="rounded-xl px-4 py-3 text-xs border" style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)', color: 'var(--color-text-secondary)' }}>
            🔒 <strong>Notifications are blocked.</strong> To enable them, click the 🔒 or 🔔 icon in your browser&apos;s address bar and allow notifications for this site, then reload the page.
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="card-base space-y-5">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Notification Preferences
        </p>

        {/* Focus Mode Silence */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-start gap-3">
            <Moon className="mt-0.5" size={16} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <Label htmlFor="focusSilence" className="text-xs font-semibold block cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                Focus Mode Silence-All
              </Label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Temporarily disable all notifications during scheduled deep focus blocks.
              </span>
            </div>
          </div>
          <Switch id="focusSilence" checked={focusSilence} onCheckedChange={setFocusSilence} />
        </div>

        {/* Deadline Reminders */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5" size={16} style={{ color: 'var(--color-red)' }} />
            <div>
              <Label htmlFor="deadlineReminders" className="text-xs font-semibold block cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                Deadline Reminders
              </Label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Get push alerts 24 h and 1 h before a task deadline.
              </span>
            </div>
          </div>
          <Switch id="deadlineReminders" checked={deadlineReminders && !focusSilence}
            onCheckedChange={setDeadlineReminders} disabled={focusSilence} />
        </div>

        {/* AI Proactive Nudges */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5" size={16} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <Label htmlFor="proactiveNudges" className="text-xs font-semibold block cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                AI Proactive Nudges
              </Label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Context-aware micro-nudges to start scheduled tasks or habits.
              </span>
            </div>
          </div>
          <Switch id="proactiveNudges" checked={proactiveNudges && !focusSilence}
            onCheckedChange={setProactiveNudges} disabled={focusSilence} />
        </div>

        {/* Streak Alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Flame className="mt-0.5" size={16} style={{ color: 'var(--color-teal)' }} />
            <div>
              <Label htmlFor="streakAlerts" className="text-xs font-semibold block cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                Streak Alerts
              </Label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Daily reminders to complete habits before your streak resets at midnight.
              </span>
            </div>
          </div>
          <Switch id="streakAlerts" checked={streakAlerts && !focusSilence}
            onCheckedChange={setStreakAlerts} disabled={focusSilence} />
        </div>

        {/* Daily Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5" size={16} style={{ color: 'var(--color-gray)' }} />
            <div>
              <Label htmlFor="dailySummary" className="text-xs font-semibold block cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                Daily Plan Summary
              </Label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Receive a morning push notification with your AI-optimised daily plan.
              </span>
            </div>
          </div>
          <Switch id="dailySummary" checked={dailySummary && !focusSilence}
            onCheckedChange={setDailySummary} disabled={focusSilence} />
        </div>
      </div>

      {/* How it works info box */}
      <div className="card-base" style={{ background: 'var(--color-purple-light)', borderColor: 'transparent' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          🔔 How push notifications work
        </p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          FlowMind uses the browser&apos;s built-in Web Push API — no Firebase or third-party services required.
          Notifications are sent from our server directly to your browser, even when FlowMind is closed.
          Your subscription is securely stored in our database and only used to send you relevant alerts.
        </p>
      </div>
    </div>
  );
}

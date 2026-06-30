'use client';

import { useState, useEffect } from 'react';
import { Clock, Globe, Languages, Shield, Edit2, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function ProfileSettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [focusStart, setFocusStart] = useState('09:00');
  const [focusEnd, setFocusEnd] = useState('12:00');

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        setEmail(user.email ?? '');
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profile) {
          setFullName(profile.full_name ?? '');
          setTimezone(profile.timezone ?? 'Asia/Kolkata');
          setWorkStart(profile.work_hours_start ?? '09:00');
          setWorkEnd(profile.work_hours_end ?? '18:00');
          setFocusStart(profile.peak_focus_start ?? '09:00');
          setFocusEnd(profile.peak_focus_end ?? '12:00');
        }
      } catch (err) {
        console.error('Settings fetch error:', err);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isSupabaseConfigured() && userId) {
        const supabase = createClient();
        await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            timezone,
            work_hours_start: workStart,
            work_hours_end: workEnd,
            peak_focus_start: focusStart,
            peak_focus_end: focusEnd,
          })
          .eq('id', userId);
      }
    } catch (err) {
      console.error('Settings save error:', err);
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  const themes = [
    {
      id: 'light' as const,
      label: 'Light',
      description: 'Clean & bright workspace',
      icon: Sun,
      preview: {
        bg: '#F8F7FF',
        surface: '#FFFFFF',
        accent: '#534AB7',
        text: '#1A1830',
        sub: '#888780',
        border: 'rgba(83,74,183,0.15)',
      },
    },
    {
      id: 'dark' as const,
      label: 'Dark',
      description: 'Easy on the eyes',
      icon: Moon,
      preview: {
        bg: '#1E1C32',
        surface: '#100F1C',
        accent: '#8B84E0',
        text: '#EEEDF8',
        sub: '#6E6C92',
        border: 'rgba(160,150,240,0.18)',
      },
    },
  ];

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Profile Settings</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/settings" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          Profile
        </Link>
        <Link href="/settings/calendar" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Calendar Integration
        </Link>
        <Link href="/settings/notifications" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Notifications
        </Link>
        <Link href="/settings/ai-preferences" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          AI Preferences
        </Link>
      </div>

      {/* Profile card */}
      <div className="card-base flex flex-col sm:flex-row gap-6 items-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white shadow-sm"
          style={{ background: 'var(--color-brand-purple)' }}>
          {fullName ? fullName.charAt(0) : 'U'}
        </div>

        <div className="flex-1 space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {fullName || 'User'}
            </h2>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
              style={{ background: 'var(--color-purple-light)', color: 'var(--color-brand-purple)' }}>
              Free Account
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{email}</p>
          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Member since June 2026</p>
        </div>

        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-1.5 text-xs h-9 rounded-lg">
            <Edit2 size={13} />
            Edit Profile
          </Button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="card-raised space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">Full Name</Label>
              <Input id="name" value={fullName ?? ''} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="text-xs font-medium">Timezone</Label>
              <Input id="timezone" value={timezone} onChange={e => setTimezone(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workStart" className="text-xs font-medium">Work Hours Start</Label>
              <Input id="workStart" type="time" value={workStart} onChange={e => setWorkStart(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workEnd" className="text-xs font-medium">Work Hours End</Label>
              <Input id="workEnd" type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="focusStart" className="text-xs font-medium">Peak Focus Start</Label>
              <Input id="focusStart" type="time" value={focusStart} onChange={e => setFocusStart(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="focusEnd" className="text-xs font-medium">Peak Focus End</Label>
              <Input id="focusEnd" type="time" value={focusEnd} onChange={e => setFocusEnd(e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="text-xs h-9">Cancel</Button>
            <Button type="submit" disabled={saving} className="text-xs h-9 bg-[var(--color-brand-purple)] hover:bg-[var(--color-purple-dark)] text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-base flex items-start gap-3">
            <Globe className="mt-0.5" size={16} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Location & Timezone</p>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{timezone}</p>
            </div>
          </div>
          <div className="card-base flex items-start gap-3">
            <Clock className="mt-0.5" size={16} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Work Day Duration</p>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{workStart} to {workEnd}</p>
            </div>
          </div>
          <div className="card-base flex items-start gap-3">
            <Shield className="mt-0.5" size={16} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Peak Cognitive Window</p>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{focusStart} to {focusEnd}</p>
            </div>
          </div>
          <div className="card-base flex items-start gap-3">
            <Languages className="mt-0.5" size={16} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Interface Language</p>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>English (EN)</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Appearance ── */}
      <div className="card-raised space-y-4">
        <div className="flex items-center gap-2">
          <Monitor size={15} style={{ color: 'var(--color-brand-purple)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Appearance</h2>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Choose how FlowMind looks. Your preference is saved automatically.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {themes.map(t => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <motion.button
                key={t.id}
                id={`theme-option-${t.id}`}
                onClick={() => setTheme(t.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="relative rounded-xl p-4 text-left transition-all focus-visible:outline-none"
                style={{
                  border: isActive
                    ? '2px solid var(--color-brand-purple)'
                    : '1.5px solid var(--color-border-secondary)',
                  background: isActive ? 'var(--color-purple-light)' : 'var(--color-surface)',
                  boxShadow: isActive ? '0 0 0 3px rgba(83,74,183,0.10)' : 'none',
                }}
              >
                {/* Active dot */}
                {isActive && (
                  <span
                    className="absolute top-3 right-3 w-2 h-2 rounded-full"
                    style={{ background: 'var(--color-brand-purple)' }}
                  />
                )}

                {/* Mini UI preview */}
                <div
                  className="w-full h-20 rounded-lg mb-3 overflow-hidden relative"
                  style={{ background: t.preview.bg, border: `1px solid ${t.preview.border}` }}
                >
                  {/* Sidebar strip */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-6"
                    style={{ background: t.preview.surface, borderRight: `1px solid ${t.preview.border}` }}
                  >
                    {[10, 22, 34].map(top => (
                      <div
                        key={top}
                        className="absolute left-1 right-1 h-1 rounded-full"
                        style={{ top, background: t.preview.accent, opacity: top === 10 ? 0.9 : 0.2 }}
                      />
                    ))}
                  </div>
                  {/* Content */}
                  <div className="absolute left-8 top-3 right-3 space-y-1.5">
                    <div className="h-2 rounded-full w-3/4" style={{ background: t.preview.text, opacity: 0.7 }} />
                    <div className="h-1.5 rounded-full w-1/2" style={{ background: t.preview.sub, opacity: 0.5 }} />
                    <div className="rounded-md p-1.5 mt-1" style={{ background: t.preview.surface, border: `1px solid ${t.preview.border}` }}>
                      <div className="h-1 rounded-full w-2/3 mb-1" style={{ background: t.preview.text, opacity: 0.55 }} />
                      <div className="h-1 rounded-full w-1/3" style={{ background: t.preview.accent, opacity: 0.5 }} />
                    </div>
                  </div>
                </div>

                {/* Label row */}
                <div className="flex items-center gap-2">
                  <Icon
                    size={13}
                    style={{ color: isActive ? 'var(--color-brand-purple)' : 'var(--color-text-muted)' }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isActive ? 'var(--color-brand-purple)' : 'var(--color-text-primary)' }}
                  >
                    {t.label}
                  </span>
                </div>
                <p className="text-[10px] mt-0.5 ml-5" style={{ color: 'var(--color-text-muted)' }}>
                  {t.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

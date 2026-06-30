'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Clock } from 'lucide-react';
import type { ColorCode, Routine } from '@/types';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

const colorMap: Record<ColorCode, { bg: string; text: string; dot: string }> = {
  purple: { bg: 'bg-[var(--color-purple-light)]/40', text: 'text-[var(--color-brand-purple)]', dot: 'bg-[var(--color-brand-purple)]' },
  green:  { bg: 'bg-[var(--color-teal-light)]/40', text: 'text-[var(--color-teal)]', dot: 'bg-[var(--color-teal)]' },
  amber:  { bg: 'bg-[#FAEEDA]/30', text: 'text-[#D97706]', dot: 'bg-[#D97706]' },
  gray:   { bg: 'bg-[var(--color-gray-light)]/40', text: 'text-[var(--color-gray)]', dot: 'bg-[var(--color-gray)]' },
  red:    { bg: 'bg-[var(--color-red-light)]/40', text: 'text-[var(--color-red)]', dot: 'bg-[var(--color-red)]' },
};

export default function TodayTimelinePage() {
  const [timelineItems, setTimelineItems] = useState<Routine[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Today's day of week (mon, tue, etc.)
        const days = ['sun','mon','tue','wed','thu','fri','sat'];
        const todayDay = days[new Date().getDay()];

        const { data } = await supabase
          .from('routines')
          .select('*')
          .eq('user_id', user.id)
          .contains('recurrence', [todayDay])
          .order('start_time', { ascending: true });

        if (data) setTimelineItems(data);
      } catch (err) {
        console.error('Timeline fetch error:', err);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Today&apos;s Timeline</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/ai-planning" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          AI Walkthrough
        </Link>
        <Link href="/ai-planning/roadmap" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Task Roadmap
        </Link>
        <Link href="/ai-planning/timeline" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          Today&apos;s Timeline
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Timeline Overview</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            The chronological flow of your routines scheduled for today.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'var(--color-purple-light)', color: 'var(--color-brand-purple)' }}>
          <Sparkles size={13} />
          <span>AI-Built Schedule</span>
        </div>
      </div>

      {/* Timeline flow */}
      <div className="space-y-6 relative pl-6">
        <div className="absolute left-2.5 top-2.5 bottom-2.5 w-[1px] bg-[var(--color-border)]" />

        {timelineItems.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-sm font-medium">No routines scheduled for today.</p>
            <p className="text-xs mt-1">Add routines under the Routine tab to see them here.</p>
          </div>
        ) : (
          timelineItems.map((item) => {
            const styleConfig = colorMap[item.color as ColorCode] || colorMap.gray;
            const [startH, startM] = item.start_time.split(':').map(Number);
            const [endH, endM] = item.end_time.split(':').map(Number);
            const diffMin = (endH * 60 + endM) - (startH * 60 + startM);
            const hours = Math.floor(diffMin / 60);
            const mins = diffMin % 60;
            const durationStr = hours > 0
              ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
              : `${mins}m`;

            return (
              <div key={item.id} className="relative flex flex-col sm:flex-row gap-4 sm:items-start group">
                <div className={`absolute left-[-20px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${styleConfig.dot} shadow-sm z-10`} />

                <div className="flex flex-col sm:w-[90px] flex-shrink-0 text-left pt-0.5">
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    {item.start_time}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-0.5">
                    <Clock size={10} />
                    {durationStr}
                  </span>
                </div>

                <div className={`flex-1 card-base p-4 rounded-xl flex flex-col gap-1.5 transition-all hover:translate-x-0.5 ${
                  item.is_ai_inserted ? 'border-[var(--color-brand-purple)]/40 shadow-sm' : ''
                }`} style={{ background: 'var(--color-surface)' }}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
                      {item.title}
                    </h3>
                    {item.is_ai_inserted && (
                      <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: 'var(--color-purple-light)', color: 'var(--color-brand-purple)' }}>
                        <Sparkles size={8} />
                        AI Block
                      </span>
                    )}
                  </div>

                  {item.note && (
                    <p className="text-[11px] text-[var(--color-text-secondary)]">{item.note}</p>
                  )}

                  <div className="flex items-center gap-2 text-[9px] text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)]/50 mt-1">
                    <span>Recurrence: {item.recurrence.join(', ').toUpperCase()}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

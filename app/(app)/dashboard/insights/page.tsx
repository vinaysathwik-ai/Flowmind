'use client';

import { useState, useEffect } from 'react';
import WalkthroughCard from '@/components/ai/WalkthroughCard';
import { BrainCircuit } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AIAction } from '@/types';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function AIInsightsPage() {
  const [actions, setActions] = useState<AIAction[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
          .from('ai_actions')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .order('created_at', { ascending: true });
        if (data) setActions(data);
      } catch (err) {
        console.error('AI actions fetch error:', err);
      }
    })();
  }, []);

  return (
    <div className="max-w-2xl space-y-6 fade-in">
      <div>
        <h1 className="text-xl font-medium" style={{ color: 'var(--color-text-primary)' }}>AI Insights</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          A detailed view of every autonomous decision the AI made today, with full reasoning and override options.
        </p>
      </div>

      {/* Header stat */}
      <div className="card-base flex items-center gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-purple-light)' }}>
          <BrainCircuit size={20} style={{ color: 'var(--color-brand-purple)' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {actions.length} AI actions taken today
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Autonomous mode: Balanced
          </p>
        </div>
      </div>

      {/* Walkthrough cards */}
      <div className="space-y-4">
        {actions.length === 0 ? (
          <div className="card-base text-center py-10" style={{ color: 'var(--color-text-muted)' }}>
            <BrainCircuit size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No AI actions yet today.</p>
            <p className="text-xs mt-1">Run the AI planning agent from your dashboard to see actions here.</p>
          </div>
        ) : (
          actions.map((action, i) => (
            <WalkthroughCard key={action.id} action={action} index={i} />
          ))
        )}
      </div>
    </div>
  );
}

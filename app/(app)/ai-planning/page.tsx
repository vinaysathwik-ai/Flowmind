'use client';

import { useState, useEffect } from 'react';
import WalkthroughCard from '@/components/ai/WalkthroughCard';
import { BrainCircuit, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { AIAction } from '@/types';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function AIWalkthroughPage() {
  const [actions, setActions] = useState<AIAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchActions = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
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
      console.error('Error fetching AI actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleReRun = async () => {
    setRunning(true);
    try {
      // Call the AI planning agent endpoint
      await fetch('/api/agents/prioritize', { method: 'POST' });
      await fetchActions();
    } catch (err) {
      console.error('Error running AI agent:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">AI Planning</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/ai-planning" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          AI Walkthrough
        </Link>
        <Link href="/ai-planning/roadmap" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Task Roadmap
        </Link>
        <Link href="/ai-planning/timeline" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Today&apos;s Timeline
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>AI Walkthrough</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Follow the chronological breakdown of how the planning agent optimized today&apos;s agenda.
          </p>
        </div>

        <Button 
          onClick={handleReRun}
          disabled={running}
          className="flex items-center gap-1.5 text-xs bg-[var(--color-brand-purple)] hover:bg-[var(--color-purple-dark)] text-white h-9 px-4 rounded-lg"
        >
          <Play size={14} fill="white" />
          {running ? 'Running Agent...' : 'Re-Run Agent'}
        </Button>
      </div>

      {/* Main flow summary */}
      <div className="card-base flex items-center gap-4 bg-[var(--color-purple-light)]/40 border-[var(--color-border-secondary)]">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm">
          <BrainCircuit size={20} style={{ color: 'var(--color-brand-purple)' }} />
        </div>
        <div>
          <h2 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {actions.length > 0 ? 'Autonomous Planning Complete' : 'Planning Agent Ready'}
          </h2>
          <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
            {actions.length > 0 
              ? `The agent executed ${actions.length} sequential steps to resolve deadline risks and optimize focus availability today.`
              : 'Click "Re-Run Agent" to run the autonomous planning agent on your current tasks.'}
          </p>
        </div>
      </div>

      {/* Steps checklist/timeline */}
      <div className="space-y-4 relative">
        {actions.length > 0 && (
          <div className="absolute left-4 top-4 bottom-4 w-[1px] bg-[var(--color-border)] z-0" />
        )}
        
        {loading ? (
          <p className="text-xs text-center py-6" style={{ color: 'var(--color-text-muted)' }}>Loading AI actions...</p>
        ) : actions.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-sm font-medium">No actions taken today.</p>
            <p className="text-xs mt-1">Run the agent to optimize your tasks.</p>
          </div>
        ) : (
          actions.map((action, idx) => (
            <div key={action.id} className="relative z-10">
              <WalkthroughCard action={action} index={idx} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

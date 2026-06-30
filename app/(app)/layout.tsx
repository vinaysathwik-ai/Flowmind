'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import RightPanel from '@/components/layout/RightPanel';
import { TooltipProvider } from '@/components/ui/tooltip';
import { createClient } from '@/lib/supabase/client';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [atRiskCount, setAtRiskCount] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || url.includes('your_supabase')) return;

    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        setUserName(profile?.full_name ?? user.email?.split('@')[0] ?? 'User');
        setAvatarUrl(profile?.avatar_url ?? undefined);

        // Task metrics
        const { data: tasks } = await supabase
          .from('tasks')
          .select('priority, due_date, status')
          .eq('user_id', user.id);

        if (tasks) {
          setTasksTotal(tasks.length);
          const now = new Date();
          const atRisk = tasks.filter(t => {
            if (!t.due_date || t.status === 'completed') return false;
            const days = (new Date(t.due_date).getTime() - now.getTime()) / 86400000;
            return (t.priority === 'critical' || t.priority === 'high') && days <= 3;
          }).length;
          setAtRiskCount(atRisk);
        }
      } catch (err) {
        console.error('Layout fetch error:', err);
      }
    })();
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-surface-tertiary)' }}>
        {/* Left Sidebar */}
        <Sidebar
          tasksTotal={tasksTotal}
          atRiskCount={atRiskCount}
        />

        {/* Main content column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar
            userName={userName}
            avatarUrl={avatarUrl}
            atRiskCount={atRiskCount}
            notificationCount={atRiskCount}
          />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>

        {/* Right Panel */}
        <RightPanel />
      </div>
    </TooltipProvider>
  );
}

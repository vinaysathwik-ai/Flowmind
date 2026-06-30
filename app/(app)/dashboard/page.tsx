'use client';

import { useState, useEffect } from 'react';
import { Zap, CheckSquare, AlertTriangle, Flame, Plus, RefreshCw } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import AIInsightBanner from '@/components/dashboard/AIInsightBanner';
import TaskRow from '@/components/tasks/TaskRow';
import { MOCK_METRICS, MOCK_TASKS, MOCK_AI_INSIGHT, MOCK_SUBTASKS, MOCK_DAILY_BRIEF } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Task, AIInsight } from '@/types';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function DashboardPage() {
  // ── State ─────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>(
    MOCK_TASKS.map(t => ({ ...t, subtasks: MOCK_SUBTASKS.filter(s => s.task_id === t.id) }))
  );
  const [insight, setInsight] = useState<AIInsight>(MOCK_AI_INSIGHT);
  const [greeting, setGreeting] = useState(MOCK_DAILY_BRIEF.greeting);
  const [recommendation, setRecommendation] = useState(MOCK_DAILY_BRIEF.recommendation);
  const [focusScore, setFocusScore] = useState(MOCK_METRICS.focus_score);
  const [atRiskCount, setAtRiskCount] = useState(MOCK_METRICS.tasks_at_risk);
  const [streakDays, setStreakDays] = useState(MOCK_METRICS.streak_days);
  const [briefLoading, setBriefLoading] = useState(false);

  // ── Fetch live data on mount ──────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    
    // Set custom placeholder states for live mode while fetching
    setGreeting('Welcome back 👋');
    setRecommendation('Computing your AI recommendation...');
    setInsight({
      summary: 'Analyzing your active tasks and priority scores...',
      actions_taken: ['Connecting to workspace database'],
      recommendation: 'Assessing workload priorities...',
      at_risk_tasks: [],
      deferred_tasks: []
    });
    setFocusScore(100);
    setAtRiskCount(0);
    setStreakDays(0);

    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Set personalised greeting
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        const name = profile?.full_name ?? user.email ?? 'there';
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        setGreeting(`${timeGreeting}, ${name} 👋`);

        // Fetch tasks + subtasks
        const { data: dbTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('ai_score', { ascending: false, nullsFirst: false });

        const { data: dbSubtasks } = await supabase
          .from('subtasks')
          .select('*')
          .eq('user_id', user.id);

        const mapped = (dbTasks ?? []).map(t => ({
          ...t,
          subtasks: (dbSubtasks ?? []).filter(s => s.task_id === t.id),
        }));
        setTasks(mapped);

        // Compute metrics
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const completedToday = mapped.filter(t => t.status === 'completed' && t.completed_at?.startsWith(todayStr)).length;
        const atRisk = mapped.filter(t => {
          if (!t.due_date) return false;
          const days = (new Date(t.due_date).getTime() - now.getTime()) / 86400000;
          return (t.priority === 'critical' || t.priority === 'high') && days <= 3 && t.status !== 'completed';
        }).length;
        setAtRiskCount(atRisk);

        // Simple focus score: 100 minus penalty for at-risk tasks
        const score = Math.max(20, 100 - atRisk * 15);
        setFocusScore(score);

        // Streak from habits
        const { data: logs } = await supabase
          .from('habit_logs')
          .select('logged_date, completed')
          .eq('user_id', user.id)
          .eq('completed', true)
          .order('logged_date', { ascending: false });

        if (logs?.length) {
          let streak = 0;
          const checked = new Set(logs.map(l => l.logged_date));
          for (let i = 0; i < 365; i++) {
            const d = new Date(now.getTime() - i * 86400000).toISOString().split('T')[0];
            if (checked.has(d)) streak++;
            else break;
          }
          setStreakDays(streak);
        }

        // Fetch today's AI brief if exists
        const { data: storedBrief } = await supabase
          .from('daily_briefs')
          .select('*')
          .eq('user_id', user.id)
          .eq('brief_date', todayStr)
          .single();

        if (storedBrief?.summary) {
          const s = storedBrief.summary as { summary: string; actions_taken: string[]; recommendation: string };
          setInsight({
            summary: s.summary ?? insight.summary,
            actions_taken: s.actions_taken ?? insight.actions_taken,
            recommendation: s.recommendation ?? insight.recommendation,
            at_risk_tasks: insight.at_risk_tasks,
            deferred_tasks: insight.deferred_tasks,
          });
          setRecommendation(storedBrief.recommendation ?? recommendation);
        } else {
          // If no stored brief exists for today, automatically trigger generation
          setBriefLoading(true);
          try {
            const res = await fetch('/api/ai/daily-brief');
            if (res.ok) {
              const json = await res.json();
              if (json.brief) {
                setInsight(prev => ({
                  ...prev,
                  summary: json.brief.summary,
                  actions_taken: json.brief.actions_taken,
                  recommendation: json.brief.recommendation,
                }));
                setRecommendation(json.brief.recommendation);
                setAtRiskCount(json.at_risk_count ?? atRisk);
              }
            }
          } catch (err) {
            console.error('Failed to auto-generate daily brief:', err);
          } finally {
            setBriefLoading(false);
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error, using mock data:', err);
      }
    })();
  }, []);

  // ── Regenerate AI Brief ───────────────────────────────────────
  const handleRegenerateBrief = async () => {
    setBriefLoading(true);
    try {
      const res = await fetch('/api/ai/daily-brief');
      if (res.ok) {
        const json = await res.json();
        if (json.brief) {
          setInsight(prev => ({
            ...prev,
            summary: json.brief.summary,
            actions_taken: json.brief.actions_taken,
            recommendation: json.brief.recommendation,
          }));
          setRecommendation(json.brief.recommendation);
          setAtRiskCount(json.at_risk_count ?? atRiskCount);
        }
      }
    } catch (err) {
      console.error('Failed to refresh AI brief:', err);
    } finally {
      setBriefLoading(false);
    }
  };

  // ── Toggle / delete / edit handlers ──────────────────────────
  const handleToggle = async (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
      return { ...t, status: nextStatus, completed_pct: nextStatus === 'completed' ? 100 : 0,
        completed_at: nextStatus === 'completed' ? new Date().toISOString() : null };
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const task = tasks.find(t => t.id === id);
        if (task) {
          const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
          await supabase.from('tasks').update({
            status: nextStatus,
            completed_pct: nextStatus === 'completed' ? 100 : 0,
            completed_at: nextStatus === 'completed' ? new Date().toISOString() : null,
          }).eq('id', id);
        }
      } catch (err) {
        console.error('Failed to toggle task:', err);
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('tasks').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleEditTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('tasks').update({
          title: updates.title,
          priority: updates.priority,
          due_date: updates.due_date,
        }).eq('id', id);
      } catch (err) {
        console.error('Failed to edit task:', err);
      }
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const completedToday = completedTasks.filter(t =>
    t.completed_at?.startsWith(new Date().toISOString().split('T')[0])
  ).length;

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h2 className="sr-only">Dashboard</h2>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/dashboard" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          Dashboard
        </Link>
        <Link href="/dashboard/today-plan" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Today's Plan
        </Link>
        <Link href="/dashboard/streaks" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Streaks &amp; Deadlines
        </Link>
      </div>

      {/* Daily Brief Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4 flex items-start gap-4"
        style={{ background: 'var(--color-purple-light)', border: '0.5px solid var(--color-border)' }}
      >
        <div className="text-2xl">👋</div>
        <div className="flex-1">
          <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {greeting}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {recommendation}
          </p>
        </div>
        <div className="ml-auto text-right flex-shrink-0 flex flex-col items-end gap-2">
          <div className="text-2xl font-medium" style={{ color: 'var(--color-brand-purple)' }}>
            {focusScore}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Focus Score</div>
          <button
            onClick={handleRegenerateBrief}
            disabled={briefLoading}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors"
            style={{ background: 'var(--color-brand-purple)', color: 'white', opacity: briefLoading ? 0.6 : 1 }}
          >
            <RefreshCw size={10} className={briefLoading ? 'animate-spin' : ''} />
            {briefLoading ? 'Thinking...' : 'Refresh AI'}
          </button>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-3 stagger-children">
        <MetricCard
          label="Focus Score"
          value={focusScore}
          trend={MOCK_METRICS.focus_trend}
          sub="vs yesterday"
          icon={<Zap size={14} />}
          accentColor="var(--color-brand-purple)"
          index={0}
        />
        <MetricCard
          label="Tasks Done"
          value={`${completedToday}/${tasks.length}`}
          sub="completed today"
          icon={<CheckSquare size={14} />}
          accentColor="var(--color-teal)"
          index={1}
        />
        <MetricCard
          label="At Risk"
          value={atRiskCount}
          sub="AI-flagged tasks"
          icon={<AlertTriangle size={14} />}
          accentColor="var(--color-red)"
          index={2}
        />
        <MetricCard
          label="Streak"
          value={`${streakDays}d`}
          sub="current streak 🔥"
          icon={<Flame size={14} />}
          accentColor="var(--color-amber)"
          index={3}
        />
      </div>

      {/* Two-column side-by-side container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Today's Priorities */}
        <div className="card-raised space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Today&apos;s priorities
              </h2>
              <span className="badge-ai text-[10px] px-2 py-0.5 rounded-full font-medium">AI sorted</span>
            </div>
            <Link href="/tasks">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                <Plus size={12} /> Add task
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            {activeTasks.map((task, i) => (
              <TaskRow
                key={task.id}
                task={task}
                index={i}
                onToggle={handleToggle}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
              />
            ))}
            {activeTasks.length === 0 && (
              <p className="text-xs text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                🎉 All caught up! No pending tasks.
              </p>
            )}
          </div>

          {completedTasks.length > 0 && (
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Completed today
              </p>
              {completedTasks.slice(0, 3).map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={i}
                  onToggle={handleToggle}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Insight */}
        <div>
          <AIInsightBanner insight={insight} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { MOCK_HABITS } from '@/lib/mock-data';
import { HabitRow } from '@/components/habits/HabitRow';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Award, Flame, AlertCircle } from 'lucide-react';
import type { Habit, RiskLevel } from '@/types';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState<Habit[]>(isSupabaseConfigured() ? [] : MOCK_HABITS);
  const [userId, setUserId] = useState<string>('mock-user-id');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🎯');
  const [newColor, setNewColor] = useState('purple');

  const fetchHabits = async () => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      setUserId(user.id);

      // Fetch habits
      const { data: dbHabits, error: habitsErr } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (habitsErr) throw habitsErr;

      // Fetch logs
      const { data: dbLogs, error: logsErr } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id);

      if (logsErr) throw logsErr;

      const mappedHabits = (dbHabits || []).map(h => ({
        ...h,
        logs: (dbLogs || []).filter(log => log.habit_id === h.id),
      }));

      setHabits(mappedHabits);
    } catch (error) {
      console.error('Error fetching habits from database, using mock fallback:', error);
      setHabits(MOCK_HABITS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const tempId = `h-${Date.now()}`;
    const newHabit: Habit = {
      id: tempId,
      user_id: userId,
      name: newName,
      icon: newIcon,
      color: newColor,
      target_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      streak_count: 0,
      risk_level: 'low',
      is_active: true,
      order_index: habits.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      logs: [],
    };

    setHabits(prev => [...prev, newHabit]);
    setNewName('');
    setNewIcon('🎯');
    setNewColor('purple');
    setIsOpen(false);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your_supabase')) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('habits')
          .insert({
            user_id: userId,
            name: newHabit.name,
            icon: newHabit.icon,
            color: newHabit.color,
            target_days: newHabit.target_days,
            streak_count: 0,
            risk_level: 'low',
            is_active: true,
            order_index: newHabit.order_index,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setHabits(prev => prev.map(h => h.id === tempId ? { ...h, id: data.id } : h));
        }
      }
    } catch (error) {
      console.error('Failed to add habit to Supabase:', error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your_supabase')) {
        const supabase = createClient();
        await supabase.from('habits').delete().eq('id', id);
      }
    } catch (error) {
      console.error('Failed to delete habit from Supabase:', error);
    }
  };

  const handleEditHabit = async (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your_supabase')) {
        const supabase = createClient();
        await supabase
          .from('habits')
          .update({
            name: updates.name,
            icon: updates.icon,
            color: updates.color,
          })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Failed to edit habit in Supabase:', error);
    }
  };

  const handleToggleToday = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    let isCurrentlyDone = false;

    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const logs = h.logs ?? [];
      const existing = logs.find(l => l.logged_date === today);
      if (existing) {
        isCurrentlyDone = existing.completed;
        return { ...h, logs: logs.map(l => l.logged_date === today ? { ...l, completed: !l.completed } : l) };
      }
      isCurrentlyDone = false;
      return { ...h, logs: [...logs, { id: `log-${Date.now()}`, habit_id: id, user_id: userId, logged_date: today, completed: true, created_at: new Date().toISOString() }] };
    }));

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your_supabase')) {
        const supabase = createClient();
        if (isCurrentlyDone) {
          // It was checked, now unchecking it. We can set completed to false or delete the log. Let's update it to false.
          await supabase
            .from('habit_logs')
            .update({ completed: false })
            .eq('habit_id', id)
            .eq('logged_date', today);
        } else {
          // Upsert log as completed
          const { error } = await supabase
            .from('habit_logs')
            .upsert({
              habit_id: id,
              user_id: userId,
              logged_date: today,
              completed: true,
            }, { onConflict: 'habit_id, logged_date' });
          if (error) throw error;
        }
      }
    } catch (error) {
      console.error('Failed to toggle habit log in Supabase:', error);
    }
  };

  const highRiskHabits = habits.filter(h => h.risk_level === 'high');

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Habit Tracker</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/routine" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Daily Routine
        </Link>
        <Link href="/routine/habits" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          Habit Tracker
        </Link>
        <Link href="/routine/calendar" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Routine Calendar
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Habit Overview</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Establish routines and watch your streaks grow. The AI flags habits at risk of breaking.
          </p>
        </div>

        {/* Add Habit Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="flex items-center justify-center gap-1.5 text-xs bg-[var(--color-brand-purple)] hover:bg-[var(--color-purple-dark)] text-white h-9 px-4 rounded-lg select-none pointer-events-auto">
            <Plus size={16} />
            New Habit
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white p-6 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold text-[var(--color-text-primary)]">
                Create New Habit
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddHabit} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">Habit Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Meditate 10 mins"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="icon" className="text-xs font-medium">Icon / Emoji</Label>
                  <Select value={newIcon} onValueChange={(val) => setNewIcon(val ?? '')}>
                    <SelectTrigger id="icon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="🎯">🎯 Focus</SelectItem>
                      <SelectItem value="🏃">🏃 Exercise</SelectItem>
                      <SelectItem value="📚">📚 Reading</SelectItem>
                      <SelectItem value="😴">😴 Sleep</SelectItem>
                      <SelectItem value="💧">💧 Water</SelectItem>
                      <SelectItem value="🧘">🧘 Mindfulness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="color" className="text-xs font-medium">Theme Color</Label>
                  <Select value={newColor} onValueChange={(val) => setNewColor(val ?? 'purple')}>
                    <SelectTrigger id="color">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="teal">Teal/Green</SelectItem>
                      <SelectItem value="amber">Amber/Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="text-xs h-9">
                  Cancel
                </Button>
                <Button type="submit" className="text-xs h-9 bg-[var(--color-brand-purple)] hover:bg-[var(--color-purple-dark)] text-white">
                  Start Habit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* High-risk warning banner */}
      {highRiskHabits.length > 0 && (
        <div className="card-base flex items-start gap-3 bg-[var(--color-red-light)]/40 border-[color-mix(in srgb, var(--color-red) 20%, transparent)]">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={16} style={{ color: 'var(--color-red)' }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-red)' }}>Habit Streak at Risk</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Your streak for <strong style={{ color: 'var(--color-text-primary)' }}>"{highRiskHabits[0].name}"</strong> is at high risk of breaking (missed 2 of the last 3 days). Let's fit this in today!
            </p>
          </div>
        </div>
      )}

      {/* Main Habits List */}
      <div className="space-y-3">
        <AnimatePresence>
          {habits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onDelete={handleDeleteHabit}
              onEdit={handleEditHabit}
              onToggleToday={handleToggleToday}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Helpful stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-base flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-purple-light)]">
            <Flame size={16} style={{ color: 'var(--color-brand-purple)' }} />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Longest Active Streak</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">12 Days (Morning Reading)</p>
          </div>
        </div>

        <div className="card-base flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-teal-light)]">
            <Award size={16} style={{ color: 'var(--color-teal)' }} />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Overall Completion Rate</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">74% compliance this week</p>
          </div>
        </div>
      </div>
    </div>
  );
}

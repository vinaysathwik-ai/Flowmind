'use client';

import { useState, useEffect } from 'react';
import { MOCK_ROUTINES } from '@/lib/mock-data';
import { Sparkles, Plus, Clock, Info, Check, Pencil, Trash2, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Routine, ColorCode } from '@/types';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function DailyRoutinePage() {
  const [routines, setRoutines] = useState<Routine[]>(
    isSupabaseConfigured() ? [] : MOCK_ROUTINES.map(r => ({ ...r, is_done: false }))
  );
  const [userId, setUserId] = useState<string>('mock-user-id');
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [newColor, setNewColor] = useState<ColorCode>('purple');
  const [newNote, setNewNote] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editColor, setEditColor] = useState<ColorCode>('purple');
  const [editNote, setEditNote] = useState('');

  // ── Fetch from Supabase on mount ──────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data, error } = await supabase
          .from('routines')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: true });

        if (error) throw error;
        if (data) setRoutines(data.map(r => ({ ...r, is_done: false })));
      } catch (err) {
        console.error('Failed to fetch routines, using mock data:', err);
      }
    })();
  }, []);

  // ── Add ───────────────────────────────────────────────────────
  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tempId = `r-${Date.now()}`;
    const newBlock: Routine = {
      id: tempId,
      user_id: userId,
      title: newTitle,
      start_time: newStart,
      end_time: newEnd,
      color: newColor,
      is_ai_inserted: false,
      note: newNote || null,
      recurrence: ['mon', 'tue', 'wed', 'thu', 'fri'],
      order_index: routines.length,
      is_done: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setRoutines(prev =>
      [...prev, newBlock].sort((a, b) => a.start_time.localeCompare(b.start_time))
    );
    setNewTitle(''); setNewStart('09:00'); setNewEnd('10:00');
    setNewColor('purple'); setNewNote(''); setIsOpen(false);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('routines')
          .insert({
            user_id: userId,
            title: newBlock.title,
            start_time: newBlock.start_time,
            end_time: newBlock.end_time,
            color: newBlock.color,
            is_ai_inserted: false,
            note: newBlock.note,
            recurrence: newBlock.recurrence,
            order_index: newBlock.order_index,
          })
          .select()
          .single();
        if (error) throw error;
        if (data) setRoutines(prev => prev.map(r => r.id === tempId ? { ...data, is_done: false } : r));
      } catch (err) {
        console.error('Failed to save routine to database:', err);
      }
    }
  };

  // ── Toggle done (local only — no DB column for this) ─────────
  const handleToggleDone = (id: string) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, is_done: !r.is_done } : r));
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDeleteRoutine = async (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('routines').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete routine from database:', err);
      }
    }
  };

  // ── Edit ──────────────────────────────────────────────────────
  const startEdit = (item: Routine) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditStart(item.start_time);
    setEditEnd(item.end_time);
    setEditColor(item.color);
    setEditNote(item.note || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    setRoutines(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, title: editTitle, start_time: editStart, end_time: editEnd,
              color: editColor, note: editNote || null, updated_at: new Date().toISOString() }
          : r
      ).sort((a, b) => a.start_time.localeCompare(b.start_time))
    );
    setEditingId(null);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('routines').update({
          title: editTitle,
          start_time: editStart,
          end_time: editEnd,
          color: editColor,
          note: editNote || null,
        }).eq('id', id);
      } catch (err) {
        console.error('Failed to update routine in database:', err);
      }
    }
  };

  // Color classes mapping for backgrounds & left borders
  const colorMap: Record<ColorCode, { border: string; bg: string; dot: string }> = {
    purple: { border: 'border-l-4 border-[var(--color-brand-purple)]', bg: 'bg-[var(--color-purple-light)]/20', dot: 'bg-[var(--color-brand-purple)]' },
    green: { border: 'border-l-4 border-[var(--color-teal)]', bg: 'bg-[var(--color-teal-light)]/20', dot: 'bg-[var(--color-teal)]' },
    amber: { border: 'border-l-4 border-[#D97706]', bg: 'bg-[#FAEEDA]/30', dot: 'bg-[#D97706]' },
    gray: { border: 'border-l-4 border-[var(--color-gray)]', bg: 'bg-[var(--color-gray-light)]/20', dot: 'bg-[var(--color-gray)]' },
    red: { border: 'border-l-4 border-[var(--color-red)]', bg: 'bg-[var(--color-red-light)]/20', dot: 'bg-[var(--color-red)]' }
  };

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Daily Routine</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/routine" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          Daily Routine
        </Link>
        <Link href="/routine/habits" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Habit Tracker
        </Link>
        <Link href="/routine/calendar" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Routine Calendar
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Routine Overview</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Your default structured schedule containing custom activities and AI focus blocks.
          </p>
        </div>

        {/* Add custom block button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="flex items-center justify-center gap-1.5 text-xs bg-[var(--color-brand-purple)] hover:bg-[var(--color-purple-dark)] text-white h-9 px-4 rounded-lg select-none pointer-events-auto">
            <Plus size={16} />
            Add Block
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white p-6 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold text-[var(--color-text-primary)]">
                Add Routine Block
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRoutine} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium">Activity Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Morning Jog"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start" className="text-xs font-medium">Start Time</Label>
                  <Input
                    id="start"
                    type="time"
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end" className="text-xs font-medium">End Time</Label>
                  <Input
                    id="end"
                    type="time"
                    value={newEnd}
                    onChange={e => setNewEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="color" className="text-xs font-medium">Category Color</Label>
                <Select value={newColor} onValueChange={(val) => setNewColor((val as ColorCode) ?? 'purple')}>
                  <SelectTrigger id="color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purple">Purple (Focus Work)</SelectItem>
                    <SelectItem value="green">Green (Wellness/Habits)</SelectItem>
                    <SelectItem value="amber">Amber (Meetings/Sync)</SelectItem>
                    <SelectItem value="gray">Gray (Admin/Breaks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note" className="text-xs font-medium">Optional Note</Label>
                <Input
                  id="note"
                  placeholder="e.g. 5km run at the park"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="text-xs h-9">
                  Cancel
                </Button>
                <Button type="submit" className="text-xs h-9 bg-[var(--color-brand-purple)] hover:bg-[var(--color-purple-dark)] text-white">
                  Add to Routine
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Routine schedule list */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {routines.map((item) => {
            const config = colorMap[item.color] || colorMap.gray;
            
            // Calculate duration in minutes/hours
            const [startH, startM] = item.start_time.split(':').map(Number);
            const [endH, endM] = item.end_time.split(':').map(Number);
            const diffMin = (endH * 60 + endM) - (startH * 60 + startM);
            const hours = Math.floor(diffMin / 60);
            const mins = diffMin % 60;
            const durationStr = hours > 0 
              ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
              : `${mins}m`;

            const isEditing = editingId === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  `flex flex-col p-4 rounded-xl ${config.border} ${config.bg} transition-all`,
                  item.is_done && 'opacity-60'
                )}
                style={{ 
                  background: 'var(--color-surface)', 
                  borderTop: '0.5px solid var(--color-border)', 
                  borderRight: '0.5px solid var(--color-border)', 
                  borderBottom: '0.5px solid var(--color-border)' 
                }}
              >
                {isEditing ? (
                  /* ── Edit Mode ── */
                  <div className="space-y-3 w-full">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Activity Title</Label>
                      <Input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Start Time</Label>
                        <Input
                          type="time"
                          value={editStart}
                          onChange={e => setEditStart(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">End Time</Label>
                        <Input
                          type="time"
                          value={editEnd}
                          onChange={e => setEditEnd(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Category Color</Label>
                        <Select value={editColor} onValueChange={(val) => setEditColor((val as ColorCode) ?? 'purple')}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="amber">Amber</SelectItem>
                            <SelectItem value="gray">Gray</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Note</Label>
                        <Input
                          value={editNote}
                          onChange={e => setEditNote(e.target.value)}
                          className="h-8 text-xs"
                          placeholder="Optional note"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg transition-colors border"
                        style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
                      >
                        <X size={11} /> Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg text-white transition-colors"
                        style={{ background: 'var(--color-brand-purple)' }}
                      >
                        <Save size={11} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View Mode ── */
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleDone(item.id)}
                        aria-label={`Mark ${item.title} as ${item.is_done ? 'incomplete' : 'complete'}`}
                        className={cn(
                          'w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all',
                          item.is_done
                            ? 'border-[var(--color-brand-purple)] bg-[var(--color-brand-purple)]'
                            : 'border-[var(--color-border-secondary)] hover:border-[var(--color-brand-purple)]'
                        )}
                      >
                        {item.is_done && <Check size={10} color="white" strokeWidth={3} />}
                      </button>

                      <div className="flex flex-col items-start min-w-[70px]">
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {item.start_time}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          to {item.end_time}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "text-xs font-semibold",
                            item.is_done && "line-through opacity-75"
                          )} style={{ color: 'var(--color-text-primary)' }}>
                            {item.title}
                          </h3>
                          {item.is_ai_inserted && (
                            <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded font-medium"
                              style={{ background: 'var(--color-purple-light)', color: 'var(--color-brand-purple)' }}>
                              <Sparkles size={8} />
                              AI Scheduled
                            </span>
                          )}
                        </div>
                        {item.note && (
                          <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--color-gray-light)', color: 'var(--color-text-secondary)' }}>
                        {durationStr}
                      </span>
                      
                      {/* Dot */}
                      <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-0.5 ml-2 border-l pl-2" style={{ borderColor: 'var(--color-border)' }}>
                        <button
                          onClick={() => startEdit(item)}
                          aria-label="Edit routine block"
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-purple-light)]"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteRoutine(item.id)}
                          aria-label="Delete routine block"
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-red-light)]"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Routine advice block */}
      <div className="card-base flex items-start gap-3 bg-[var(--color-teal-light)]/40 border-[color-mix(in srgb, var(--color-teal) 20%, transparent)]">
        <Info className="mt-0.5 flex-shrink-0" size={16} style={{ color: 'var(--color-teal)' }} />
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>Routine Recommendation</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Your peak cognitive performance is typically between 9:00 AM and 12:00 PM. The scheduling agent reserves this window for deep focus tasks like "Database Schema Work".
          </p>
        </div>
      </div>
    </div>
  );
}

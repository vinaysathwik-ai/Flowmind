'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Pencil, Trash2, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Habit } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HabitDotProps {
  state: 'done' | 'pending' | 'missed';
  className?: string;
}

export function HabitDot({ state, className }: HabitDotProps) {
  return (
    <span className={cn(
      'w-2.5 h-2.5 rounded-full inline-block',
      state === 'done' ? 'habit-dot-done' :
      state === 'pending' ? 'habit-dot-pending' :
      'habit-dot-missed',
      className
    )} />
  );
}

interface HabitRowProps {
  habit: Habit;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updates: Partial<Habit>) => void;
  onToggleToday?: (id: string) => void;
}

export function HabitRow({ habit, onDelete, onEdit, onToggleToday }: HabitRowProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayLog = habit.logs?.find(l => l.logged_date === today);
  const [doneToday, setDoneToday] = useState(todayLog?.completed ?? false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(habit.name);
  const [editIcon, setEditIcon] = useState(habit.icon);
  const [editColor, setEditColor] = useState(habit.color);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0];
    const log = habit.logs?.find(l => l.logged_date === d);
    if (d === today) return doneToday ? 'done' : 'pending';
    if (log?.completed) return 'done';
    return 'missed';
  });

  const handleCheck = () => {
    setDoneToday(v => !v);
    onToggleToday?.(habit.id);
  };

  const handleSaveEdit = () => {
    onEdit?.(habit.id, { name: editName, icon: editIcon, color: editColor });
    setIsEditing(false);
  };

  const bgColor = habit.color === 'teal'
    ? 'var(--color-teal-light)'
    : habit.color === 'amber'
    ? 'var(--color-amber-light)'
    : 'var(--color-purple-light)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="card-base flex flex-col gap-3"
    >
      {isEditing ? (
        /* ── Edit mode ── */
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: bgColor }}>
              {editIcon}
            </div>
            <Input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="h-8 text-xs flex-1"
              placeholder="Habit name"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={editIcon} onValueChange={v => setEditIcon(v ?? '🎯')}>
              <SelectTrigger className="h-8 text-xs flex-1">
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
            <Select value={editColor} onValueChange={v => setEditColor(v ?? 'purple')}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="teal">Teal</SelectItem>
                <SelectItem value="amber">Amber</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg transition-colors"
              style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            >
              <X size={11} /> Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg text-white transition-colors"
              style={{ background: 'var(--color-brand-purple)' }}
            >
              <Save size={11} /> Save
            </button>
          </div>
        </div>
      ) : (
        /* ── View mode ── */
        <div className="flex items-center gap-4">
          {/* Today's checkbox */}
          <button
            onClick={handleCheck}
            aria-label={`Mark ${habit.name} as ${doneToday ? 'not done' : 'done'} today`}
            className={cn(
              'w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all',
              doneToday
                ? 'border-[var(--color-brand-purple)] bg-[var(--color-brand-purple)]'
                : 'border-[var(--color-border-secondary)] hover:border-[var(--color-brand-purple)]'
            )}
          >
            {doneToday && <Check size={10} color="white" strokeWidth={3} />}
          </button>

          {/* Icon */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
            style={{ background: bgColor }}
          >
            {habit.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn('text-xs font-medium', doneToday && 'line-through opacity-60')}
                style={{ color: 'var(--color-text-primary)' }}
              >
                {habit.name}
              </span>
              {habit.risk_level === 'high' && (
                <span className="badge-high text-[9px] px-1.5 py-0.5 rounded-full">Risk</span>
              )}
            </div>
            {/* 7-day dots */}
            <div className="flex items-center gap-1.5">
              {last7.map((state, i) => (
                <HabitDot key={i} state={state as 'done' | 'pending' | 'missed'} />
              ))}
            </div>
          </div>

          {/* Streak */}
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-medium" style={{ color: 'var(--color-teal)' }}>{habit.streak_count}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>days</div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              aria-label="Edit habit"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-purple-light)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => onDelete?.(habit.id)}
              aria-label="Delete habit"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-red-light)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

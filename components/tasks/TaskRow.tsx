'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Check, ChevronDown, ChevronRight, Pencil, Trash2, X, Save } from 'lucide-react';
import { PriorityBadge, AIActionTag } from './Badges';
import { cn } from '@/lib/utils';
import type { Task, Priority } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskRowProps {
  task: Task;
  index?: number;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updates: Partial<Task>) => void;
}

export default function TaskRow({ task, index = 0, onToggle, onDelete, onEdit }: TaskRowProps) {
  const [checked, setChecked] = useState(task.status === 'completed');
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editDue, setEditDue] = useState(
    task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
  );

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  const isCritical = task.priority === 'critical';

  const handleCheck = () => {
    setChecked(v => !v);
    onToggle?.(task.id);
  };

  const handleSaveEdit = () => {
    onEdit?.(task.id, {
      title: editTitle,
      priority: editPriority,
      due_date: editDue ? new Date(editDue).toISOString() : null,
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      layout
      className={cn(
        'card-base flex flex-col gap-0 transition-all',
        isCritical && !checked && 'card-critical-border',
        task.is_deferred && 'task-deferred',
        checked && !isEditing && 'task-completed'
      )}
    >
      {isEditing ? (
        /* ── Inline edit form ── */
        <div className="flex flex-col gap-3">
          <Input
            autoFocus
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="h-8 text-xs"
            placeholder="Task title"
          />
          <div className="flex items-center gap-2">
            <Select value={editPriority} onValueChange={v => setEditPriority((v as Priority) ?? 'medium')}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={editDue}
              onChange={e => setEditDue(e.target.value)}
              className="h-8 text-xs flex-1"
            />
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
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <button
            onClick={handleCheck}
            aria-label={`Mark ${task.title} as ${checked ? 'incomplete' : 'complete'}`}
            className={cn(
              'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
              checked
                ? 'border-[var(--color-brand-purple)] bg-[var(--color-brand-purple)]'
                : 'border-[var(--color-border-secondary)] hover:border-[var(--color-brand-purple)]'
            )}
          >
            {checked && <Check size={10} color="white" strokeWidth={3} />}
          </button>

          {/* Title + badges */}
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <span
              className={cn('text-sm truncate', checked ? 'line-through opacity-50' : 'font-medium')}
              style={{ color: 'var(--color-text-primary)' }}
            >
              {task.title}
            </span>
            {task.project_tag && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: 'var(--color-gray-light)', color: 'var(--color-gray)' }}
              >
                {task.project_tag}
              </span>
            )}
            <PriorityBadge priority={task.priority} />
            {task.is_ai_sorted && <AIActionTag label="AI sorted" />}
            {task.is_deferred && <AIActionTag label="Auto-deferred" />}
          </div>

          {/* Due date + subtask toggle */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {task.due_date && (
              <span
                className={cn('text-[11px]', isOverdue ? 'text-[var(--color-red)]' : '')}
                style={isOverdue ? {} : { color: 'var(--color-text-muted)' }}
              >
                {format(new Date(task.due_date), 'MMM d')}
              </span>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="p-0.5 rounded hover:bg-[var(--color-purple-light)] transition-colors"
                aria-label="Toggle subtasks"
              >
                {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
            )}
          </div>

          {/* Edit + Delete */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              aria-label="Edit task"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-purple-light)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => onDelete?.(task.id)}
              aria-label="Delete task"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-red-light)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {/* AI reason — only in view mode */}
      {!isEditing && task.ai_reason && task.ai_score && !checked && (
        <div className="mt-2 ml-8 flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-md"
              style={{ background: 'var(--color-purple-light)' }}
            >
              <span className="text-[10px] font-medium" style={{ color: 'var(--color-brand-purple)' }}>
                Score: {task.ai_score}/100
              </span>
            </div>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {task.ai_reason}
            </span>
          </div>
        </div>
      )}

      {/* Subtasks */}
      {!isEditing && expanded && task.subtasks && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 ml-8 space-y-2"
        >
          {task.subtasks.map(sub => (
            <div key={sub.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  sub.is_done
                    ? 'bg-[var(--color-brand-purple)] border-[var(--color-brand-purple)]'
                    : 'border-[var(--color-border-secondary)]'
                )}
              >
                {sub.is_done && <Check size={8} color="white" strokeWidth={3} />}
              </div>
              <span
                className={cn('text-xs', sub.is_done && 'line-through opacity-50')}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {sub.title}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

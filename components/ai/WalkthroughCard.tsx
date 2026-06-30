'use client';

import { motion } from 'framer-motion';
import { type AIAction } from '@/types';
import ActionChip from './ActionChip';
import { cn } from '@/lib/utils';

const CHIPS_BY_TYPE: Record<string, string[]> = {
  DEADLINE_RISK: ['View task', 'See details', 'Override'],
  SCHEDULE_BLOCK: ['Show schedule', 'Reschedule', 'View calendar', 'Undo'],
  DEFER_TASK: ['View deferred', 'Undo deferral', 'Override'],
  REMINDER_SET: ['Edit reminders', 'Disable', 'View all'],
  HABIT_NUDGE: ['Log habit', 'Snooze', 'Dismiss'],
  ROUTINE_OPTIMIZE: ['Apply changes', 'Review', 'Dismiss'],
  GOAL_ROADMAP: ['View roadmap', 'Edit', 'Dismiss'],
  PRIORITIZE: ['View tasks', 'Override', 'Dismiss'],
};

interface WalkthroughCardProps {
  action: AIAction;
  index?: number;
}

export default function WalkthroughCard({ action, index = 0 }: WalkthroughCardProps) {
  const chips = CHIPS_BY_TYPE[action.action_type] ?? ['Acknowledge', 'Dismiss'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="card-raised flex gap-4"
    >
      {/* Step number */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
        style={{ background: 'var(--color-brand-purple)' }}>
        {action.step_number}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{action.title}</p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{action.reason}</p>
        {action.impact && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md w-fit"
            style={{ background: 'var(--color-teal-light)' }}>
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-teal)' }}>
              Impact: {action.impact}
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {chips.map(chip => <ActionChip key={chip} label={chip} />)}
        </div>
      </div>
    </motion.div>
  );
}

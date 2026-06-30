'use client';

import { motion } from 'framer-motion';
import { BrainCircuit, ChevronRight } from 'lucide-react';
import type { AIInsight } from '@/types';
import ActionChip from '@/components/ai/ActionChip';

interface AIInsightBannerProps {
  insight: AIInsight;
  userName?: string;
}

export default function AIInsightBanner({ insight, userName }: AIInsightBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="card-raised border-l-2 p-5"
      style={{ borderLeftColor: 'var(--color-brand-purple)' }}
    >
      <div className="flex gap-4">
        {/* AI Avatar */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-purple-light)' }}>
          <BrainCircuit size={18} style={{ color: 'var(--color-brand-purple)' }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-medium"
              style={{ color: 'var(--color-brand-purple)' }}>
              AI insight · Today
            </span>
          </div>

          {/* At-risk highlight */}
          {insight.at_risk_tasks.length > 0 && (
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Your <span style={{ color: 'var(--color-red)' }}>{insight.at_risk_tasks[0].title}</span> task is at risk.
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {insight.at_risk_tasks[0].reason}
              </p>
            </div>
          )}

          {/* Actions taken */}
          {insight.actions_taken.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>I scheduled:</p>
              <ul className="space-y-1">
                {insight.actions_taken.map((action, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-primary)' }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-brand-purple)' }} />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deferred */}
          {insight.deferred_tasks.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>I deferred:</p>
              <ul className="space-y-1">
                {insight.deferred_tasks.map((task, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0 opacity-50" style={{ background: 'var(--color-gray)' }} />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          <div className="rounded-md px-3 py-2" style={{ background: 'var(--color-purple-light)' }}>
            <p className="text-xs" style={{ color: 'var(--color-purple-dark)' }}>
              💡 {insight.recommendation}
            </p>
          </div>

          {/* Action chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            <ActionChip label="Show full plan" />
            <ActionChip label="Reschedule blocks" />
            <ActionChip label="Break into subtasks" />
            <ActionChip label="Defer low-priority" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

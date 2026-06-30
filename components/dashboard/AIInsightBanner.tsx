'use client';

import { motion } from 'framer-motion';
import { BrainCircuit, RefreshCw } from 'lucide-react';
import type { AIInsight } from '@/types';
import ActionChip from '@/components/ai/ActionChip';

interface AIInsightBannerProps {
  insight: AIInsight;
  userName?: string;
  loading?: boolean;
  onRegenerate?: () => void;
}

export default function AIInsightBanner({ insight, userName, loading, onRegenerate }: AIInsightBannerProps) {
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
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-medium"
              style={{ color: 'var(--color-brand-purple)' }}>
              AI insight · Today
            </span>
            
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={loading}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                title="Regenerate AI Brief"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>

          {/* Summary / Greeting */}
          {insight.summary && (
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {insight.summary}
            </p>
          )}

          {/* At-risk highlight */}
          {insight.at_risk_tasks && insight.at_risk_tasks.length > 0 && (
            <div className="pt-1">
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                ⚠️ Task at risk: <span style={{ color: 'var(--color-red)' }}>{insight.at_risk_tasks[0].title}</span>
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Reason: {insight.at_risk_tasks[0].reason}
              </p>
            </div>
          )}

          {/* Actions taken */}
          {insight.actions_taken && insight.actions_taken.length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Today's Plan:</p>
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
          {insight.deferred_tasks && insight.deferred_tasks.length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Deferred items:</p>
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
          {insight.recommendation && (
            <div className="rounded-md px-3 py-2" style={{ background: 'var(--color-purple-light)' }}>
              <p className="text-xs" style={{ color: 'var(--color-purple-dark)' }}>
                💡 {insight.recommendation}
              </p>
            </div>
          )}

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

'use client';

import { cn } from '@/lib/utils';
import type { Priority } from '@/types';
import { Sparkles } from 'lucide-react';

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'badge-critical' },
  high:     { label: 'High',     className: 'badge-high' },
  medium:   { label: 'Medium',  className: 'badge-medium' },
  low:      { label: 'Low',     className: 'badge-low' },
  deferred: { label: 'Deferred',className: 'badge-deferred' },
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
      cfg.className,
      className
    )}>
      {cfg.label}
    </span>
  );
}

interface AIActionTagProps {
  label?: string;
  className?: string;
}

export function AIActionTag({ label = 'AI sorted', className }: AIActionTagProps) {
  return (
    <span className={cn('badge-ai inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', className)}>
      <Sparkles size={9} />
      {label}
    </span>
  );
}

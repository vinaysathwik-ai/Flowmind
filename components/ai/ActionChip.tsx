'use client';

import { cn } from '@/lib/utils';

interface ActionChipProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export default function ActionChip({ label, onClick, className }: ActionChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs border transition-colors',
        'hover:bg-[var(--color-purple-light)] hover:border-[var(--color-brand-purple)] hover:text-[var(--color-brand-purple)]',
        className
      )}
      style={{
        background: 'var(--color-surface-secondary)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-secondary)',
      }}
    >
      {label}
    </button>
  );
}

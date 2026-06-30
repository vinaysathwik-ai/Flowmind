'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  icon?: React.ReactNode;
  accentColor?: string;
  index?: number;
}

export default function MetricCard({ label, value, sub, trend, icon, accentColor, index = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className="card-base flex flex-col gap-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </span>
        {icon && <span style={{ color: accentColor ?? 'var(--color-brand-purple)' }}>{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-0.5 text-[11px] mb-0.5', trend >= 0 ? 'text-[var(--color-teal)]' : 'text-[var(--color-red)]')}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend >= 0 ? '+' : ''}{trend}
          </div>
        )}
      </div>
      {sub && <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{sub}</span>}
    </motion.div>
  );
}

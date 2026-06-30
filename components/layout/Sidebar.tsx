'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CheckSquare, RotateCcw, BrainCircuit, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: 'risk' },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare, badge: 'tasks' },
  { label: 'Routine', href: '/routine', icon: RotateCcw },
  { label: 'AI Planning', href: '/ai-planning', icon: BrainCircuit },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  tasksTotal?: number;
  atRiskCount?: number;
  focusActive?: boolean;
}

export default function Sidebar({ tasksTotal = 5, atRiskCount = 1, focusActive = false }: SidebarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-[200px] flex-shrink-0 h-screen sticky top-0 flex flex-col border-r overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--color-brand-purple)' }}>
          <BrainCircuit size={15} color="white" />
        </div>
        <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
          FlowMind
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = isItemActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors',
                active
                  ? 'nav-item-active font-semibold'
                  : 'nav-item-inactive hover:bg-[var(--color-purple-light)]/50'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} />
                <span>{item.label}</span>
              </div>
              
              {/* Badges */}
              {item.badge === 'tasks' && tasksTotal > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: 'var(--color-purple-light)', color: 'var(--color-brand-purple)' }}>
                  {tasksTotal}
                </span>
              )}
              {item.badge === 'risk' && atRiskCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: 'var(--color-red-light)', color: 'var(--color-red)' }}>
                  {atRiskCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Live indicator */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <span className="ai-pulse-dot w-2 h-2 rounded-full flex-shrink-0" />
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {focusActive
              ? 'Focus active'
              : `AI monitoring · ${atRiskCount} risk${atRiskCount !== 1 ? 's' : ''} flagged`}
          </span>
        </div>
      </div>
    </aside>
  );
}

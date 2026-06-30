'use client';

import { Bell, Mic, MicOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TopBarProps {
  userName?: string;
  avatarUrl?: string | null;
  atRiskCount?: number;
  notificationCount?: number;
}

export default function TopBar({ userName = 'Vinay', avatarUrl, atRiskCount = 1, notificationCount = 3 }: TopBarProps) {
  const [voiceActive, setVoiceActive] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = format(now, 'EEEE, MMMM d');

  const toggleVoice = () => setVoiceActive(v => !v);

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

      {/* Greeting */}
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {greeting}, {userName} 👋
        </p>
        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {dateStr} · {atRiskCount} deadline{atRiskCount !== 1 ? 's' : ''} at risk this week
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Voice pill */}
        <div className="relative">
          <AnimatePresence>
            {voiceActive && (
              <motion.div
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full voice-ring"
                style={{ background: 'var(--color-brand-purple)' }}
              />
            )}
          </AnimatePresence>
          <button
            onClick={toggleVoice}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              voiceActive
                ? 'text-white'
                : 'text-white'
            )}
            style={{ background: 'var(--color-brand-purple)' }}
            aria-label={voiceActive ? 'Stop voice assistant' : 'Start voice assistant'}
          >
            {voiceActive ? <MicOff size={12} /> : <Mic size={12} />}
            {voiceActive ? 'Listening...' : 'Voice'}
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center border transition-colors hover:bg-[var(--color-purple-light)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            aria-label="Notifications"
          >
            <Bell size={15} />
          </button>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center text-white font-medium"
              style={{ background: 'var(--color-red)' }}>
              {notificationCount}
            </span>
          )}
        </div>

        {/* Avatar */}
        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className="text-xs font-medium text-white"
            style={{ background: 'var(--color-brand-purple)' }}>
            {userName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

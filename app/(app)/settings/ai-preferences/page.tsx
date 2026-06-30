'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar, ArrowRightLeft, PenTool, BrainCircuit, Mic } from 'lucide-react';
import Link from 'next/link';

export default function AIPreferencesPage() {
  const [autonomousScheduling, setAutonomousScheduling] = useState(true);
  const [taskPrioritization, setTaskPrioritization] = useState(true);
  const [autoDraftNotes, setAutoDraftNotes] = useState(false);
  const [patternLearning, setPatternLearning] = useState(true);
  const [voiceAssistant, setVoiceAssistant] = useState(true);
  const [assertiveness, setAssertiveness] = useState([50]); // 0 = Minimal, 50 = Balanced, 100 = Assertive

  const getAssertivenessLabel = (val: number) => {
    if (val < 33) return 'Minimal (Nudge only)';
    if (val < 66) return 'Balanced (Suggest blocks)';
    return 'Assertive (Auto-schedule blocks)';
  };

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">AI Preferences</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/settings" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Profile
        </Link>
        <Link href="/settings/calendar" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Calendar Integration
        </Link>
        <Link href="/settings/notifications" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Notifications
        </Link>
        <Link href="/settings/ai-preferences" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          AI Preferences
        </Link>
      </div>

      {/* Preferences card */}
      <div className="card-base space-y-6">
        
        {/* Assertiveness Slider */}
        <div className="space-y-3 pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex justify-between items-center">
            <div>
              <Label className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Agent Intervention Level (Assertiveness)
              </Label>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                Controls how aggressively the scheduling agent modifies your calendar.
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded"
              style={{ background: 'var(--color-purple-light)', color: 'var(--color-brand-purple)' }}>
              {getAssertivenessLabel(assertiveness[0])}
            </span>
          </div>

          <div className="pt-2">
            <Slider
              value={assertiveness}
              onValueChange={(val) => setAssertiveness(Array.isArray(val) ? val : [val])}
              max={100}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-[9px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
              <span>Minimal</span>
              <span>Balanced</span>
              <span>Assertive</span>
            </div>
          </div>
        </div>

        {/* Autonomous scheduling */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5" size={16} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <Label htmlFor="autoSched" className="text-xs font-semibold block cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                Autonomous Scheduling
              </Label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Allow the agent to auto-insert deep work blocks for at-risk tasks.
              </span>
            </div>
          </div>
          <Switch
            id="autoSched"
            checked={autonomousScheduling}
            onCheckedChange={setAutonomousScheduling}
          />
        </div>

        {/* Task prioritization */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <ArrowRightLeft className="mt-0.5" size={16} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <Label htmlFor="taskPrio" className="text-xs font-semibold block cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                Task Prioritization
              </Label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Agent prioritizes and scores tasks daily based on effort & deadlines.
              </span>
            </div>
          </div>
          <Switch
            id="taskPrio"
            checked={taskPrioritization}
            onCheckedChange={setTaskPrioritization}
          />
        </div>

        {/* Auto-draft notes */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <PenTool className="mt-0.5" size={16} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <Label htmlFor="autoDraft" className="text-xs font-semibold block cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                Auto-Draft Focus Notes
              </Label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Create structured templates for focus sessions.
              </span>
            </div>
          </div>
          <Switch
            id="autoDraft"
            checked={autoDraftNotes}
            onCheckedChange={setAutoDraftNotes}
          />
        </div>

        {/* Pattern learning */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <BrainCircuit className="mt-0.5" size={16} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <Label htmlFor="pattern" className="text-xs font-semibold block cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                Habit Pattern Learning
              </Label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Learn compliance patterns to predict when you are at risk of missing a habit.
              </span>
            </div>
          </div>
          <Switch
            id="pattern"
            checked={patternLearning}
            onCheckedChange={setPatternLearning}
          />
        </div>

        {/* Voice assistant */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Mic className="mt-0.5" size={16} style={{ color: 'var(--color-brand-purple)' }} />
            <div>
              <Label htmlFor="voice" className="text-xs font-semibold block cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                Voice Assistant Integration
              </Label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Enable Web Speech API for voice triggers and commands.
              </span>
            </div>
          </div>
          <Switch
            id="voice"
            checked={voiceAssistant}
            onCheckedChange={setVoiceAssistant}
          />
        </div>
      </div>
    </div>
  );
}

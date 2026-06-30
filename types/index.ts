// types/index.ts — FlowMind shared TypeScript types

export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'deferred';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'deferred';
export type AssertiveLevel = 'minimal' | 'balanced' | 'assertive';
export type CalendarSource = 'flowmind' | 'google_personal' | 'google_work' | 'apple' | 'outlook';
export type ColorCode = 'purple' | 'green' | 'amber' | 'gray' | 'red';
export type RiskLevel = 'low' | 'medium' | 'high';
export type AIActionType =
  | 'SCHEDULE_BLOCK'
  | 'DEFER_TASK'
  | 'PRIORITIZE'
  | 'DEADLINE_RISK'
  | 'REMINDER_SET'
  | 'HABIT_NUDGE'
  | 'ROUTINE_OPTIMIZE'
  | 'GOAL_ROADMAP';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro';
  timezone: string;
  work_hours_start: string;
  work_hours_end: string;
  peak_focus_start: string;
  peak_focus_end: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface AIPreferences {
  id: string;
  user_id: string;
  autonomous_scheduling: boolean;
  task_prioritization: boolean;
  auto_draft_notes: boolean;
  pattern_learning: boolean;
  voice_assistant: boolean;
  assertiveness_level: AssertiveLevel;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  estimated_hours: number | null;
  completed_pct: number;
  project_tag: string | null;
  ai_score: number | null;
  ai_reason: string | null;
  parent_task_id: string | null;
  is_deferred: boolean;
  is_ai_sorted: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  is_done: boolean;
  order_index: number;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  external_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  source: CalendarSource;
  is_ai_scheduled: boolean;
  color_code: ColorCode;
  task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  target_days: string[];
  streak_count: number;
  risk_level: RiskLevel;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  logs?: HabitLog[];
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  logged_date: string;
  completed: boolean;
  created_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  color: ColorCode;
  is_ai_inserted: boolean;
  note: string | null;
  recurrence: string[];
  order_index: number;
  is_done?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'paused';
  target_date: string | null;
  progress_pct: number;
  created_at: string;
  updated_at: string;
  milestones?: GoalMilestone[];
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  order_index: number;
  is_done: boolean;
  created_at: string;
}

export interface AIAction {
  id: string;
  user_id: string;
  action_type: AIActionType;
  step_number: number;
  title: string;
  reason: string;
  impact: string | null;
  metadata: Record<string, unknown> | null;
  acknowledged: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'deadline_reminder' | 'ai_nudge' | 'streak_alert' | 'daily_summary' | 'focus_mode';
  title: string;
  body: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface DailyBrief {
  id: string;
  user_id: string;
  brief_date: string;
  focus_score: number | null;
  top_task_id: string | null;
  at_risk_count: number;
  recommendation: string | null;
  summary: Record<string, unknown> | null;
  created_at: string;
}

export interface CalendarIntegration {
  id: string;
  user_id: string;
  provider: CalendarSource;
  is_connected: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

// AI Agent types
export interface PrioritizedTask {
  task_id: string;
  title: string;
  priority: Priority;
  score: number;
  reason: string;
  estimated_hours_remaining: number;
}

export interface ScheduledBlock {
  start: string;
  end: string;
  activity: string;
  task_id?: string;
  color_code: ColorCode;
  is_ai_scheduled: boolean;
}

export interface AIInsight {
  summary: string;
  actions_taken: string[];
  recommendation: string;
  at_risk_tasks: PrioritizedTask[];
  deferred_tasks: string[];
}

export interface DailyBriefOutput {
  focus_score: number;
  top_task: string;
  at_risk_tasks: number;
  today_plan: ScheduledBlock[];
  recommendation: string;
  greeting: string;
}

export interface HabitCoachOutput {
  habit: string;
  streak: number;
  risk: RiskLevel;
  message: string;
}

export interface RoadmapOutput {
  goal: string;
  roadmap: string[];
}

export interface WalkthroughStep {
  step: number;
  action_type: AIActionType;
  title: string;
  explanation: string;
  impact: string;
  chips: string[];
}

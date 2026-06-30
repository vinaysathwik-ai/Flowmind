// lib/mock-data.ts — Mock data for FlowMind (used when API keys are not configured)

import type {
  Task, Habit, HabitLog, Routine, Goal, GoalMilestone,
  AIAction, CalendarEvent, DailyBrief, AIInsight, WalkthroughStep
} from '@/types';

export const MOCK_USER = {
  id: 'mock-user-id',
  full_name: 'Vinay',
  email: 'vinay@flowmind.app',
  avatar_url: null,
  plan: 'pro' as const,
  timezone: 'Asia/Kolkata',
  work_hours_start: '09:00',
  work_hours_end: '18:00',
  peak_focus_start: '09:00',
  peak_focus_end: '12:00',
  language: 'en',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    user_id: 'mock-user-id',
    title: 'Finish Database Schema',
    description: 'Design and implement the full database schema for FlowMind including all tables and RLS policies.',
    priority: 'critical',
    status: 'in_progress',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 5,
    completed_pct: 20,
    project_tag: 'FlowMind',
    ai_score: 92,
    ai_reason: 'Deadline in 2 days and only 20% complete',
    parent_task_id: null,
    is_deferred: false,
    is_ai_sorted: true,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't2',
    user_id: 'mock-user-id',
    title: 'Build Authentication Flow',
    description: 'Implement Supabase Auth with Google OAuth.',
    priority: 'high',
    status: 'pending',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 3,
    completed_pct: 0,
    project_tag: 'FlowMind',
    ai_score: 78,
    ai_reason: 'Blocking other tasks, due in 3 days',
    parent_task_id: null,
    is_deferred: false,
    is_ai_sorted: true,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't3',
    user_id: 'mock-user-id',
    title: 'Design Dashboard UI',
    description: 'Create the main dashboard with all metric cards and AI insight banner.',
    priority: 'high',
    status: 'pending',
    due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 6,
    completed_pct: 0,
    project_tag: 'FlowMind',
    ai_score: 71,
    ai_reason: 'Large effort estimate, start soon',
    parent_task_id: null,
    is_deferred: false,
    is_ai_sorted: true,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't4',
    user_id: 'mock-user-id',
    title: 'Research UI color palettes',
    description: 'Compare color palettes for productivity apps.',
    priority: 'low',
    status: 'deferred',
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 1,
    completed_pct: 0,
    project_tag: 'Design',
    ai_score: 15,
    ai_reason: 'Deferred to protect critical work',
    parent_task_id: null,
    is_deferred: true,
    is_ai_sorted: true,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't5',
    user_id: 'mock-user-id',
    title: 'Write API Documentation',
    description: 'Document all API endpoints with examples.',
    priority: 'medium',
    status: 'pending',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 4,
    completed_pct: 0,
    project_tag: 'FlowMind',
    ai_score: 45,
    ai_reason: 'Due in a week, manageable',
    parent_task_id: null,
    is_deferred: false,
    is_ai_sorted: false,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't6',
    user_id: 'mock-user-id',
    title: 'Setup CI/CD Pipeline',
    description: 'Configure GitHub Actions for automated deployment.',
    priority: 'medium',
    status: 'completed',
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 2,
    completed_pct: 100,
    project_tag: 'DevOps',
    ai_score: null,
    ai_reason: null,
    parent_task_id: null,
    is_deferred: false,
    is_ai_sorted: false,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_SUBTASKS = [
  { id: 'st1', task_id: 't1', user_id: 'mock-user-id', title: 'Design Users table', is_done: true, order_index: 0, created_at: new Date().toISOString() },
  { id: 'st2', task_id: 't1', user_id: 'mock-user-id', title: 'Design Tasks table', is_done: false, order_index: 1, created_at: new Date().toISOString() },
  { id: 'st3', task_id: 't1', user_id: 'mock-user-id', title: 'Design AI tables', is_done: false, order_index: 2, created_at: new Date().toISOString() },
  { id: 'st4', task_id: 't1', user_id: 'mock-user-id', title: 'Create ER Diagram', is_done: false, order_index: 3, created_at: new Date().toISOString() },
];

const today = new Date();
const getLogs = (habitId: string, completedPattern: boolean[]) =>
  completedPattern.map((completed, i) => ({
    id: `log-${habitId}-${i}`,
    habit_id: habitId,
    user_id: 'mock-user-id',
    logged_date: new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed,
    created_at: new Date().toISOString(),
  }));

export const MOCK_HABITS: Habit[] = [
  {
    id: 'h1', user_id: 'mock-user-id', name: 'Morning Reading', icon: '📚', color: 'purple',
    target_days: ['mon','tue','wed','thu','fri','sat','sun'], streak_count: 12,
    risk_level: 'high', is_active: true, order_index: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    logs: getLogs('h1', [true, true, true, true, false, true, false]),
  },
  {
    id: 'h2', user_id: 'mock-user-id', name: 'Exercise', icon: '🏃', color: 'teal',
    target_days: ['mon','tue','wed','thu','fri'], streak_count: 5,
    risk_level: 'low', is_active: true, order_index: 1,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    logs: getLogs('h2', [true, true, false, true, true, true, false]),
  },
  {
    id: 'h3', user_id: 'mock-user-id', name: 'Deep Work Session', icon: '🎯', color: 'purple',
    target_days: ['mon','tue','wed','thu','fri'], streak_count: 8,
    risk_level: 'medium', is_active: true, order_index: 2,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    logs: getLogs('h3', [true, true, true, false, true, true, false]),
  },
  {
    id: 'h4', user_id: 'mock-user-id', name: 'Sleep by 10:30pm', icon: '😴', color: 'amber',
    target_days: ['mon','tue','wed','thu','fri','sat','sun'], streak_count: 3,
    risk_level: 'medium', is_active: true, order_index: 3,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    logs: getLogs('h4', [false, true, true, true, false, false, false]),
  },
];

export const MOCK_ROUTINES: Routine[] = [
  { id: 'r1', user_id: 'mock-user-id', title: 'Morning Reading', start_time: '06:00', end_time: '06:30', color: 'purple', is_ai_inserted: false, note: 'Daily habit', recurrence: ['mon','tue','wed','thu','fri','sat','sun'], order_index: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'r2', user_id: 'mock-user-id', title: 'Exercise', start_time: '06:30', end_time: '07:30', color: 'green', is_ai_inserted: false, note: 'Cardio + strength', recurrence: ['mon','tue','wed','thu','fri'], order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'r3', user_id: 'mock-user-id', title: 'Database Schema Work', start_time: '10:00', end_time: '11:30', color: 'purple', is_ai_inserted: true, note: 'AI scheduled — critical deadline', recurrence: ['mon','tue','wed','thu','fri'], order_index: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'r4', user_id: 'mock-user-id', title: 'Team Standup', start_time: '12:00', end_time: '12:30', color: 'amber', is_ai_inserted: false, note: 'Daily sync', recurrence: ['mon','tue','wed','thu','fri'], order_index: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'r5', user_id: 'mock-user-id', title: 'Lunch Break', start_time: '13:00', end_time: '14:00', color: 'gray', is_ai_inserted: false, note: null, recurrence: ['mon','tue','wed','thu','fri'], order_index: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'r6', user_id: 'mock-user-id', title: 'Deep Work: Auth Flow', start_time: '15:00', end_time: '16:00', color: 'purple', is_ai_inserted: true, note: 'AI scheduled — blocking task', recurrence: ['mon','tue','wed','thu','fri'], order_index: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'r7', user_id: 'mock-user-id', title: 'Admin & Email', start_time: '17:00', end_time: '17:30', color: 'gray', is_ai_inserted: false, note: null, recurrence: ['mon','tue','wed','thu','fri'], order_index: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const MOCK_GOALS: Goal[] = [
  {
    id: 'g1', user_id: 'mock-user-id', title: 'Learn Data Structures & Algorithms',
    description: 'Master DSA for technical interviews and competitive programming.',
    status: 'active', target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress_pct: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    milestones: [
      { id: 'm1', goal_id: 'g1', user_id: 'mock-user-id', title: 'Arrays & Strings', order_index: 0, is_done: true, created_at: new Date().toISOString() },
      { id: 'm2', goal_id: 'g1', user_id: 'mock-user-id', title: 'Linked Lists', order_index: 1, is_done: true, created_at: new Date().toISOString() },
      { id: 'm3', goal_id: 'g1', user_id: 'mock-user-id', title: 'Stacks & Queues', order_index: 2, is_done: false, created_at: new Date().toISOString() },
      { id: 'm4', goal_id: 'g1', user_id: 'mock-user-id', title: 'Trees & BST', order_index: 3, is_done: false, created_at: new Date().toISOString() },
      { id: 'm5', goal_id: 'g1', user_id: 'mock-user-id', title: 'Graphs & BFS/DFS', order_index: 4, is_done: false, created_at: new Date().toISOString() },
      { id: 'm6', goal_id: 'g1', user_id: 'mock-user-id', title: 'Dynamic Programming', order_index: 5, is_done: false, created_at: new Date().toISOString() },
      { id: 'm7', goal_id: 'g1', user_id: 'mock-user-id', title: 'Sorting Algorithms', order_index: 6, is_done: false, created_at: new Date().toISOString() },
      { id: 'm8', goal_id: 'g1', user_id: 'mock-user-id', title: 'Mock Interview Practice', order_index: 7, is_done: false, created_at: new Date().toISOString() },
    ]
  },
  {
    id: 'g2', user_id: 'mock-user-id', title: 'Launch FlowMind MVP',
    description: 'Ship the first version of FlowMind with core AI features.',
    status: 'active', target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress_pct: 40, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    milestones: [
      { id: 'm9', goal_id: 'g2', user_id: 'mock-user-id', title: 'Database Schema', order_index: 0, is_done: true, created_at: new Date().toISOString() },
      { id: 'm10', goal_id: 'g2', user_id: 'mock-user-id', title: 'Authentication', order_index: 1, is_done: true, created_at: new Date().toISOString() },
      { id: 'm11', goal_id: 'g2', user_id: 'mock-user-id', title: 'Dashboard UI', order_index: 2, is_done: false, created_at: new Date().toISOString() },
      { id: 'm12', goal_id: 'g2', user_id: 'mock-user-id', title: 'AI Agents', order_index: 3, is_done: false, created_at: new Date().toISOString() },
      { id: 'm13', goal_id: 'g2', user_id: 'mock-user-id', title: 'Deploy to Vercel', order_index: 4, is_done: false, created_at: new Date().toISOString() },
    ]
  },
];

export const MOCK_AI_ACTIONS: AIAction[] = [
  {
    id: 'a1', user_id: 'mock-user-id', action_type: 'DEADLINE_RISK', step_number: 1,
    title: 'Deadline Risk Detected',
    reason: 'Database Schema requires 5 more hours before Friday. At current pace, you will miss the deadline.',
    impact: 'Deadline risk: 78% without intervention',
    metadata: { task_id: 't1', hours_remaining: 5 },
    acknowledged: false, created_at: new Date().toISOString(),
  },
  {
    id: 'a2', user_id: 'mock-user-id', action_type: 'SCHEDULE_BLOCK', step_number: 2,
    title: 'Focus Blocks Created',
    reason: 'Scheduled 2 deep work blocks during your peak focus window (9AM–12PM).',
    impact: 'Adds 2.5 hours of focused work today',
    metadata: { blocks: [{ start: '10:00', end: '11:30' }, { start: '15:00', end: '16:00' }] },
    acknowledged: false, created_at: new Date().toISOString(),
  },
  {
    id: 'a3', user_id: 'mock-user-id', action_type: 'DEFER_TASK', step_number: 3,
    title: 'Low-Priority Task Deferred',
    reason: 'Research UI Colors deferred by 7 days to protect critical Database Schema work.',
    impact: 'Frees 1 hour of focus capacity today',
    metadata: { task_id: 't4', deferred_by_days: 7 },
    acknowledged: false, created_at: new Date().toISOString(),
  },
  {
    id: 'a4', user_id: 'mock-user-id', action_type: 'REMINDER_SET', step_number: 4,
    title: 'Reminder Chain Configured',
    reason: 'Context-aware reminders set: preparation (9:45AM), start (10:00AM), progress check (11:00AM).',
    impact: 'Keeps you on track during the focus block',
    metadata: { task_id: 't1', reminders: ['09:45', '10:00', '11:00'] },
    acknowledged: false, created_at: new Date().toISOString(),
  },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'e1', user_id: 'mock-user-id', external_id: null, title: 'Database Schema Work',
    description: 'AI scheduled deep work block', start_time: new Date().toISOString().split('T')[0] + 'T10:00:00',
    end_time: new Date().toISOString().split('T')[0] + 'T11:30:00', source: 'flowmind',
    is_ai_scheduled: true, color_code: 'purple', task_id: 't1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'e2', user_id: 'mock-user-id', external_id: null, title: 'Team Standup',
    description: 'Daily team sync', start_time: new Date().toISOString().split('T')[0] + 'T12:00:00',
    end_time: new Date().toISOString().split('T')[0] + 'T12:30:00', source: 'google_personal',
    is_ai_scheduled: false, color_code: 'amber', task_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'e3', user_id: 'mock-user-id', external_id: null, title: 'Auth Flow Deep Work',
    description: 'AI scheduled focus block', start_time: new Date().toISOString().split('T')[0] + 'T15:00:00',
    end_time: new Date().toISOString().split('T')[0] + 'T16:00:00', source: 'flowmind',
    is_ai_scheduled: true, color_code: 'purple', task_id: 't2', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
];

export const MOCK_DAILY_BRIEF = {
  focus_score: 82,
  top_task: 'Finish Database Schema',
  at_risk_tasks: 1,
  today_plan: MOCK_CALENDAR_EVENTS,
  recommendation: 'Finish Database Schema before noon to reduce deadline risk from 78% to 12%.',
  greeting: `Good morning, Vinay 👋`,
  reserved_blocks: ['10:00–11:30', '15:00–16:00'],
};

export const MOCK_AI_INSIGHT: AIInsight = {
  summary: 'Three tasks are in your queue. One is at critical risk.',
  actions_taken: [
    'Scheduled 2 focus blocks (10:00–11:30 and 15:00–16:00)',
    'Deferred Research UI Colors by 7 days',
  ],
  recommendation: 'Start with Database Schema before noon.',
  at_risk_tasks: [
    {
      task_id: 't1',
      title: 'Finish Database Schema',
      priority: 'critical',
      score: 92,
      reason: 'Deadline in 2 days and only 20% complete',
      estimated_hours_remaining: 5,
    }
  ],
  deferred_tasks: ['Research UI colors'],
};

export const MOCK_WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    step: 1, action_type: 'DEADLINE_RISK',
    title: 'Risk Detected',
    explanation: 'Database Schema requires 5 more hours before Friday. At your current completion rate of 20%, you will miss the deadline without intervention.',
    impact: 'Deadline risk: 78% without action',
    chips: ['View task', 'See details', 'Override'],
  },
  {
    step: 2, action_type: 'SCHEDULE_BLOCK',
    title: 'Focus Blocks Created',
    explanation: 'I scheduled two deep work blocks during your detected peak focus hours (9AM–12PM and 3PM–4PM), avoiding your existing standup.',
    impact: 'Adds 2.5 hours of focused work — reduces risk to 12%',
    chips: ['Show schedule', 'Reschedule', 'View calendar', 'Undo'],
  },
  {
    step: 3, action_type: 'DEFER_TASK',
    title: 'Tasks Deferred',
    explanation: 'Research UI Colors was deprioritized and moved to next week. It has no immediate dependencies and low urgency.',
    impact: 'Frees 1 hour of focus capacity today',
    chips: ['View deferred', 'Undo deferral', 'Override'],
  },
  {
    step: 4, action_type: 'REMINDER_SET',
    title: 'Reminder Chain Set',
    explanation: 'Context-aware reminders configured: preparation nudge at 9:45AM, start reminder at 10:00AM, and a progress check at 11:00AM.',
    impact: 'Keeps you on track during the focus block',
    chips: ['Edit reminders', 'Disable', 'View all'],
  },
];

export const MOCK_METRICS = {
  focus_score: 82,
  focus_trend: +5,
  tasks_done: 1,
  tasks_total: 5,
  tasks_at_risk: 1,
  streak_days: 12,
};

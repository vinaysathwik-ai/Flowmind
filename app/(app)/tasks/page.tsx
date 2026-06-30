'use client';

import { useState, useEffect } from 'react';
import { MOCK_TASKS, MOCK_SUBTASKS } from '@/lib/mock-data';
import TaskRow from '@/components/tasks/TaskRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Filter } from 'lucide-react';
import type { Task, Priority } from '@/types';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase');
};

export default function TasksPage() {
  const mockTasks = MOCK_TASKS.map(t => {
    if (t.id === 't1') return { ...t, subtasks: MOCK_SUBTASKS };
    return t;
  });

  // Start empty in live mode; use mock only when not configured
  const [tasks, setTasks] = useState<Task[]>(isSupabaseConfigured() ? [] : mockTasks);
  const [filter, setFilter] = useState<'all' | 'today'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string>('mock-user');
  const [loading, setLoading] = useState(true);

  // Add task state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newEstHours, setNewEstHours] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchTasks = async () => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      setUserId(user.id);

      const { data: dbTasks, error: tasksErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('ai_score', { ascending: false, nullsFirst: false });

      if (tasksErr) throw tasksErr;

      const { data: dbSubtasks } = await supabase
        .from('subtasks')
        .select('*')
        .eq('user_id', user.id);

      const mappedTasks = (dbTasks || []).map(t => ({
        ...t,
        subtasks: (dbSubtasks || []).filter(st => st.task_id === t.id),
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error loading tasks from database:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (id: string) => {
    // Optimistic UI state toggle
    let targetTask: Task | undefined;
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          targetTask = {
            ...t,
            status: nextStatus,
            completed_pct: nextStatus === 'completed' ? 100 : 0,
            completed_at: nextStatus === 'completed' ? new Date().toISOString() : null,
          };
          return targetTask;
        }
        return t;
      })
    );

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your_supabase') && targetTask) {
        const supabase = createClient();
        await supabase
          .from('tasks')
          .update({
            status: targetTask.status,
            completed_pct: targetTask.completed_pct,
            completed_at: targetTask.completed_at,
          })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Failed to toggle task in Supabase:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your_supabase')) {
        const supabase = createClient();
        await supabase.from('tasks').delete().eq('id', id);
      }
    } catch (error) {
      console.error('Failed to delete task from Supabase:', error);
    }
  };

  const handleEditTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your_supabase')) {
        const supabase = createClient();
        await supabase
          .from('tasks')
          .update({
            title: updates.title,
            priority: updates.priority,
            due_date: updates.due_date,
          })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Failed to update task in Supabase:', error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tempId = `task-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      user_id: userId,
      title: newTitle,
      description: null,
      priority: newPriority,
      status: 'pending',
      due_date: newDueDate ? new Date(newDueDate).toISOString() : null,
      estimated_hours: newEstHours ? parseFloat(newEstHours) : null,
      completed_pct: 0,
      project_tag: 'Inbox',
      ai_score: null,
      ai_reason: null,
      parent_task_id: null,
      is_deferred: false,
      is_ai_sorted: false,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic insert
    setTasks(prev => [newTask, ...prev]);

    setNewTitle('');
    setNewPriority('medium');
    setNewEstHours('');
    setNewDueDate('');
    setIsOpen(false);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your_supabase')) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            title: newTask.title,
            priority: newTask.priority,
            status: newTask.status,
            due_date: newTask.due_date,
            estimated_hours: newTask.estimated_hours,
            project_tag: newTask.project_tag,
            completed_pct: 0,
            is_deferred: false,
            is_ai_sorted: false,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          // Replace tempId with actual UUID from database
          setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: data.id } : t));
        }
      }
    } catch (error) {
      console.error('Failed to add task to database:', error);
    }
  };

  // Filtering logic
  const filteredTasks = tasks.filter(task => {
    // Search match
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Priority match
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    // Day match
    if (filter === 'today') {
      if (task.status === 'completed') return false;
      // Show if critical, high, or due today
      if (task.priority !== 'critical' && task.priority !== 'high' && !task.due_date) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-6xl space-y-6 fade-in">
      <h1 className="sr-only">Tasks</h1>

      {/* Page Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/tasks" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] font-semibold">
          All Tasks
        </Link>
        <Link href="/tasks/calendar" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Calendar
        </Link>
        <Link href="/tasks/deadlines" className="px-4 py-2 text-xs font-medium border-b-2 -mb-[2px] transition-all border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          Upcoming Deadlines
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Task Overview</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Manage and view your priorities, auto-sorted by the autonomous planning agent.
          </p>
        </div>

        {/* Add task button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="flex items-center justify-center gap-1.5 text-xs bg-[var(--color-brand-purple)] hover:bg-[var(--color-purple-dark)] text-white h-9 px-4 rounded-lg select-none pointer-events-auto">
            <Plus size={16} />
            Add Task
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white p-6 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Create New Task
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium">Task Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Finish landing page layout"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-xs font-medium">Priority</Label>
                  <Select value={newPriority} onValueChange={(val) => setNewPriority((val as Priority) ?? 'medium')}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hours" className="text-xs font-medium">Est. Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 2.5"
                    value={newEstHours}
                    onChange={e => setNewEstHours(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="due" className="text-xs font-medium">Due Date</Label>
                <Input
                  id="due"
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="text-xs h-9">
                  Cancel
                </Button>
                <Button type="submit" className="text-xs h-9 bg-[var(--color-brand-purple)] hover:bg-[var(--color-purple-dark)] text-white">
                  Create Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Toggle all vs today */}
        <div className="flex border rounded-lg p-0.5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-[var(--color-purple-light)] text-[var(--color-brand-purple)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === 'today'
                ? 'bg-[var(--color-purple-light)] text-[var(--color-brand-purple)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Today's Priorities
          </button>
        </div>

        {/* Search and Priority select */}
        <div className="flex gap-2 items-center flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--color-text-muted)]" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val ?? 'all')}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <div className="flex items-center gap-1">
                <Filter size={12} className="text-[var(--color-text-muted)]" />
                <SelectValue placeholder="Priority" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="deferred">Deferred</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task list container */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card-base text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-sm">No tasks found matching your filters.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredTasks.map((task, idx) => (
              <TaskRow
                key={task.id}
                task={task}
                index={idx}
                onToggle={handleToggle}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

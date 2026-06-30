import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

// Configure VAPID once
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL ?? 'admin@flowmind.app'}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// GET /api/notifications/check-deadlines
// Checks for at-risk tasks and sends push notifications to affected users
// This should be called via a Vercel Cron Job (free on Vercel hobby plan)
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorised calls
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  // Find tasks due in the next 24 hours that are not completed
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const { data: atRiskTasks } = await supabase
    .from('tasks')
    .select('id, title, due_date, priority, user_id')
    .lte('due_date', in24h)
    .gte('due_date', now.toISOString())
    .in('status', ['pending', 'in_progress'])
    .in('priority', ['critical', 'high', 'medium']);

  if (!atRiskTasks?.length) {
    return NextResponse.json({ sent: 0, message: 'No at-risk tasks found.' });
  }

  // Group tasks by user
  const byUser: Record<string, typeof atRiskTasks> = {};
  for (const task of atRiskTasks) {
    if (!byUser[task.user_id]) byUser[task.user_id] = [];
    byUser[task.user_id].push(task);
  }

  let sentCount = 0;
  const errors: string[] = [];

  for (const [userId, tasks] of Object.entries(byUser)) {
    // Fetch this user's push subscriptions
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription_json')
      .eq('user_id', userId);

    if (!subs?.length) continue;

    const taskWord = tasks.length === 1 ? 'task' : 'tasks';
    const taskList = tasks.slice(0, 3).map(t => `• ${t.title}`).join('\n');
    const payload = JSON.stringify({
      title: `⚠️ ${tasks.length} ${taskWord} due soon – FlowMind`,
      body: taskList + (tasks.length > 3 ? `\n+ ${tasks.length - 3} more` : ''),
      tag: 'deadline-alert',
      requireInteraction: true,
      url: '/tasks',
    });

    for (const sub of subs) {
      try {
        const subscription = JSON.parse(sub.subscription_json as string);
        await webpush.sendNotification(subscription, payload);
        sentCount++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(msg);
        // If the subscription is expired/invalid, remove it
        if (msg.includes('410') || msg.includes('404')) {
          const parsed = JSON.parse(sub.subscription_json as string);
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', parsed.endpoint);
        }
      }
    }
  }

  return NextResponse.json({ sent: sentCount, errors });
}

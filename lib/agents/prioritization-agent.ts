// lib/agents/prioritization-agent.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Task, Priority } from '@/types';

export interface PrioritizationResult {
  task_id: string;
  title: string;
  priority: Priority;
  score: number;
  reason: string;
}

export async function runPrioritizationAgent(
  tasks: Task[],
  currentDateStr: string = new Date().toISOString()
): Promise<PrioritizationResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Gracefully fallback to mock prioritization
    return tasks.map(t => ({
      task_id: t.id,
      title: t.title,
      priority: t.priority,
      score: t.ai_score ?? 50,
      reason: t.ai_reason ?? 'Standard prioritization sorting',
    })).sort((a, b) => b.score - a.score);
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are the FlowMind Prioritization Agent.
Analyze the following tasks and assign a custom urgency score (0-100) and priority category to each task, with a brief reason.

Current Time: ${currentDateStr}

Tasks:
${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, due_date: t.due_date, completed_pct: t.completed_pct })), null, 2)}

Respond ONLY with a JSON array:
[{"task_id":"string","title":"string","priority":"critical|high|medium|low|deferred","score":number,"reason":"string"}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as PrioritizationResult[];
  } catch (error) {
    console.error('Prioritization Agent Error:', error);
    return tasks.map(t => ({
      task_id: t.id,
      title: t.title,
      priority: t.priority,
      score: t.ai_score ?? 50,
      reason: 'Score computed by fallback heuristics.',
    })).sort((a, b) => b.score - a.score);
  }
}

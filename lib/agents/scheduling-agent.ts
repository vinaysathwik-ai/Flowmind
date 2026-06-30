// lib/agents/scheduling-agent.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Task, CalendarEvent, ColorCode } from '@/types';

export interface SchedulingOutput {
  scheduled_blocks: {
    title: string;
    start_time: string;
    end_time: string;
    color_code: ColorCode;
    task_id?: string;
  }[];
  deferred_task_ids: string[];
}

export async function runSchedulingAgent(
  atRiskTasks: Task[],
  existingEvents: CalendarEvent[],
  peakStart: string = '09:00',
  peakEnd: string = '12:00'
): Promise<SchedulingOutput> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const today = new Date().toISOString().split('T')[0];
    return {
      scheduled_blocks: [
        { title: 'Database Schema Work', start_time: `${today}T10:00:00`, end_time: `${today}T11:30:00`, color_code: 'purple', task_id: 't1' },
        { title: 'Auth Flow Deep Work', start_time: `${today}T15:00:00`, end_time: `${today}T16:00:00`, color_code: 'purple', task_id: 't2' }
      ],
      deferred_task_ids: ['t4'],
    };
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `You are the FlowMind Scheduling Agent.
Insert deep focus blocks for at-risk tasks during peak hours (${peakStart}–${peakEnd}), avoiding conflicts with existing meetings.

At-Risk Tasks: ${JSON.stringify(atRiskTasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, estimated_hours: t.estimated_hours })))}
Existing Events: ${JSON.stringify(existingEvents.map(e => ({ title: e.title, start: e.start_time, end: e.end_time })))}

Respond ONLY with JSON:
{"scheduled_blocks":[{"title":"string","start_time":"YYYY-MM-DDTHH:MM:SS","end_time":"YYYY-MM-DDTHH:MM:SS","color_code":"purple","task_id":"string"}],"deferred_task_ids":["string"]}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text) as SchedulingOutput;
  } catch (error) {
    console.error('Scheduling Agent Error:', error);
    return { scheduled_blocks: [], deferred_task_ids: [] };
  }
}

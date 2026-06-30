// lib/agents/habit-agent.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { RiskLevel } from '@/types';

export interface HabitAnalysisResult {
  risk_level: RiskLevel;
  coach_message: string;
}

export async function runHabitAgent(
  habitName: string,
  streakCount: number,
  logs: { date: string; completed: boolean }[]
): Promise<HabitAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const misses = logs.filter(l => !l.completed).length;
    return {
      risk_level: misses > 2 ? 'high' : misses > 1 ? 'medium' : 'low',
      coach_message: misses > 2
        ? `You've missed "${habitName}" a few times recently. Try completing it earlier in the day!`
        : `Great streak of ${streakCount} days! Keep the momentum going.`,
    };
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are the FlowMind Habit Coach. Analyze compliance for habit: "${habitName}".
Streak: ${streakCount} days. Logs: ${JSON.stringify(logs)}

Respond ONLY with JSON:
{"risk_level":"low|medium|high","coach_message":"string"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text) as HabitAnalysisResult;
  } catch (error) {
    console.error('Habit Agent Error:', error);
    return {
      risk_level: 'medium',
      coach_message: 'Keep going! Regular check-ins help solidify habit patterns.',
    };
  }
}

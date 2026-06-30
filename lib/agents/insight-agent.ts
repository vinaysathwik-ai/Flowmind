// lib/agents/insight-agent.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface InsightOutput {
  summary: string;
  actions_taken: string[];
  recommendation: string;
}

export async function runInsightAgent(
  userName: string,
  atRiskCount: number,
  completedCount: number,
  prioritizationSummary: string
): Promise<InsightOutput> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      summary: `${atRiskCount} task${atRiskCount !== 1 ? 's are' : ' is'} at risk.`,
      actions_taken: ['Scheduled 2 focus blocks', 'Deferred 1 low-priority task'],
      recommendation: 'Start with Database Schema before noon.',
    };
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `You are the FlowMind Insight Agent. Write a concise daily overview for ${userName}.
At-risk tasks: ${atRiskCount}. Completed: ${completedCount}. Notes: ${prioritizationSummary}

Respond ONLY with JSON:
{"summary":"string","actions_taken":["string"],"recommendation":"string"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text) as InsightOutput;
  } catch (error) {
    console.error('Insight Agent Error:', error);
    return {
      summary: 'Workload balanced, keep focus active.',
      actions_taken: ['Monitored active tasks'],
      recommendation: 'Complete outstanding priority items.',
    };
  }
}

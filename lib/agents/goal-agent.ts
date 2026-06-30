// lib/agents/goal-agent.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface MilestoneResult {
  title: string;
  order_index: number;
}

export async function runGoalAgent(
  goalTitle: string,
  goalDescription: string = ''
): Promise<MilestoneResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return [
      { title: 'Define project scope & requirements', order_index: 0 },
      { title: 'Create interactive high-fidelity wireframes', order_index: 1 },
      { title: 'Implement core database & schema models', order_index: 2 },
      { title: 'Build clean and optimized API endpoints', order_index: 3 },
      { title: 'Perform QA verification & deploy live MVP', order_index: 4 },
    ];
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Break down this goal into 4-6 sequential milestones:
Goal: ${goalTitle}
Description: ${goalDescription}

Respond ONLY with a JSON array:
[{"title":"string","order_index":number}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text) as MilestoneResult[];
  } catch (error) {
    console.error('Goal Agent Error:', error);
    return [
      { title: 'Identify core task blocks', order_index: 0 },
      { title: 'Perform sequential execution steps', order_index: 1 },
    ];
  }
}

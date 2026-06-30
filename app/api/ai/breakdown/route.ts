import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const taskTitle = body.title || 'Work Task';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        subtasks: [
          { title: 'Research requirements & reference work', order_index: 0 },
          { title: 'Draft initial execution outline', order_index: 1 },
          { title: 'Develop core functional implementation', order_index: 2 },
          { title: 'Test edge cases & verify behavior', order_index: 3 }
        ]
      });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Break down the task "${taskTitle}" into 3-5 clear, actionable subtasks.
Respond ONLY with a JSON array:
[{"title":"string","order_index":number}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const subtasks = JSON.parse(text);
    return NextResponse.json({ success: true, subtasks });
  } catch (error) {
    console.error('API Breakdown Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { form, topic, paperType, difficulty } = await request.json();

    const prompt = `
      Generate 1 SPM Modern Mathematics (Malaysian KSSM standard) question for:
      - Form: ${form}
      - Topic: ${topic}
      - Paper Type: ${paperType} (Paper 1 = Multiple Choice, Paper 2 = Structured)
      - Difficulty: ${difficulty}

      Strict Guidelines:
      - Strictly follow Modern Mathematics syllabus (DO NOT output Additional Mathematics content).
      - Use standard LaTeX math formatting using double backslashes for special symbols (e.g., \\\\frac{a}{b}, x^2, \\\\theta).
      - If Paper 1, provide 4 options ("A", "B", "C", "D").
      - If Paper 2, options should be null, and provide structured marking steps in markingScheme.

      Respond ONLY with valid JSON matching this schema:
      {
        "questionText": "Question text here with LaTeX like \\\\(x^2 + 2x = 0\\\\)",
        "type": "${paperType}",
        "options": ["A: $x = 1$", "B: $x = 2$", "C: $x = 3$", "D: $x = 4$"],
        "correctAnswer": "Option or final value",
        "markingScheme": [
          "Step 1: Expand equation (K1)",
          "Step 2: Solve for x = 2 (N1)"
        ],
        "explanation": "Step-by-step solution breakdown."
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an SPM Modern Mathematics exam teacher. Output valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const data = JSON.parse(response.choices[0].message.content);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to generate question.' }, { status: 500 });
  }
}

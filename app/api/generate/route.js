import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const { form, topic, paperType, difficulty } = await request.json();

    const prompt = `
      You are an SPM Modern Mathematics exam teacher (Malaysian KSSM standard).
      Generate 1 question based on:
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

    // Updated to currently supported active model string
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to generate question.' }, { status: 500 });
  }
}
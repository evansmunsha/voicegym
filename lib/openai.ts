// lib/openai.ts
// Utility for AI-powered pronunciation feedback

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getPronunciationFeedbackAI(expected: string, userText: string): Promise<{
  phonemeErrors: any;
  aiSuggestions: any;
  aiAnalysis: string;
  feedback: string;
  score: number;
}> {
  // Prompt for detailed phoneme-level feedback
  const prompt = `You are an English pronunciation coach. Compare the expected sentence and the user's spoken text. Identify specific sound (phoneme) mistakes (e.g., R/L/TH/S/SH/V/F), give a score (0-100), and provide human-like coaching. Output JSON with: phonemeErrors (array), aiSuggestions (array), aiAnalysis (string), feedback (string summary), score (number).\nExpected: ${expected}\nUser: ${userText}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: "You are an expert English pronunciation coach." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: 512,
    temperature: 0.2,
  });

  // Parse and return JSON
  try {
    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      phonemeErrors: result.phonemeErrors || [],
      aiSuggestions: result.aiSuggestions || [],
      aiAnalysis: result.aiAnalysis || "",
      feedback: result.feedback || "",
      score: typeof result.score === "number" ? result.score : 0,
    };
  } catch (e) {
    return {
      phonemeErrors: [],
      aiSuggestions: [],
      aiAnalysis: "AI response could not be parsed.",
      feedback: "AI feedback unavailable.",
      score: 0,
    };
  }
}

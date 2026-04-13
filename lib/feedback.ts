//feedback.ts

/**
 * AI Feedback Utility
 * Handles OpenAI API calls for pronunciation feedback
 */

export interface FeedbackResponse {
  mistakes: string[];
  corrections: string[];
  explanation: string;
  score: number; // 0-100
  suggestions: string[];
  phonemeErrors?: any[]; // AI: Detected phoneme-level errors
  aiSuggestions?: any[]; // AI: Suggestions for improvement
  aiAnalysis?: string;   // AI: Full analysis text
  feedback?: string;     // AI: Short summary
}

/**
 * Get pronunciation feedback from OpenAI
 */
export async function getPronunciationFeedback(
  expectedSentence: string,
  userSpeech: string
): Promise<FeedbackResponse> {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expectedSentence,
        userSpeech,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get feedback:", error);
    throw error;
  }
}

/**
 * Stream pronunciation feedback from the server.
 * Calls POST /api/feedback/stream and parses newline-delimited JSON messages.
 */
export async function streamPronunciationFeedback(
  expectedSentence: string,
  userSpeech: string,
  onMessage?: (msg: any) => void
): Promise<FeedbackResponse> {
  try {
    const res = await fetch("/api/feedback/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expectedSentence, userSpeech }),
    });

    if (!res.ok) {
      throw new Error(`Stream API error: ${res.status}`);
    }

    if (!res.body) {
      throw new Error("Empty response body from stream");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let final: any = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          onMessage?.(obj);
          if (obj.type === "result") {
            final = obj.data;
          }
        } catch (e) {
          // ignore parse errors for partial chunks
        }
      }
    }

    if (buffer.trim()) {
      try {
        const obj = JSON.parse(buffer);
        onMessage?.(obj);
        if (obj.type === "result") final = obj.data;
      } catch (e) {
        // ignore
      }
    }

    if (!final) throw new Error("No result from feedback stream");
    return final as FeedbackResponse;
  } catch (error) {
    console.error("streamPronunciationFeedback failed:", error);
    throw error;
  }
}

/**
 * Generate score based on text similarity
 * Simple heuristic: count matching words
 */
export function generateBasicScore(expected: string, userSpeech: string): number {
  const expectedWords = expected.toLowerCase().split(/\s+/);
  const userWords = userSpeech.toLowerCase().split(/\s+/);

  let matches = 0;
  for (const word of expectedWords) {
    if (userWords.includes(word)) {
      matches++;
    }
  }

  return Math.round((matches / expectedWords.length) * 100);
}

/**
 * Identify common pronunciation mistakes
 */
export function identifyCommonMistakes(expected: string, userSpeech: string): string[] {
  const mistakes: string[] = [];

  // Check for R/L confusion
  const rCount = (userSpeech.match(/r/gi) || []).length;
  const lCount = (userSpeech.match(/l/gi) || []).length;
  const expectedR = (expected.match(/r/gi) || []).length;
  const expectedL = (expected.match(/l/gi) || []).length;

  if (rCount > expectedR && lCount < expectedL) {
    mistakes.push("Possible R/L confusion - you may be pronouncing 'L' as 'R'");
  }
  if (lCount > expectedL && rCount < expectedR) {
    mistakes.push("Possible R/L confusion - you may be pronouncing 'R' as 'L'");
  }

  // Check for common words
  const expectedWords = expected.toLowerCase().split(/\s+/);
  const userWords = userSpeech.toLowerCase().split(/\s+/);

  for (let i = 0; i < Math.min(expectedWords.length, userWords.length); i++) {
    if (expectedWords[i] !== userWords[i]) {
      mistakes.push(`Word "${expectedWords[i]}" was pronounced as "${userWords[i]}"`);
    }
  }

  return mistakes;
}

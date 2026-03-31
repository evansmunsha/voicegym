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

/**
 * Practice Service
 * Handles saving practice sessions and retrieving user history
 */

export interface SavePracticeRequest {
  userId: string;
  sentence: string;
  userText: string;
  feedback?: string;
  score?: number;
}

export interface SavePracticeResponse {
  success: boolean;
  session: {
    id: string;
    userId: string;
    sentence: string;
    userText: string;
    feedback: string;
    score: number;
    createdAt: string;
  };
  message: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  streak: number;
  lastPracticeDate: string | null;
  totalSessions: number;
}

/**
 * Save a practice session to the database
 */
export async function savePracticeSession(
  data: SavePracticeRequest
): Promise<SavePracticeResponse> {
  try {
    const response = await fetch("/api/practice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save practice session");
    }

    return await response.json();
  } catch (error) {
    console.error("Save practice error:", error);
    throw error;
  }
}

/**
 * Get user's practice sessions and progress
 */
export async function getUserPracticeHistory(
  userId: string,
  limit: number = 10
): Promise<{
  sessions: any[];
  progress: UserProgress | null;
}> {
  try {
    const response = await fetch(
      `/api/practice?userId=${userId}&limit=${limit}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to retrieve practice history");
    }

    return await response.json();
  } catch (error) {
    console.error("Get practice history error:", error);
    throw error;
  }
}

/**
 * Generate simple feedback without AI
 * Used for quick feedback before API integration
 */
export function generateSimpleFeedback(
  sentence: string,
  userText: string
): {
  feedback: string;
  score: number;
} {
  const sentenceWords = sentence.toLowerCase().split(/\s+/);
  const userWords = userText.toLowerCase().split(/\s+/);

  // Calculate word match percentage
  let matches = 0;
  for (const word of sentenceWords) {
    if (userWords.includes(word)) {
      matches++;
    }
  }

  const score = Math.round((matches / sentenceWords.length) * 100);

  // Generate feedback
  let feedback = "";

  if (score === 100) {
    feedback =
      "Perfect! 🎉 You pronounced it exactly right. Excellent work!";
  } else if (score >= 85) {
    feedback = "Very good! 👍 Just minor adjustments needed.";
  } else if (score >= 70) {
    feedback = "Good effort! 💪 Keep practicing, you're getting there.";
  } else if (score >= 50) {
    feedback = "You got some of it! 🎯 Try again, focusing on each word.";
  } else {
    feedback = "Keep trying! 🚀 Listen to the sample again and practice.";
  }

  // Check for common R/L issues
  if (sentence.includes("r") || sentence.includes("l")) {
    const userHasMoreR = (userText.match(/r/gi) || []).length >
      (sentence.match(/r/gi) || []).length * 1.5;
    const userHasMoreL = (userText.match(/l/gi) || []).length >
      (sentence.match(/l/gi) || []).length * 1.5;

    if (userHasMoreR || userHasMoreL) {
      feedback += " | Watch out for R/L confusion! 🔴🔵";
    }
  }

  return { feedback, score };
}

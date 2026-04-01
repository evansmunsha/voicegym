import { NextResponse } from "next/server";

/**
 * POST /api/feedback
 * Generates pronunciation feedback using basic heuristics
 * (OpenAI integration can be added later when API key is configured)
 */
export async function POST(request: Request) {
  try {
    const { expectedSentence, userSpeech } = await request.json();

    if (!expectedSentence || !userSpeech) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For now, generate feedback using heuristics
    const feedback = generateFeedback(expectedSentence, userSpeech);

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}

/**
 * Generate basic feedback based on text comparison
 * This is a placeholder for OpenAI integration
 */
function generateFeedback(
  expectedSentence: string,
  userSpeech: string
): {
  mistakes: string[];
  corrections: string[];
  explanation: string;
  score: number;
  suggestions: string[];
} {
  const expected = expectedSentence.toLowerCase().trim();
  const user = userSpeech.toLowerCase().trim();

  // Calculate similarity score
  const score = calculateSimilarity(expected, user);

  // Identify mistakes only when there's actual difference
  const mistakes: string[] = [];
  const corrections: string[] = [];

  // Only analyze for issues if score is not perfect
  if (score < 100) {
    const expectedWords = expected.split(/\s+/);
    const userWords = user.split(/\s+/);

    // Check for missing or extra words
    if (userWords.length < expectedWords.length) {
      mistakes.push(
        `You skipped or slurred ${expectedWords.length - userWords.length} word(s)`
      );
    } else if (userWords.length > expectedWords.length) {
      mistakes.push(
        `You added ${userWords.length - expectedWords.length} extra word(s)`
      );
    }

    // Check for word-by-word pronunciation differences
    for (let i = 0; i < Math.min(expectedWords.length, userWords.length); i++) {
      if (expectedWords[i] !== userWords[i]) {
        // Only flag significant differences
        if (
          !expectedWords[i].startsWith(userWords[i]) &&
          !userWords[i].startsWith(expectedWords[i])
        ) {
          mistakes.push(
            `Word "${expectedWords[i]}" was pronounced as "${userWords[i]}"`
          );
          corrections.push(`Try pronouncing "${expectedWords[i]}" more carefully`);
        }
      }
    }
  }

  // Generate explanation
  let explanation = "";
  if (score === 100) {
    explanation = "Perfect! 🎉 Your pronunciation is excellent! You matched the native speaker exactly. Outstanding work!";
  } else if (score >= 90) {
    explanation =
      "Excellent! Your pronunciation is very close to the native speaker. Just a few small adjustments needed!";
  } else if (score >= 80) {
    explanation =
      "Very good! You got most of it right. Focus on the words marked above to improve further.";
  } else if (score >= 70) {
    explanation =
      "Good job! You're on the right track. Work on the specific words that need adjustment and try again.";
  } else if (score >= 60) {
    explanation =
      "You're making progress! Pay attention to the words marked above and practice them slowly.";
  } else {
    explanation =
      "Keep practicing! This is challenging, but with repetition you'll improve. Try to pronounce each word slowly and clearly.";
  }

  // Generate suggestions
  const suggestions: string[] = [];

  if (score === 100) {
    suggestions.push("🏆 Perfect pronunciation! Try a more challenging sentence!");
    suggestions.push("Consider trying the R vs L lesson for advanced practice");
  } else if (score >= 80) {
    suggestions.push("You're ready for the next practice sentence!");
    suggestions.push("Try the R vs L lesson for targeted pronunciation practice");
  } else if (score >= 60) {
    suggestions.push("🔴 Work on R sound: Roll your tongue slightly back and round your lips");
    suggestions.push("🔵 Work on L sound: Place your tongue against the upper teeth ridge");
    suggestions.push("Try recording the same sentence 3-5 times to track improvement");
  } else {
    suggestions.push("Slow down and enunciate each word clearly");
    suggestions.push("Listen to native speakers pronounce similar words");
    suggestions.push("Record yourself and compare with the original");
  }

  // If no mistakes found (perfect or near-perfect), indicate that
  if (mistakes.length === 0 && score < 100) {
    mistakes.push("Just minor pronunciation adjustments - you're very close!");
  } else if (mistakes.length === 0 && score === 100) {
    mistakes.push("✅ No pronunciation issues - perfect match!");
  }

  return {
    mistakes,
    corrections,
    explanation,
    score,
    suggestions,
  };
}

/**
 * Calculate similarity between two strings (0-100)
 * Uses Levenshtein distance concept
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);

  let matches = 0;
  for (let i = 0; i < Math.min(words1.length, words2.length); i++) {
    if (words1[i] === words2[i]) {
      matches++;
    } else if (
      words1[i].includes(words2[i]) ||
      words2[i].includes(words1[i])
    ) {
      matches += 0.5;
    }
  }

  const total = Math.max(words1.length, words2.length);
  return Math.round((matches / total) * 100);
}

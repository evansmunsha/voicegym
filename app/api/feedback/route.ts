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

  // Identify mistakes
  const mistakes: string[] = [];
  const corrections: string[] = [];

  // Check for R/L confusion - the most common English pronunciation issue
  const userRCount = (user.match(/\br\b/g) || []).length;
  const userLCount = (user.match(/\bl\b/g) || []).length;
  const expectedRCount = (expected.match(/\br\b/g) || []).length;
  const expectedLCount = (expected.match(/\bl\b/g) || []).length;

  // Detect R/L mixture in words
  const rWords = expected.match(/\b\w*r\w*\b/gi) || [];
  const lWords = expected.match(/\b\w*l\w*\b/gi) || [];
  const userRWords = user.match(/\b\w*r\w*\b/gi) || [];
  const userLWords = user.match(/\b\w*l\w*\b/gi) || [];

  // Check if user swapped R and L
  let hasRLConfusion = false;
  for (const word of rWords) {
    const rInL = userLWords.some((w) => w.toLowerCase().includes("r"));
    if (rInL) {
      mistakes.push(
        `"${word}" contains 'R' sound - you may have pronounced it with 'L' instead`
      );
      corrections.push(
        `Practice the R sound: Roll your tongue slightly back and round your lips for "${word}"`
      );
      hasRLConfusion = true;
    }
  }

  for (const word of lWords) {
    const lInR = userRWords.some((w) => w.toLowerCase().includes("l"));
    if (lInR) {
      mistakes.push(
        `"${word}" contains 'L' sound - you may have pronounced it with 'R' instead`
      );
      corrections.push(
        `Practice the L sound: Place your tongue against the upper teeth ridge for "${word}"`
      );
      hasRLConfusion = true;
    }
  }

  if (userRCount > expectedRCount * 1.2) {
    mistakes.push(
      "You used more 'R' sounds than expected. You might be confusing R and L."
    );
  } else if (userLCount > expectedLCount * 1.2) {
    mistakes.push(
      "You used more 'L' sounds than expected. You might be confusing L and R."
    );
  }

  // Check for missing or extra words
  const expectedWords = expected.split(/\s+/);
  const userWords = user.split(/\s+/);

  if (userWords.length < expectedWords.length) {
    mistakes.push(
      `You skipped or slurred ${expectedWords.length - userWords.length} word(s)`
    );
  } else if (userWords.length > expectedWords.length) {
    mistakes.push(
      `You added ${userWords.length - expectedWords.length} extra word(s)`
    );
  }

  // Check for word-by-word pronunciation
  for (let i = 0; i < Math.min(expectedWords.length, userWords.length); i++) {
    if (expectedWords[i] !== userWords[i]) {
      // Only flag if it's not similar
      if (
        !expectedWords[i].startsWith(userWords[i]) &&
        !userWords[i].startsWith(expectedWords[i])
      ) {
        mistakes.push(
          `Word "${expectedWords[i]}" was pronounced differently as "${userWords[i]}"`
        );
      }
    }
  }

  // Generate explanation
  let explanation = "";
  if (score >= 90) {
    explanation =
      "Excellent! Your pronunciation is very close to the native speaker. Keep practicing to achieve perfect clarity!";
  } else if (score >= 80) {
    explanation =
      "Very good! You got most of it right. Focus on the R and L sounds to improve further. These are the most challenging for English learners.";
  } else if (score >= 70) {
    explanation =
      "Good job! You're on the right track. The R and L sounds are tricky - they require different tongue and lip positions. Practice slowly and deliberately.";
  } else if (score >= 60) {
    explanation =
      "You're making progress! Pay special attention to the R and L sounds marked above. These are the most common pronunciation challenges for non-native speakers.";
  } else {
    explanation =
      "This is challenging, but that's normal! Focus on pronouncing each word slowly and clearly. The R and L sounds in particular need special attention.";
  }

  // Generate suggestions
  const suggestions: string[] = [];

  if (hasRLConfusion || score < 75) {
    suggestions.push("🔴 Work on R sound: Say 'errr' with rounded lips");
    suggestions.push("🔵 Work on L sound: Say 'lll' with your tongue on teeth");
    suggestions.push(
      "Try recording the same sentence 3-5 times to track improvement"
    );
  }

  if (score >= 80) {
    suggestions.push("You're ready for the next practice sentence!");
    suggestions.push("Try the R vs L lesson for targeted practice");
  } else {
    suggestions.push("Slow down and enunciate each word clearly");
    suggestions.push("Listen to native speakers pronounce similar words");
    suggestions.push("Record yourself and compare with the original");
  }

  if (mistakes.length === 0) {
    mistakes.push("No pronunciation issues detected!");
    suggestions.push("Perfect pronunciation! Try a more challenging sentence.");
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

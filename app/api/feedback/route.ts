//api/feedback/route.ts

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
 * Generate basic feedback based on text comparison and sound patterns
 * This is a placeholder for OpenAI integration later
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

  // Calculate base similarity score
  let score = calculateSimilarity(expected, user);

  // Identify mistakes through multiple analysis methods
  const mistakes: string[] = [];
  const corrections: string[] = [];

  // Only analyze for issues if score is not perfect
  if (score < 100) {
    const expectedWords = expected.split(/\s+/);
    const userWords = user.split(/\s+/);

    // 1. Check for missing or extra words
    if (userWords.length < expectedWords.length) {
      mistakes.push(
        `You skipped or slurred ${expectedWords.length - userWords.length} word(s)`
      );
    } else if (userWords.length > expectedWords.length) {
      mistakes.push(
        `You added ${userWords.length - expectedWords.length} extra word(s)`
      );
    }

    // 2. Word-by-word analysis with SOUND PATTERN detection
    for (let i = 0; i < Math.min(expectedWords.length, userWords.length); i++) {
      const expectedWord = expectedWords[i];
      const userWord = userWords[i];

      if (expectedWord !== userWord) {
        // Check for R vs L confusion
        if (expectedWord.includes("r") && userWord.includes("l")) {
          mistakes.push(
            `"${expectedWord}" - You pronounced the 'R' sound as 'L'`
          );
          corrections.push(
            `For R: Pull your tongue back slightly, don't touch the roof of your mouth. Round your lips. Try: "rrr"`
          );
          score -= 10; // Penalty for sound mistake
        } else if (expectedWord.includes("l") && userWord.includes("r")) {
          mistakes.push(
            `"${expectedWord}" - You pronounced the 'L' sound as 'R'`
          );
          corrections.push(
            `For L: Place your tongue on the ridge behind your upper teeth and let air flow around the sides. Try: "lll"`
          );
          score -= 10; // Penalty for sound mistake
        }

        // Check for TH sound issues (very common for non-native speakers)
        if (expectedWord.includes("th") && !userWord.includes("th")) {
          mistakes.push(
            `"${expectedWord}" - You may be missing or mispronouncing the 'TH' sound`
          );
          corrections.push(
            `For TH: Stick your tongue between your teeth slightly and blow air gently. Your teeth should touch your tongue. Try: "thhhh"`
          );
          score -= 8; // Penalty for TH mistake
        }

        // Check for S/SH confusion
        if (expectedWord.includes("sh") && userWord.includes("s") && !userWord.includes("sh")) {
          mistakes.push(
            `"${expectedWord}" - You pronounced 'SH' as just 'S'`
          );
          corrections.push(
            `For SH: Position your lips like you're kissing, round them, and push air through. Try: "shhhh"`
          );
          score -= 8;
        }

        // Check for V/F confusion (common for some learners)
        if (expectedWord.includes("v") && userWord.includes("f")) {
          mistakes.push(
            `"${expectedWord}" - You pronounced 'V' as 'F'`
          );
          corrections.push(
            `For V: Place your bottom lip on your upper teeth and vibrate. You should feel the vibration. Try: "vvvv"`
          );
          score -= 8;
        }

        // General pronunciation difference (not a known pattern)
        if (
          !mistakes.some((m) => m.includes(expectedWord)) &&
          !expectedWord.startsWith(userWord) &&
          !userWord.startsWith(expectedWord)
        ) {
          mistakes.push(`Word "${expectedWord}" was pronounced as "${userWord}"`);
          corrections.push(`Try saying "${expectedWord}" slowly and carefully`);
          score -= 5;
        }
      }
    }
  }

  // Ensure score stays between 0-100
  score = Math.max(0, Math.min(100, score));

  // Generate explanation based on score and issues
  let explanation = "";
  if (score === 100) {
    explanation =
      "Perfect! 🎉 Your pronunciation is excellent! You matched the native speaker exactly. Outstanding work!";
  } else if (score >= 90) {
    explanation =
      "Excellent! Your pronunciation is very close to the native speaker. Just a few small adjustments needed!";
  } else if (score >= 80) {
    explanation =
      "Very good! You got most of it right. Pay attention to the words marked above and practice them carefully.";
  } else if (score >= 70) {
    explanation =
      "Good job! You're on the right track. Work on the specific sounds and words that need adjustment.";
  } else if (score >= 60) {
    explanation =
      "You're making progress! Keep practicing the specific sounds marked above. Repetition is key!";
  } else {
    explanation =
      "Keep practicing! This is challenging, but with repetition you'll improve. Try to pronounce each word slowly and clearly.";
  }

  // Generate suggestions based on performance
  const suggestions: string[] = [];

  if (score === 100) {
    suggestions.push("🏆 Perfect pronunciation! Try a more challenging sentence!");
    suggestions.push("Consider trying the R vs L lesson for advanced practice");
  } else if (score >= 80) {
    suggestions.push("✅ You're ready for the next practice sentence!");
    suggestions.push("💪 Try the R vs L lesson for targeted pronunciation practice");
  } else if (score >= 60) {
    suggestions.push("🔴 Focus on the R and L sounds - they're tricky!");
    suggestions.push("🔵 Don't forget about TH sounds - key to natural English");
    suggestions.push("📝 Try recording the same sentence 3-5 times to track improvement");
  } else {
    suggestions.push("🐢 Slow down and enunciate each word clearly");
    suggestions.push("🎧 Listen to native speakers pronounce similar words");
    suggestions.push("📱 Record yourself and compare with the original");
  }

  // If no specific mistakes were found
  if (mistakes.length === 0 && score < 100) {
    mistakes.push("✨ Very close! Just a few minor adjustments needed.");
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

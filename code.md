PROJECT OVERVIEW:

I am building an AI-powered English pronunciation training web app called "VoiceGym".

The goal is to help users improve their spoken English, especially difficult sounds like R vs L, using voice recording, feedback, and daily practice.

---

TECH STACK:

* Next.js (App Router)
* TypeScript
* Prisma ORM
* PostgreSQL
* Tailwind CSS
* Web Speech API (SpeechRecognition + Text-to-Speech)

---

CURRENT FEATURES:

1. Voice recording using browser microphone
2. Speech-to-text transcription
3. Pronunciation feedback system (currently rule-based, not AI-powered)
4. Score system (0–100)
5. Practice sessions saved in database
6. Progress tracking (streaks, total sessions)
7. Lesson system (example: R vs L sounds)
8. Clean UI with feedback boxes and progress UI
9. Auto-saving of sessions
10. Gamification basics (streaks, completion tracking)

---

KEY FILES INCLUDED:

* API: /api/feedback → generates pronunciation feedback
* API: /api/practice → saves sessions and tracks progress
* Components: VoiceRecorder, FeedbackBox, Navbar, ProgressBar
* Pages: Practice page, Lesson page (R vs L), Progress page
* Prisma schema with User, PracticeSession, Progress models

---

CURRENT LIMITATIONS:

1. Feedback is not truly intelligent (string comparison only)
2. No real phonetic or sound-level analysis
3. No real conversational AI (only repeat-after-me)
4. No audio playback of user's own voice
5. No AI avatar or human-like interaction
6. Limited lesson variety
7. No personalization based on user weaknesses

---

WHAT I WANT YOU TO DO:

Upgrade this app into a world-class AI pronunciation trainer.

Focus on these areas:

1. INTELLIGENT FEEDBACK SYSTEM

* Replace heuristic comparison with AI-powered feedback
* Detect specific sound mistakes (R, L, TH, S, etc.)
* Give human-like coaching (example: "your tongue is too forward")
* Suggest targeted drills per mistake

2. REAL-TIME CONVERSATION MODE

* Add a mode where user talks with AI (like a tutor)
* AI should respond with voice (text-to-speech)
* Make it feel like a Zoom call interaction
* Keep it simple but realistic

3. AUDIO IMPROVEMENTS

* Let user playback their own voice
* Compare user audio vs correct pronunciation
* (Optional) waveform or visual comparison

4. LESSON SYSTEM UPGRADE

* Add structured lessons:

  * R sound
  * L sound
  * TH sound
  * S vs SH
* Each lesson should include:

  * Explanation
  * Mouth positioning (visual hints)
  * Practice words
  * Sentences

5. PERSONALIZATION

* Track user's weak sounds
* Suggest daily exercises based on weaknesses
* Build a "Daily Mission" system

6. UI/UX IMPROVEMENTS

* Make it more engaging and addictive
* Add animations and feedback rewards
* Improve mobile experience (PWA friendly)

7. PERFORMANCE & STRUCTURE

* Suggest better architecture if needed
* Optimize API calls
* Keep everything scalable and clean

---

IMPORTANT:

* Do NOT break existing working features
* Keep code clean and beginner-friendly
* Explain changes clearly
* Suggest exact files and code where possible

---

OUTPUT FORMAT:

1. High-level improvement plan
2. Specific features to add
3. Code examples (where necessary)
4. File structure changes
5. Step-by-step implementation plan

---

GOAL:

Turn this into a Duolingo-level pronunciation trainer with AI coaching and conversational interaction.

The user of this app may not be fluent in English, so explanations should be simple, clear, and beginner-friendly.




































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





//api/practice/route.ts

import { NextResponse } from "next/server";
import getPrismaClient from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId, sentence, userText, feedback, score } = body;

    // Validate required fields
    if (!userId || !sentence || !userText) {
      return NextResponse.json(
        { error: "Missing required fields: userId, sentence, userText" },
        { status: 400 }
      );
    }

    // Save practice session to database
    const prisma = getPrismaClient();
    const session = await prisma.practiceSession.create({
      data: {
        userId,
        sentence,
        userText,
        feedback: feedback || "",
        score: score || 0,
      },
    });

    // Update user progress
    const existingProgress = await prisma.progress.findUnique({
      where: { userId },
    });

    if (existingProgress) {
      // Update existing progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Safely handle null lastPracticeDate
      let lastPractice: Date | null = null;
      if (existingProgress.lastPracticeDate) {
        lastPractice = new Date(existingProgress.lastPracticeDate);
        lastPractice.setHours(0, 0, 0, 0);
      }

      let newStreak = 1;

      if (lastPractice) {
        const isSameDay = today.getTime() === lastPractice.getTime();
        const isConsecutiveDay =
          (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24) === 1;

        newStreak = isSameDay
          ? existingProgress.streak
          : isConsecutiveDay
            ? existingProgress.streak + 1
            : 1;
      }

      await prisma.progress.update({
        where: { userId },
        data: {
          lastPracticeDate: new Date(),
          totalSessions: existingProgress.totalSessions + 1,
          streak: newStreak,
        },
      });
    } else {
      // Create new progress record
      await prisma.progress.create({
        data: {
          userId,
          streak: 1,
          lastPracticeDate: new Date(),
          totalSessions: 1,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        session,
        message: "Practice session saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Practice API error:", error);
    return NextResponse.json(
      { error: "Failed to save practice session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/practice?userId=...
 * Retrieve user's practice sessions with progress, improvement, and level
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const prisma = getPrismaClient();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const sessions = await prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const progress = await prisma.progress.findUnique({
      where: { userId },
    });

    // Calculate improvement (last score vs previous score)
    let improvement: number | null = null;
    const lastScore = sessions[0]?.score ?? null;
    const previousScore = sessions[1]?.score ?? null;

    if (sessions.length >= 2 && lastScore !== null && previousScore !== null) {
      improvement = lastScore - previousScore;
    } else if (sessions.length === 1 && lastScore !== null) {
      improvement = lastScore; // No previous score, show current as baseline
    }

    // Calculate user level based on total sessions
    // Level 1: 1-9 sessions (Beginner)
    // Level 2: 10-24 sessions (Improving)
    // Level 3: 25-49 sessions (Confident)
    // Level 4: 50+ sessions (Expert)
    const level = progress
      ? Math.min(
          4,
          Math.floor(progress.totalSessions / 10) + 1
        )
      : 1;

    const levelLabels: { [key: number]: string } = {
      1: "Beginner",
      2: "Improving",
      3: "Confident",
      4: "Expert",
    };

    return NextResponse.json(
      {
        sessions,
        progress: progress
          ? {
              ...progress,
              level,
              levelLabel: levelLabels[level],
            }
          : null,
        improvement: improvement !== null ? improvement : 0,
        stats: {
          totalSessions: progress?.totalSessions || 0,
          currentStreak: progress?.streak || 0,
          averageScore:
            sessions.length > 0
              ? Math.round(
                  sessions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
                    sessions.length
                )
              : 0,
          bestScore: sessions.length > 0
            ? Math.max(...sessions.map((s) => s.score ?? 0))
            : 0,
          lastScore: sessions.length > 0 ? (sessions[0].score ?? 0) : 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Practice GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve practice sessions" },
      { status: 500 }
    );
  }
}


these blow are pages  


import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { AICoachPanel } from "@/components/ai/AICoachPanel";

export default function CoachPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar title="AI Coach" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <p className="text-slate-700">
            Ask questions, talk to the coach, and get quick pronunciation tips.
          </p>
          <div className="flex gap-2">
            <Link
              href="/practice"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm"
            >
              Practice
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm"
            >
              Home
            </Link>
          </div>
        </div>

        <AICoachPanel />

        <section className="mt-8 bg-white rounded-2xl p-6 shadow border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Quick tips</h2>
          <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
            <li>Start slow, then speed up only when it sounds clean.</li>
            <li>Practice one sound at a time (R, L, TH) before full sentences.</li>
            <li>
              Record yourself in Practice, then ask the coach about a tricky
              word.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}





"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { FeedbackBox } from "@/components/FeedbackBox";
import { Navbar } from "@/components/Navbar";
import { getPronunciationFeedback } from "@/lib/feedback";
import { speakText, stopSpeaking } from "@/lib/speech";

const LESSON_CONTENT = {
  title: "R vs L: Master These Challenging Sounds",
  description:
    "The R and L sounds are among the most challenging for English learners. This lesson will help you understand and practice the differences.",
  examples: {
    R: {
      words: [
        "Red",
        "Right",
        "Rain",
        "River",
        "Really",
        "Relax",
      ],
      explanation:
        "The R sound is made by placing your tongue slightly back in your mouth and rounding your lips. It should sound like a warm, gliding sound.",
    },
    L: {
      words: [
        "Light",
        "Learner",
        "Light",
        "Lesson",
        "Listen",
        "Language",
      ],
      explanation:
        "The L sound is made by placing your tongue against the upper teeth ridge behind your front teeth. It's a clear, crisp sound.",
    },
  },
  practiceWords: [
    { expected: "Right", type: "R" },
    { expected: "Light", type: "L" },
    { expected: "Red", type: "R" },
    { expected: "Learning", type: "L" },
    { expected: "Relaxing", type: "R" },
    { expected: "Laughter", type: "L" },
  ],
};

interface FeedbackState {
  mistakes: string[];
  corrections: string[];
  explanation: string;
  score: number;
  suggestions: string[];
}

type LessonStep = "intro" | "learn" | "practice" | "results";

export default function RVsLLessonPage() {
  const [step, setStep] = useState<LessonStep>("intro");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [completedWords, setCompletedWords] = useState<number[]>([]);

  const currentWord = LESSON_CONTENT.practiceWords[currentWordIndex];

  // Speak example word
  const handleSpeakWord = useCallback(
    async (word: string) => {
      try {
        setIsSpeaking(true);
        await speakText(word, 0.8);
        setIsSpeaking(false);
      } catch (err) {
        setIsSpeaking(false);
      }
    },
    []
  );

  // Handle transcript from voice recorder
  const handleTranscriptReceived = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        return;
      }

      setTranscript(text);
      setIsLoading(true);

      try {
        const feedbackData = await getPronunciationFeedback(
          currentWord.expected,
          text
        );
        setFeedback(feedbackData);

        // Mark word as completed if score is above 70
        if (feedbackData.score >= 70) {
          setCompletedWords([...completedWords, currentWordIndex]);
        }
      } catch (err) {
        console.error("Failed to analyze:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentWord, currentWordIndex, completedWords]
  );

  // Move to next practice word
  const handleNextWord = () => {
    if (currentWordIndex < LESSON_CONTENT.practiceWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setTranscript("");
      setFeedback(null);
    } else {
      // Lesson complete
      setStep("results");
    }
  };

  // Skip current word
  const handleSkipWord = () => {
    handleNextWord();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar title="R vs L Lesson" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* INTRO STEP */}
        {step === "intro" && (
          <>
            <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {LESSON_CONTENT.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                {LESSON_CONTENT.description}
              </p>
              <p className="text-gray-700 leading-relaxed">
                Many English learners struggle with R and L because these
                sounds don't exist in many other languages. In this lesson,
                you'll learn the key differences and practice until you master
                them!
              </p>
            </div>

            {/* R Sound Section with Visual Training */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-red-200">
              <h2 className="text-2xl font-bold text-red-900 mb-3 flex items-center gap-2">
                <span className="text-3xl">🔴</span> The R Sound
              </h2>
              
              {/* Visual Diagram */}
              <div className="bg-white rounded-xl p-4 mb-4 border-2 border-red-300">
                <p className="text-center font-semibold text-gray-700 mb-3">Mouth Position for R Sound:</p>
                <div className="text-center text-4xl mb-3">
                  👅 ← Tongue pulled BACK
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="text-center pb-3 border-b border-green-300">
                    <p className="font-bold text-green-700 mb-1">✅ DO THIS:</p>
                    <p>• Pull tongue slightly back</p>
                    <p>• Round your lips</p>
                    <p>• Don't touch roof of mouth</p>
                  </div>
                  <div className="text-center pb-3 border-b border-red-300">
                    <p className="font-bold text-red-700 mb-1">❌ DON'T DO THIS:</p>
                    <p>• Don't touch the top</p>
                    <p>• Don't flatten your lips</p>
                    <p>• Don't make an L sound</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                {LESSON_CONTENT.examples.R.explanation}
              </p>
              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-2">
                  Example words:
                </p>
                <div className="flex flex-wrap gap-2">
                  {LESSON_CONTENT.examples.R.words.map((word) => (
                    <button
                      key={word}
                      onClick={() => handleSpeakWord(word)}
                      disabled={isSpeaking}
                      className="px-4 py-2 bg-red-200 hover:bg-red-300 text-red-900 rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* L Sound Section with Visual Training */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-3xl">🔵</span> The L Sound
              </h2>
              
              {/* Visual Diagram */}
              <div className="bg-white rounded-xl p-4 mb-4 border-2 border-blue-300">
                <p className="text-center font-semibold text-gray-700 mb-3">Mouth Position for L Sound:</p>
                <div className="text-center text-4xl mb-3">
                  👅 ↑ Tongue ON RIDGE (behind top teeth)
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="text-center pb-3 border-b border-green-300">
                    <p className="font-bold text-green-700 mb-1">✅ DO THIS:</p>
                    <p>• Touch ridge behind teeth</p>
                    <p>• Let air flow AROUND sides</p>
                    <p>• Make a crisp sound</p>
                  </div>
                  <div className="text-center pb-3 border-b border-red-300">
                    <p className="font-bold text-red-700 mb-1">❌ DON'T DO THIS:</p>
                    <p>• Don't pull tongue back</p>
                    <p>• Don't round your lips</p>
                    <p>• Don't make an R sound</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                {LESSON_CONTENT.examples.L.explanation}
              </p>
              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-2">
                  Example words:
                </p>
                <div className="flex flex-wrap gap-2">
                  {LESSON_CONTENT.examples.L.words.map((word) => (
                    <button
                      key={word}
                      onClick={() => handleSpeakWord(word)}
                      disabled={isSpeaking}
                      className="px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-900 rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Practice */}
            <button
              onClick={() => setStep("practice")}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl py-4 font-bold text-lg hover:shadow-xl transition-all"
            >
              Start Practice 🎯
            </button>
          </>
        )}

        {/* PRACTICE STEP */}
        {step === "practice" && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">
                  Word {currentWordIndex + 1} of{" "}
                  {LESSON_CONTENT.practiceWords.length}
                </span>
                <span className="text-lg font-bold text-green-600">
                  {completedWords.length} completed ✓
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentWordIndex + 1) / LESSON_CONTENT.practiceWords.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Sound Type Indicator */}
            <div
              className={`rounded-2xl p-4 mb-6 text-center ${
                currentWord.type === "R"
                  ? "bg-red-100 border-2 border-red-300"
                  : "bg-blue-100 border-2 border-blue-300"
              }`}
            >
              <p className="text-gray-600 text-sm mb-1">Current Sound:</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentWord.type === "R" ? "🔴 R Sound" : "🔵 L Sound"}
              </p>
            </div>

            {/* Voice Recorder */}
            <div className="mb-12">
              <VoiceRecorder
                expectedSentence={currentWord.expected}
                onTranscriptReceived={handleTranscriptReceived}
                isProcessing={isLoading}
              />
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="bg-blue-50 rounded-2xl p-8 text-center mb-8">
                <div className="inline-block animate-spin mb-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full"></div>
                </div>
                <p className="text-blue-900 font-medium">
                  Analyzing your pronunciation...
                </p>
              </div>
            )}

            {/* Feedback */}
            {feedback && !isLoading && (
              <div className="mb-8">
                <FeedbackBox
                  mistakes={feedback.mistakes}
                  corrections={feedback.corrections}
                  explanation={feedback.explanation}
                  score={feedback.score}
                  suggestions={feedback.suggestions}
                  userSpeech={transcript}
                  expectedSentence={currentWord.expected}
                />

                {/* Try Again Button - Shows when score < 80 */}
                {feedback.score < 80 && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl text-center">
                    <p className="text-blue-900 font-semibold mb-4">
                      You're very close! Let's get that sound right. 🎯
                    </p>
                    <button
                      onClick={() => {
                        setTranscript("");
                        setFeedback(null);
                      }}
                      disabled={isLoading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all inline-block"
                    >
                      🔁 Try Again
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Practice Controls */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={handleSkipWord}
                disabled={isLoading}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 disabled:opacity-50 transition-all"
              >
                Skip
              </button>

              <button
                onClick={() => {
                  setTranscript("");
                  setFeedback(null);
                }}
                disabled={isLoading}
                className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 disabled:opacity-50 transition-all"
              >
                Reset
              </button>

              <button
                onClick={handleNextWord}
                disabled={isLoading || !feedback}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
              >
                Next Word →
              </button>
            </div>
          </>
        )}

        {/* RESULTS STEP */}
        {step === "results" && (
          <>
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-3xl p-8 border-4 border-green-500 mb-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-900 mb-4">
                Lesson Completed!
              </h2>
              <p className="text-xl text-green-800 mb-6">
                Great job! You completed the R vs L lesson.
              </p>

              <div className="bg-white rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Words Mastered</p>
                    <p className="text-4xl font-bold text-green-600">
                      {completedWords.length}/{LESSON_CONTENT.practiceWords.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">
                      Mastery Level
                    </p>
                    <p className="text-4xl font-bold text-blue-600">
                      {Math.round(
                        (completedWords.length /
                          LESSON_CONTENT.practiceWords.length) *
                          100
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-green-900 mb-8">
                {completedWords.length ===
                LESSON_CONTENT.practiceWords.length
                  ? "Perfect score! You've mastered the R vs L sounds! 🏆"
                  : "Keep practicing to improve your mastery!"}
              </p>

              <Link
                href="/lessons"
                className="inline-block px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all mb-4"
              >
                Back to Lessons
              </Link>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center mt-12">
        <p className="text-sm opacity-75">
          Regular practice makes perfect! Come back tomorrow for more lessons.
        </p>
      </footer>
    </div>
  );
}






"use client";

import { useState, useCallback, useEffect } from "react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { FeedbackBox } from "@/components/FeedbackBox";
import { Navbar } from "@/components/Navbar";
import { getPronunciationFeedback } from "@/lib/feedback";
import { savePracticeSession } from "@/lib/practice";
import { getUserId } from "@/lib/utils";

const PRACTICE_SENTENCES = [
  "The right light is very bright.",
  "Red rocks are really rare.",
  "Light rain rarely reaches the ridge.",
  "The river runs right around the rock.",
  "Reading is really relaxing.",
];

interface FeedbackState {
  mistakes: string[];
  corrections: string[];
  explanation: string;
  score: number;
  suggestions: string[];
}

export default function PracticePage() {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentSentence = PRACTICE_SENTENCES[currentSentenceIndex];

  // Initialize user ID
  useEffect(() => {
    setUserId(getUserId());
  }, []);

  // Auto-save session when feedback is available
  useEffect(() => {
    const autoSave = async () => {
      if (feedback && userId && transcript && !isSaving) {
        setIsSaving(true);
        try {
          await savePracticeSession({
            userId,
            sentence: currentSentence,
            userText: transcript,
            feedback: feedback.explanation,
            score: feedback.score,
          });
          setSaveSuccess(true);
          // Hide success message after 1.5 seconds
          setTimeout(() => setSaveSuccess(false), 1500);
        } catch (err) {
          console.error("Auto-save failed:", err);
          // Silently fail on auto-save
        } finally {
          setIsSaving(false);
        }
      }
    };

    autoSave();
  }, [feedback, userId, transcript, currentSentence, isSaving]);

  // Handle transcript received from voice recorder
  const handleTranscriptReceived = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError("No speech detected. Please try again.");
      return;
    }

    setTranscript(text);
    setError(null);
    setSaveSuccess(false);
    setIsLoading(true);

    try {
      const feedbackData = await getPronunciationFeedback(
        currentSentence,
        text
      );
      setFeedback(feedbackData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze pronunciation"
      );
      setFeedback(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentSentence]);

  // Move to next sentence
  const handleNextSentence = () => {
    if (currentSentenceIndex < PRACTICE_SENTENCES.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setTranscript("");
      setFeedback(null);
      setError(null);
    } else {
      // Cycling back to beginning
      setCurrentSentenceIndex(0);
      setTranscript("");
      setFeedback(null);
      setError(null);
    }
  };

  // Move to previous sentence
  const handlePreviousSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(currentSentenceIndex - 1);
      setTranscript("");
      setFeedback(null);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar title="Voice Practice" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="bg-white rounded-2xl p-4 mb-8 flex items-center justify-between">
          <span className="text-gray-600 font-medium">
            Sentence {currentSentenceIndex + 1} of {PRACTICE_SENTENCES.length}
          </span>
          <div className="flex gap-1">
            {PRACTICE_SENTENCES.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-8 rounded-full transition-all ${
                  idx <= currentSentenceIndex
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Voice Recorder */}
        <div className="mb-12">
          <VoiceRecorder
            expectedSentence={currentSentence}
            onTranscriptReceived={handleTranscriptReceived}
            isProcessing={isLoading}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-blue-50 rounded-2xl p-8 text-center mb-8">
            <div className="inline-block animate-spin mb-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full"></div>
            </div>
            <p className="text-blue-900 font-medium">
              Analyzing your pronunciation...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <p className="text-red-900 font-medium">❌ Error: {error}</p>
          </div>
        )}

        {/* Feedback */}
        {feedback && !isLoading && (
          <div className="mb-8">
            <FeedbackBox
              mistakes={feedback.mistakes}
              corrections={feedback.corrections}
              explanation={feedback.explanation}
              score={feedback.score}
              suggestions={feedback.suggestions}
              userSpeech={transcript}
              expectedSentence={currentSentence}
            />

            {/* Auto-Save Success Message */}
            {saveSuccess && (
              <div className="bg-green-50 border-2 border-green-300 text-green-800 px-4 py-3 rounded-lg mt-6 text-center animate-pulse">
                <p className="font-semibold">✅ Session saved automatically!</p>
              </div>
            )}

            {/* Try Again Button - Shows when score < 80 */}
            {feedback && feedback.score < 80 && (
              <div className="mt-6 p-6 bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl text-center">
                <p className="text-blue-900 font-semibold mb-4">
                  You're very close! Let's fix that one sound. 🎯
                </p>
                <button
                  onClick={() => {
                    setTranscript("");
                    setFeedback(null);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all inline-block"
                >
                  🔁 Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center flex-wrap mb-8">
          <button
            onClick={handlePreviousSentence}
            disabled={currentSentenceIndex === 0 || isLoading}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>

          <button
            onClick={() => {
              setTranscript("");
              setFeedback(null);
              setError(null);
              setSaveSuccess(false);
            }}
            disabled={isLoading}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            💫 Reset
          </button>

          <button
            onClick={handleNextSentence}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {currentSentenceIndex === PRACTICE_SENTENCES.length - 1
              ? "Start Over →"
              : "Next →"}
          </button>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
          <h3 className="font-bold text-gray-900 mb-3">💡 Pro Tips:</h3>
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>✓ Speak clearly and naturally</li>
            <li>✓ Take your time, no need to rush</li>
            <li>✓ Click "Play Sample" to hear native pronunciation</li>
            <li>✓ Record multiple times to improve</li>
            <li>✓ Focus on one sentence before moving to the next</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center mt-12">
        <p className="text-sm opacity-75">
          Keep practicing! Your pronunciation will improve with each session.
        </p>
      </footer>
    </div>
  );
}






"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProgressBar } from "@/components/ProgressBar";
import { getUserId } from "@/lib/utils";

interface UserStats {
  totalSessions: number;
  currentStreak: number;
  averageScore: number;
  bestScore: number;
  lastScore: number;
}

interface UserProgress {
  level: number;
  levelLabel: string;
  streak: number;
  totalSessions: number;
  lastPracticeDate: string | null;
}

interface UserData {
  stats: UserStats;
  progress: UserProgress | null;
  improvement: number;
}

export default function ProgressPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const userId = getUserId();
        const response = await fetch(`/api/practice?userId=${userId}&limit=10`);

        if (!response.ok) {
          throw new Error("Failed to fetch progress");
        }

        const data = await response.json();
        setUserData({
          stats: data.stats,
          progress: data.progress,
          improvement: data.improvement,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load progress");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
        <Navbar title="Your Progress" />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading your progress...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
        <Navbar title="Your Progress" />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
            {error || "Failed to load progress data"}
          </div>
        </main>
      </div>
    );
  }

  const { stats, progress, improvement } = userData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar title="Your Progress" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* User Level Badge */}
        {progress && (
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold opacity-90">Your Level</p>
                <p className="text-3xl font-bold">{progress.levelLabel}</p>
                <p className="text-sm opacity-75 mt-1">
                  Level {progress.level} • Keep practicing to advance!
                </p>
              </div>
              <div className="text-6xl">
                {progress.level === 1
                  ? "🌱"
                  : progress.level === 2
                  ? "🌿"
                  : progress.level === 3
                  ? "🌳"
                  : "🏆"}
              </div>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Total Sessions 🎤
            </p>
            <p className="text-4xl font-bold text-blue-600">
              {stats.totalSessions}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Keep practicing to level up!
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Current Streak 🔥
            </p>
            <p className="text-4xl font-bold text-orange-600">
              {stats.currentStreak} days
            </p>
            <p className="text-gray-500 text-xs mt-2">
              {stats.currentStreak > 0
                ? "Amazing! Keep it going!"
                : "Start practicing today!"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Average Score 📊
            </p>
            <p className="text-4xl font-bold text-green-600">
              {stats.averageScore}%
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Across all sessions
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Best Score ⭐
            </p>
            <p className="text-4xl font-bold text-purple-600">
              {stats.bestScore}%
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Your personal best
            </p>
          </div>
        </section>

        {/* Recent Performance */}
        {stats.lastScore > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📈 Recent Performance
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Last Session Score</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.lastScore}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-sm mb-1">Score Change</p>
                  <p
                    className={`text-2xl font-bold ${
                      improvement > 0
                        ? "text-green-600"
                        : improvement < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {improvement > 0 ? "+" : ""}
                    {improvement}%
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {improvement > 0
                      ? "Great improvement!"
                      : improvement < 0
                      ? "Keep trying!"
                      : "Starting fresh"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Lessons Progress */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📚 Lessons Progress
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow">
            <ProgressBar
              current={1}
              total={5}
              label="Lessons Completed"
            />
          </div>

          {/* Lesson Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-red-900">
                  🔴 R vs L Sounds
                </h3>
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-red-800 text-sm mb-3">Status: In Progress</p>
              <p className="text-red-700 text-xs">
                Practice sessions: {stats.totalSessions}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-300 opacity-60 hover:opacity-100 transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-600">
                  🔵 TH Sounds
                </h3>
                <span className="text-2xl">🔒</span>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Status: Locked
              </p>
              <p className="text-gray-500 text-xs">
                Complete R vs L to unlock
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-300 opacity-60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-600">
                  💨 S/SH Sounds
                </h3>
                <span className="text-2xl">🔒</span>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Status: Locked
              </p>
              <p className="text-gray-500 text-xs">
                More lessons coming soon
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-300 opacity-60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-600">
                  🎯 V/F Sounds
                </h3>
                <span className="text-2xl">🔒</span>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Status: Locked
              </p>
              <p className="text-gray-500 text-xs">
                More lessons coming soon
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-8">
          <Link
            href="/practice"
            className="w-full inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-2xl text-center hover:shadow-lg transition"
          >
            🎤 Continue Practicing
          </Link>
        </section>

        {/* Achievements */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🏆 Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.totalSessions >= 1 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
                <p className="text-3xl mb-1">🌟</p>
                <p className="text-sm font-bold text-yellow-900">First Step</p>
                <p className="text-xs text-yellow-800">1 session</p>
              </div>
            )}
            {stats.totalSessions >= 5 && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 text-center">
                <p className="text-3xl mb-1">🚀</p>
                <p className="text-sm font-bold text-blue-900">Getting Started</p>
                <p className="text-xs text-blue-800">5 sessions</p>
              </div>
            )}
            {stats.currentStreak >= 3 && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 text-center">
                <p className="text-3xl mb-1">🔥</p>
                <p className="text-sm font-bold text-orange-900">On Fire</p>
                <p className="text-xs text-orange-800">3 day streak</p>
              </div>
            )}
            {stats.averageScore >= 80 && (
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
                <p className="text-3xl mb-1">⭐</p>
                <p className="text-sm font-bold text-green-900">High Scorer</p>
                <p className="text-xs text-green-800">80%+ average</p>
              </div>
            )}
            <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 text-center opacity-60">
              <p className="text-3xl mb-1">💎</p>
              <p className="text-sm font-bold text-purple-900">Expert</p>
              <p className="text-xs text-purple-800">50 sessions</p>
            </div>
            <div className="bg-pink-50 border-2 border-pink-300 rounded-xl p-4 text-center opacity-60">
              <p className="text-3xl mb-1">👑</p>
              <p className="text-sm font-bold text-pink-900">Perfect Week</p>
              <p className="text-xs text-pink-800">7 day streak</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}



main page  


"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { LessonCard } from "@/components/LessonCard";
import { ProgressBar } from "@/components/ProgressBar";
import { getGreeting, getUserId } from "@/lib/utils";

const DAILY_GOAL = 5;

interface UserStats {
  totalSessions: number;
  currentStreak: number;
  averageScore: number;
}

export default function Home() {
  const greeting = getGreeting();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const userId = getUserId();
        const response = await fetch(`/api/practice?userId=${userId}&limit=100`);

        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();
        setStats(data.stats);

        // Count sessions from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysCount = (data.sessions || []).filter((session: any) => {
          const sessionDate = new Date(session.createdAt);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === today.getTime();
        }).length;

        setSessionsToday(todaysCount);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Use defaults on error
        setStats({
          totalSessions: 0,
          currentStreak: 0,
          averageScore: 0,
        });
        setSessionsToday(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Loading your stats...</p>
        </main>
      </div>
    );
  }

  const streak = stats?.currentStreak || 0;
  const totalSessions = stats?.totalSessions || 0;
  const remainingToday = Math.max(0, DAILY_GOAL - sessionsToday);
  const progressPercent = Math.min(100, (sessionsToday / DAILY_GOAL) * 100);
  const lessonsCompleted = 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {greeting}
            </h1>
            <p className="text-xl text-gray-600">
              Welcome back! Let's improve your English pronunciation today! 🚀
            </p>
          </div>
        </section>

        {/* Daily Mission - Big Hero Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Today's Mission
          </h2>
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl p-8 text-white shadow-xl">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">
                  {sessionsToday} of {DAILY_GOAL} ✅
                </span>
                <span className="text-5xl">
                  {sessionsToday >= DAILY_GOAL ? "🏆" : "🔥"}
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {sessionsToday >= DAILY_GOAL ? (
              <p className="text-lg font-semibold">
                🎉 You've completed today's goal! Amazing dedication!
              </p>
            ) : (
              <p className="text-lg font-semibold">
                {remainingToday === 0
                  ? "🏆 One more to go!"
                  : `${remainingToday} session${remainingToday !== 1 ? "s" : ""} to go!`}
              </p>
            )}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Current Streak 🔥
                </p>
                <p className="text-3xl font-bold text-orange-500">{streak}</p>
              </div>
              <span className="text-5xl">🔥</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Total Sessions
                </p>
                <p className="text-3xl font-bold text-blue-500">
                  {totalSessions}
                </p>
              </div>
              <span className="text-5xl">📊</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-green-500">
                  {stats?.averageScore || 0}%
                </p>
              </div>
              <span className="text-5xl">📈</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-8">
          <Link
            href="/practice"
            className="block bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Voice Practice</h3>
                <p className="opacity-90">
                  Record and improve your pronunciation with real-time
                  feedback
                </p>
              </div>
              <span className="text-6xl">🎤</span>
            </div>
          </Link>
        </section>

        {/* Quick Navigation */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Navigation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/lessons"
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-all hover:scale-105 transform"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">📚</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Lessons
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Learn sound patterns (R/L, TH, V/F)
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/progress"
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-all hover:scale-105 transform"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">📈</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Progress
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Track your improvement over time
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/coach"
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-all hover:scale-105 transform"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold">AI</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Coach
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Chat and get pronunciation tips
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Lessons */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎓 Start Learning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LessonCard
              title="R vs L"
              description="Master the challenging R and L sounds. Learn pronunciation techniques and practice with native speakers."
              icon="🔴"
              difficulty="Beginner"
              isCompleted={false}
            />

            <div className="bg-gray-100 rounded-2xl p-6 opacity-60">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                TH Sound Coming Soon!
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Complete the R vs L lesson to unlock this lesson
              </p>
            </div>
          </div>
        </section>

        {/* Overall Progress */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📊 Overall Progress
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow">
            <ProgressBar current={lessonsCompleted} total={5} label="Lessons Completed" />
          </div>
        </section>

        {/* Motivational Footer */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200">
            <p className="text-gray-900 font-medium text-center">
              💪 Remember: Consistent practice is the key to fluent English!
              Start with a 5-minute session today.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center">
        <p className="text-sm opacity-75">
          VoiceGym © 2026 | AI English Pronunciation Trainer
        </p>
      </footer>
    </div>
  );
}
       




components/*


"use client";

import { useState, useCallback } from "react";
import { speakText, stopSpeaking } from "@/lib/speech";

export interface FeedbackBoxProps {
  mistakes: string[];
  corrections: string[];
  explanation: string;
  score: number;
  suggestions: string[];
  userSpeech: string;
  expectedSentence: string;
}

export function FeedbackBox({
  mistakes,
  corrections,
  explanation,
  score,
  suggestions,
  userSpeech,
  expectedSentence,
}: FeedbackBoxProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "overview"
  );
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Voice coach - speak the explanation
  const handleCoachSpeak = useCallback(async () => {
    try {
      setIsCoachSpeaking(true);
      await speakText(explanation, 0.85);
      setIsCoachSpeaking(false);
    } catch (err) {
      console.error("Coach voice error:", err);
      setIsCoachSpeaking(false);
    }
  }, [explanation]);

  const handleStopCoach = useCallback(() => {
    stopSpeaking();
    setIsCoachSpeaking(false);
  }, []);

  const scoreColor =
    score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600";
  const scoreEmoji = score >= 80 ? "🎉" : score >= 60 ? "👍" : "💪";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Score Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Pronunciation Score
            </p>
            <p className={`text-4xl font-bold ${scoreColor}`}>{score}%</p>
          </div>
          <p className="text-5xl">{scoreEmoji}</p>
        </div>

        {/* Voice Coach Button */}
        <button
          onClick={isCoachSpeaking ? handleStopCoach : handleCoachSpeak}
          className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          <span className="text-lg">{isCoachSpeaking ? "⏹️" : "🎤"}</span>
          {isCoachSpeaking ? "Stop Coach" : "Hear Coach Feedback"}
        </button>
      </div>

      {/* Expected vs User Speech */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Expected:
          </p>
          <p className="text-lg text-gray-900">{expectedSentence}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            You said:
          </p>
          <p className="text-lg text-gray-900">{userSpeech}</p>
        </div>
      </div>

      {/* Collapsible Sections */}
      {/* Mistakes Section */}
      {mistakes.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("mistakes")}
            className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-red-900 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              Things to improve ({mistakes.length})
            </span>
            <span className="text-red-900">
              {expandedSection === "mistakes" ? "▼" : "▶"}
            </span>
          </button>
          {expandedSection === "mistakes" && (
            <div className="p-4 space-y-2">
              {mistakes.map((mistake, idx) => (
                <div
                  key={idx}
                  className="text-gray-700 pb-2 border-b border-red-100 last:border-b-0"
                >
                  <p className="font-medium text-red-900">• {mistake}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Corrections Section */}
      {corrections.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("corrections")}
            className="w-full px-4 py-3 bg-yellow-50 hover:bg-yellow-100 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-yellow-900 flex items-center gap-2">
              <span className="text-lg">✏️</span>
              Corrections ({corrections.length})
            </span>
            <span className="text-yellow-900">
              {expandedSection === "corrections" ? "▼" : "▶"}
            </span>
          </button>
          {expandedSection === "corrections" && (
            <div className="p-4 space-y-2">
              {corrections.map((correction, idx) => (
                <div
                  key={idx}
                  className="text-gray-700 pb-2 border-b border-yellow-100 last:border-b-0"
                >
                  <p className="font-medium text-yellow-900">✓ {correction}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Explanation Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("explanation")}
          className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 flex items-center justify-between transition-colors"
        >
          <span className="font-semibold text-blue-900 flex items-center gap-2">
            <span className="text-lg">💡</span>
            Explanation
          </span>
          <span className="text-blue-900">
            {expandedSection === "explanation" ? "▼" : "▶"}
          </span>
        </button>
        {expandedSection === "explanation" && (
          <div className="p-4 text-gray-700">{explanation}</div>
        )}
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("suggestions")}
            className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 flex items-center justify-between transition-colors"
          >
            <span className="font-semibold text-green-900 flex items-center gap-2">
              <span className="text-lg">🚀</span>
              Suggestions ({suggestions.length})
            </span>
            <span className="text-green-900">
              {expandedSection === "suggestions" ? "▼" : "▶"}
            </span>
          </button>
          {expandedSection === "suggestions" && (
            <div className="p-4 space-y-2">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="text-gray-700 pb-2 border-b border-green-100 last:border-b-0"
                >
                  <p className="font-medium text-green-900">💡 {suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}







"use client";

interface LessonCardProps {
  title: string;
  description: string;
  icon: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  onClick?: () => void;
  isCompleted?: boolean;
}

export function LessonCard({
  title,
  description,
  icon,
  difficulty,
  onClick,
  isCompleted = false,
}: LessonCardProps) {
  const difficultyColor =
    difficulty === "Beginner"
      ? "bg-green-100 text-green-800"
      : difficulty === "Intermediate"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
        isCompleted
          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300"
          : "bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-5xl">{icon}</div>
        {isCompleted && (
          <span className="text-2xl">✅</span>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>

      <div className="flex items-center justify-between">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor}`}
        >
          {difficulty}
        </span>
        {!isCompleted && (
          <span className="text-blue-600 font-semibold text-sm flex items-center gap-1">
            Start → <span className="text-lg">→</span>
          </span>
        )}
      </div>
    </div>
  );
}







"use client";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "VoiceGym" }: NavbarProps) {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎤</span>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="text-sm opacity-90">
          AI English Pronunciation Trainer
        </div>
      </div>
    </nav>
  );
}






"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({
  current,
  total,
  label = "Progress",
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {current} / {total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1">{percentage}% complete</p>
    </div>
  );
}





"use client";

import { useState, useRef, useCallback } from "react";
import { SpeechRecognizer, speakText, stopSpeaking } from "@/lib/speech";

interface VoiceRecorderProps {
  expectedSentence: string;
  onTranscriptReceived: (transcript: string) => void;
  onAudioRecorded?: (audioBlob: Blob) => void;
  isProcessing?: boolean;
}

export function VoiceRecorder({
  expectedSentence,
  onTranscriptReceived,
  onAudioRecorded,
  isProcessing = false,
}: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize speech recognizer
  const initializeRecognizer = useCallback(() => {
    if (!recognizerRef.current) {
      try {
        recognizerRef.current = new SpeechRecognizer();
      } catch (err) {
        setError(
          "Speech recognition not supported. Please use Chrome, Edge, or Safari."
        );
      }
    }
  }, []);

  // Handle recording start with audio capture
  const handleStartRecording = useCallback(async () => {
    setError(null);
    setTranscript("");
    setRecordedAudioUrl(null);
    initializeRecognizer();

    if (!recognizerRef.current) return;

    try {
      setIsListening(true);
      
      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        
        // Notify parent if they want the audio blob
        if (onAudioRecorded) {
          onAudioRecorded(audioBlob);
        }
      };

      mediaRecorder.start();

      // Record speech
      const result = await recognizerRef.current.start();
      setTranscript(result);
      onTranscriptReceived(result);
      
      // Stop media recorder
      mediaRecorder.stop();
      stream.getTracks().forEach(track => track.stop());
      
      setIsListening(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recording failed");
      setIsListening(false);
    }
  }, [initializeRecognizer, onTranscriptReceived, onAudioRecorded]);

  // Handle recording stop
  const handleStopRecording = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Handle play audio
  const handlePlaySample = useCallback(async () => {
    try {
      setIsSpeaking(true);
      setError(null);
      await speakText(expectedSentence, 0.9);
      setIsSpeaking(false);
    } catch (err) {
      setError(
        "Unable to play audio. Please check your speaker settings."
      );
      setIsSpeaking(false);
    }
  }, [expectedSentence]);

  // Playback user's recorded voice
  const handlePlaybackUserVoice = useCallback(() => {
    if (!recordedAudioUrl) return;
    
    try {
      setIsPlayingBack(true);
      const audio = new Audio(recordedAudioUrl);
      
      audio.onended = () => {
        setIsPlayingBack(false);
      };
      
      audio.onerror = () => {
        setError("Failed to play recording");
        setIsPlayingBack(false);
      };
      
      audio.play();
    } catch (err) {
      setError("Failed to play your voice");
      setIsPlayingBack(false);
    }
  }, [recordedAudioUrl]);

  // Handle stop speaking
  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Expected Sentence Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
        <p className="text-sm font-medium text-gray-600 mb-2">
          Please repeat this sentence:
        </p>
        <p className="text-2xl font-bold text-gray-900">{expectedSentence}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-green-50 rounded-2xl p-6 mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">
            You said:
          </p>
          <p className="text-xl text-gray-900">{transcript}</p>
          
          {/* Playback User Voice */}
          {recordedAudioUrl && (
            <button
              onClick={handlePlaybackUserVoice}
              disabled={isPlayingBack}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
            >
              {isPlayingBack ? "🔊 Playing..." : "🔊 Hear Your Voice"}
            </button>
          )}
        </div>
      )}

      {/* Recording Status */}
      {isListening && (
        <div className="bg-blue-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="animate-pulse">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
          <p className="text-blue-900 font-medium">Listening...</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 flex-wrap justify-center">
        {/* Play Sample Button */}
        <button
          onClick={isSpeaking ? handleStopSpeaking : handlePlaySample}
          disabled={isListening || isProcessing}
          className="flex-1 min-w-[140px] px-6 py-4 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span className="text-xl">
            {isSpeaking ? "⏹️" : "🔊"}
          </span>
          {isSpeaking ? "Stop" : "Play Sample"}
        </button>

        {/* Record Button */}
        <button
          onClick={isListening ? handleStopRecording : handleStartRecording}
          disabled={isProcessing || isSpeaking}
          className={`flex-1 min-w-[140px] px-6 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-white ${
            isListening
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="text-xl">
            {isListening ? "⏹️" : "🎤"}
          </span>
          {isListening ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      {/* Help Text */}
      <p className="text-center text-gray-600 text-sm mt-6">
        💡 Tip: Click "Play Sample" to hear the sentence, then click "Start Recording" to practice!
      </p>
    </div>
  );
}







components/ai/*


"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Avatar, type AvatarState } from "./Avatar";
import { getAICoachResponse, type AICoachContext } from "@/lib/aiCoach";
import { SpeechRecognizer, speakText, stopSpeaking } from "@/lib/speech";

type ChatMessage = {
  role: "user" | "coach";
  text: string;
};

const SUGGESTED_PROMPTS = [
  "Help me improve my R sound",
  "How do I pronounce the L sound?",
  "Give me a TH tip",
  "How can I sound more natural?",
];

export function AICoachPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "coach",
      text: "Tell me what you are practicing (a word or sentence) and I will coach you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<AvatarState>("idle");
  const [context, setContext] = useState<AICoachContext>({});

  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  const isBusy =
    state === "thinking" || state === "speaking" || state === "listening";

  const canSpeak = useMemo(
    () => typeof window !== "undefined" && !!window.speechSynthesis,
    []
  );

  const ensureRecognizer = useCallback(() => {
    if (recognizerRef.current) return recognizerRef.current;
    recognizerRef.current = new SpeechRecognizer();
    return recognizerRef.current;
  }, []);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const askCoach = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setError(null);
      stopSpeaking();
      setState("thinking");
      appendMessage({ role: "user", text: trimmed });

      try {
        const { reply, nextContext } = await getAICoachResponse(trimmed, context);
        setContext(nextContext);
        appendMessage({ role: "coach", text: reply });

        if (canSpeak) {
          setState("speaking");
          await speakText(reply, 0.92);
        }

        setState("idle");
      } catch (e) {
        setState("idle");
        setError(e instanceof Error ? e.message : "Coach failed to respond");
      }
    },
    [appendMessage, canSpeak, context]
  );

  const onSend = useCallback(async () => {
    const text = input;
    setInput("");
    await askCoach(text);
  }, [askCoach, input]);

  const onListen = useCallback(async () => {
    setError(null);

    if (state === "listening") {
      recognizerRef.current?.stop();
      setState("idle");
      return;
    }

    try {
      const recognizer = ensureRecognizer();
      setState("listening");
      const transcript = await recognizer.start();
      setState("idle");
      await askCoach(transcript);
    } catch (e) {
      setState("idle");
      setError(
        e instanceof Error
          ? e.message
          : "Speech recognition is not supported in this browser"
      );
    }
  }, [askCoach, ensureRecognizer, state]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
      <div className="flex items-start justify-between gap-4">
        <Avatar state={state} />

        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            setState((s) => (s === "speaking" ? "idle" : s));
          }}
          disabled={state !== "speaking"}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Stop voice
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mt-4 h-72 overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-900"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => askCoach(p)}
            disabled={isBusy}
            className="px-3 py-2 text-xs rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void onSend();
            }
          }}
          placeholder="Type a question or paste what you said..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          disabled={isBusy}
        />

        <button
          type="button"
          onClick={onListen}
          disabled={state === "thinking" || state === "speaking"}
          className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "listening" ? "Stop" : "Talk"}
        </button>

        <button
          type="button"
          onClick={onSend}
          disabled={!input.trim() || isBusy}
          className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}




"use client";

export type AvatarState = "idle" | "thinking" | "speaking" | "listening";

export function Avatar({ state }: { state: AvatarState }) {
  const label =
    state === "thinking"
      ? "Thinking"
      : state === "speaking"
        ? "Speaking"
        : state === "listening"
          ? "Listening"
          : "Ready";

  const mouth =
    state === "speaking"
      ? "h-3 w-8 rounded-full bg-slate-800"
      : state === "thinking"
        ? "h-1 w-8 rounded-full bg-slate-800"
        : state === "listening"
          ? "h-2 w-10 rounded-full bg-slate-800"
          : "h-2 w-8 rounded-full bg-slate-800";

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-md">
        <div className="absolute left-4 top-5 h-2 w-2 rounded-full bg-white/95" />
        <div className="absolute right-4 top-5 h-2 w-2 rounded-full bg-white/95" />
        <div className={`absolute left-1/2 top-9 -translate-x-1/2 ${mouth}`} />
        {state === "listening" && (
          <div className="absolute -right-2 -top-2 h-4 w-4 animate-pulse rounded-full bg-emerald-400 shadow" />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">AI Coach</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}





/lib/*




//aiCoach.ts

export type AICoachContext = {
  lastTopic?: "r" | "l" | "th" | "v" | "sh" | "general";
};

function normalize(input: string) {
  return input.toLowerCase().trim();
}

export async function getAICoachResponse(
  input: string,
  context?: AICoachContext
): Promise<{ reply: string; nextContext: AICoachContext }> {
  const text = normalize(input);

  // Keep this intentionally simple for now: no network calls, no secrets.
  if (/\bth\b/.test(text) || text.includes("th sound")) {
    return {
      reply:
        "TH tip: place your tongue lightly between your teeth and blow air gently. Start slow: 'thhh' then add the vowel.",
      nextContext: { lastTopic: "th" },
    };
  }

  if (text.includes("r sound") || /\br\b/.test(text) || context?.lastTopic === "r") {
    return {
      reply:
        "R tip: pull your tongue back slightly (do not touch the roof of your mouth), round your lips, and keep the sound smooth. Try: 'rrrr' then 'right'.",
      nextContext: { lastTopic: "r" },
    };
  }

  if (text.includes("l sound") || /\bl\b/.test(text) || context?.lastTopic === "l") {
    return {
      reply:
        "L tip: touch the ridge just behind your upper teeth with the tip of your tongue. Let air flow around the sides. Try: 'llll' then 'light'.",
      nextContext: { lastTopic: "l" },
    };
  }

  if (text.includes("v") || text.includes("f")) {
    return {
      reply:
        "V/F tip: for V, your bottom lip touches your top teeth and you should feel vibration. For F, there is no vibration. Alternate: 'ffff' then 'vvvv'.",
      nextContext: { lastTopic: "v" },
    };
  }

  if (text.includes("sh") || text.includes("s")) {
    return {
      reply:
        "S/SH tip: for SH, round your lips a bit and push air through a narrow channel. For S, lips are flatter and the airflow is more focused. Try: 'sss' then 'shhh'.",
      nextContext: { lastTopic: "sh" },
    };
  }

  return {
    reply:
      "Nice work. Say it slowly first, then speed up only after it sounds clean. If you tell me the word you are practicing, I can coach that specific sound.",
    nextContext: { lastTopic: "general" },
  };
}





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



//practice.ts


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


//prisma.ts


import { PrismaClient } from '../generated/prisma'

let prisma: PrismaClient | null = null

const getPrismaClient = () => {
  if (prisma) {
    return prisma
  }
  
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
    return prisma
  }

  let globalForPrisma = global as typeof globalThis & {
    prisma: PrismaClient | null
  }
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  
  prisma = globalForPrisma.prisma
  return prisma
}

export default getPrismaClient






//speech.ts


/**
 * Speech Recognition Utility
 * Handles Web Speech API for voice recording and transcription
 */

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export class SpeechRecognizer {
  private recognition: any;
  private isListening: boolean = false;
  private transcript: string = "";
  private isFinal: boolean = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error("Speech Recognition API not supported in this browser");
    }
    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition() {
    this.recognition.language = "en-US";
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
  }

  /**
   * Start listening for speech
   */
  start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.transcript = "";
      this.isFinal = false;
      this.isListening = true;

      this.recognition.onstart = () => {
        console.log("Speech recognition started");
      };

      this.recognition.onresult = (event: any) => {
        this.transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          this.transcript += transcriptSegment;

          if (event.results[i].isFinal) {
            this.isFinal = true;
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        resolve(this.transcript);
      };

      this.recognition.start();
    });
  }

  /**
   * Stop listening for speech
   */
  stop() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Get current transcript
   */
  getTranscript(): string {
    return this.transcript;
  }

  /**
   * Check if listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Get final state
   */
  getIsFinal(): boolean {
    return this.isFinal;
  }
}

/**
 * Speak text using Web Speech API
 */
export function speakText(text: string, rate: number = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    const SpeechSynthesis = window.speechSynthesis;
    if (!SpeechSynthesis) {
      reject(new Error("Speech Synthesis API not supported"));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Speech synthesis failed"));

    SpeechSynthesis.speak(utterance);
  });
}

/**
 * Stop current speech
 */
export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}





//utils.ts

/**
 * Utility Functions
 */

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Calculate streak days from last practice date
 */
export function calculateStreak(lastPracticeDate: Date | null): number {
  if (!lastPracticeDate) return 0;

  const today = new Date();
  const last = new Date(lastPracticeDate);

  const diffTime = Math.abs(today.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays === 1 ? diffDays : 0;
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! ☀️";
  if (hour < 18) return "Good afternoon! 🌤️";
  return "Good evening! 🌙";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate or get user ID from localStorage
 */
export function getUserId(): string {
  if (typeof window === "undefined") return "";

  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("userId", userId);
  }
  return userId;
}








// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// User model
model User {
  id        String     @id @default(cuid())
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  // Relations
  sessions  PracticeSession[]
  progress  Progress?
}

// Practice Session model - stores speech practice attempts
model PracticeSession {
  id        String    @id @default(cuid())
  userId    String
  sentence  String    // Expected sentence
  userText  String    // What the user said
  feedback  String?   // AI feedback
  score     Float?    // Score (0-100)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relation to User
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// Progress model - tracks user's learning progress
model Progress {
  id               String    @id @default(cuid())
  userId           String    @unique
  streak           Int       @default(0)        // Days practicing streak
  lastPracticeDate DateTime? // Last practice date
  totalSessions    Int       @default(0)        // Total sessions completed
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relation to User
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

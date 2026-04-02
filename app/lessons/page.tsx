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

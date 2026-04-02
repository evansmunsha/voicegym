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
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl text-center">
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
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all inline-block"
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

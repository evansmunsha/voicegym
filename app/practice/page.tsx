"use client";

import { useState, useCallback, useEffect } from "react";
import { Confetti } from "@/components/Confetti";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { FeedbackBox } from "@/components/FeedbackBox";
import { Navbar } from "@/components/Navbar";
import { getPronunciationFeedback, streamPronunciationFeedback } from "@/lib/feedback";
import { analyzeCommunication, CommunicationAnalysis } from "@/lib/communication";
import { CommunicationPanel } from "@/components/CommunicationPanel";
import { ProgressOverlay } from "@/components/ProgressOverlay";
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
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [liveHints, setLiveHints] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [commAnalysis, setCommAnalysis] = useState<CommunicationAnalysis | null>(null);
  const [liveHintsList, setLiveHintsList] = useState<Array<{id: string; text: string; category?: string; severity?: string}>>([]);

  const currentSentence = PRACTICE_SENTENCES[currentSentenceIndex];

  // Initialize user ID
  useEffect(() => {
    setUserId(getUserId());
  }, []);

  // If a recorded audio blob is provided (when browser recording is used in fallback),
  // send it to the server STT pipeline which returns a transcript and feedback.
  const handleAudioRecorded = useCallback(async (blob: Blob) => {
    setIsLoading(true);
    setLoadingMessage("Transcribing audio...");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", blob, "recording.wav");
      form.append("expectedSentence", currentSentence);

      const res = await fetch("/api/stt", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `STT request failed: ${res.status}`);
      }

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      const serverTranscript = json.transcript || "";
      setTranscript(serverTranscript);
      setCommAnalysis(json.communication || null);
      if (json.feedback) {
        // feedback shape may be from getPronunciationFeedbackAI
        setFeedback(json.feedback as any);
        if ((json.feedback as any).score === 100) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
        }
      }
    } catch (e: any) {
      console.error("Audio STT error:", e);
      setError(e?.message || "Failed to transcribe audio");
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, [currentSentence]);

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
            hints: liveHintsList,
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
    setLoadingMessage("Analyzing your pronunciation...");
    setLiveHints("");
    // Run local communication analysis (filler words, fluency)
    try {
      const comm = analyzeCommunication(text);
      setCommAnalysis(comm);
    } catch (e) {
      console.error("Communication analysis failed:", e);
    }
    try {
      const final = await streamPronunciationFeedback(
        currentSentence,
        text,
        (msg) => {
          if (msg?.type === "status" || msg?.type === "progress") {
            setLoadingMessage(msg.message || "Analyzing...");
          } else if (msg?.type === "partial") {
            // Append partial hint text
            setLiveHints((prev) => (prev + (msg.text || "")));
          } else if (msg?.type === "hint") {
            const hint = msg.hint;
            if (hint && hint.text) {
              setLiveHintsList((prev) => {
                if (prev.some((h) => h.text === hint.text)) return prev;
                return [...prev, { id: hint.id || String(prev.length + 1), text: hint.text, category: hint.category, severity: hint.severity }];
              });
            }
          }
        }
      );
      setFeedback(final);
      if (final.score === 100) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze pronunciation");
      setFeedback(null);
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 relative">
      <Navbar title="Voice Practice" />
      <Confetti trigger={showConfetti} />
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
            onAudioRecorded={handleAudioRecorded}
            isProcessing={isLoading}
          />
        </div>

        {/* Loading State (overlay) */}
        <ProgressOverlay message={loadingMessage} />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <p className="text-red-900 font-medium">❌ Error: {error}</p>
          </div>
        )}

        {/* Live Hints (show while analyzing) */}
        {isLoading && liveHints && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="text-sm text-yellow-800 font-semibold mb-2">Live Hint</p>
              <p className="text-sm text-yellow-900 whitespace-pre-wrap">{liveHints}</p>
            </div>
          </div>
        )}

        {/* Structured live hints (deduplicated, categorized) */}
        {isLoading && liveHintsList.length > 0 && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="text-sm text-yellow-800 font-semibold mb-2">Hints</p>
              <div className="flex flex-col gap-2">
                {liveHintsList.map((h) => (
                  <div key={h.id} className="bg-white p-3 rounded-lg border flex items-start justify-between">
                    <div className="mr-4">
                      <p className="text-sm text-gray-800">{h.text}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">{h.category || 'general'}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${h.severity === 'high' ? 'bg-red-100 text-red-800' : h.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {h.severity || 'low'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

            <CommunicationPanel analysis={commAnalysis} />

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

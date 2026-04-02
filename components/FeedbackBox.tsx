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

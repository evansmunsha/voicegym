"use client";

import { useState, useRef, useCallback } from "react";
import { SpeechRecognizer, speakText, stopSpeaking } from "@/lib/speech";

interface VoiceRecorderProps {
  expectedSentence: string;
  onTranscriptReceived: (transcript: string) => void;
  isProcessing?: boolean;
}

export function VoiceRecorder({
  expectedSentence,
  onTranscriptReceived,
  isProcessing = false,
}: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

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

  // Handle recording start
  const handleStartRecording = useCallback(async () => {
    setError(null);
    setTranscript("");
    initializeRecognizer();

    if (!recognizerRef.current) return;

    try {
      setIsListening(true);
      const result = await recognizerRef.current.start();
      setTranscript(result);
      onTranscriptReceived(result);
      setIsListening(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recording failed");
      setIsListening(false);
    }
  }, [initializeRecognizer, onTranscriptReceived]);

  // Handle recording stop
  const handleStopRecording = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
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

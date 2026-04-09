"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
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
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
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
    setIsPlayingBack(true);
    if (wavesurferRef.current) {
      wavesurferRef.current.play();
    }
  }, [recordedAudioUrl]);

  // Initialize waveform when audio is recorded
  useEffect(() => {
    if (recordedAudioUrl && waveformRef.current) {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#a5b4fc',
        progressColor: '#6366f1',
        height: 32,
        responsive: true,
        barWidth: 2,
      });
      wavesurferRef.current.load(recordedAudioUrl);
      wavesurferRef.current.on('finish', () => setIsPlayingBack(false));
      wavesurferRef.current.on('error', () => setIsPlayingBack(false));
    }
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
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
              <>
                <button
                  onClick={handlePlaybackUserVoice}
                  disabled={isPlayingBack}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {isPlayingBack ? "Playing..." : "🔊 Play Your Recording"}
                </button>
                {/* Optional: Visual waveform placeholder */}
                <div className="mt-2">
                  <div ref={waveformRef} className="w-full h-12 bg-gray-100 rounded"></div>
                </div>
              </>
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

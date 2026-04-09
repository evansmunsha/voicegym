"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { LESSONS } from "@/lib/lessons";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useState } from "react";

export default function LessonDetailPage() {
  const { lessonId } = useParams();
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  if (!lesson) {
    return <div className="p-8">Lesson not found.</div>;
  }

  const currentWord = lesson.practiceWords[currentIdx];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar title={lesson.title} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <div className="text-3xl mb-2">{lesson.mouthDiagram}</div>
          <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-gray-700 mb-4">{lesson.explanation}</p>
          <div className="mb-4">
            <span className="font-semibold">Practice word:</span> {currentWord}
          </div>
          <VoiceRecorder expectedSentence={currentWord} onTranscriptReceived={() => {}} />
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentIdx((i) => Math.min(lesson.practiceWords.length - 1, i + 1))}
              disabled={currentIdx === lesson.practiceWords.length - 1}
              className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

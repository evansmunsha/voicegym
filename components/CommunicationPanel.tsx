"use client";

import React from "react";
import { CommunicationAnalysis } from "@/lib/communication";

export function CommunicationPanel({ analysis }: { analysis: CommunicationAnalysis | null }) {
  if (!analysis) return null;

  const { totalWords, fillerCount, fillerWords, fluencyScore, suggestions } = analysis;

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200 mt-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-2">Communication Skills</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Words</p>
          <p className="text-xl font-bold">{totalWords}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Fluency</p>
          <p className="text-xl font-bold">{fluencyScore}%</p>
        </div>
      </div>

      {fillerCount > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-1">Filler words detected</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(fillerWords).map(([w, c]) => (
              <span key={w} className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{w} × {c}</span>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-1">Suggestions</p>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

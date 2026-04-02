"use client";

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


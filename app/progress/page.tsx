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
         
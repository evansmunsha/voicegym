import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProgressBar } from "@/components/ProgressBar";

export default function ProgressPage() {
  // This would be fetched from the database in a real app
  const stats = {
    totalSessions: 0,
    sessionsThisWeek: 0,
    streak: 0,
    lessonsCompleted: 0,
    totalLessons: 5,
    averageScore: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar title="Your Progress" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Total Sessions 🎤
            </p>
            <p className="text-4xl font-bold text-blue-600">
              {stats.totalSessions}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-gray-600 text-sm font-medium mb-1">
              This Week 📅
            </p>
            <p className="text-4xl font-bold text-indigo-600">
              {stats.sessionsThisWeek}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Current Streak 🔥
            </p>
            <p className="text-4xl font-bold text-orange-600">
              {stats.streak}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Average Score 📊
            </p>
            <p className="text-4xl font-bold text-green-600">
              {stats.averageScore}%
            </p>
          </div>
        </section>

        {/* Lessons Progress */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📚 Lessons Progress
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow">
            <ProgressBar
              current={stats.lessonsCompleted}
              total={stats.totalLessons}
              label="Lessons Completed"
            />
          </div>

          {/* Lesson Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-red-900">
                  🔴 R vs L Sounds
                </h3>
                <span className="text-2xl">🔄</span>
              </div>
              <p className="text-red-800 text-sm mb-3">Status: In Progress</p>
              <p className="text-red-700 text-xs">
                You've mastered: 0/6 words
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-300 opacity-60">
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
          </div>
        </section>

        {/* Weekly Activity */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📈 Weekly Activity
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="grid grid-cols-7 gap-2 text-center">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="flex flex-col items-center">
                  <p className="text-gray-600 text-xs font-semibold mb-2">
                    {day}
                  </p>
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-400">0</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🏆 Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300 text-center opacity-60">
              <p className="text-3xl mb-2">🥇</p>
              <p className="font-bold text-gray-900">Beginner</p>
              <p className="text-xs text-gray-600">Complete your first lesson</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-300 text-center opacity-40">
              <p className="text-3xl mb-2">🥈</p>
              <p className="font-bold text-gray-600">Intermediate</p>
              <p className="text-xs text-gray-500">Complete 3 lessons</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-300 text-center opacity-40">
              <p className="text-3xl mb-2">🥉</p>
              <p className="font-bold text-gray-600">Advanced</p>
              <p className="text-xs text-gray-500">Complete all lessons</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Practice?</h3>
            <p className="mb-6 opacity-90">
              Start a voice practice session now and track your progress in
              real-time!
            </p>
            <Link
              href="/practice"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-all"
            >
              Start Practicing 🎤
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center mt-12">
        <p className="text-sm opacity-75">
          VoiceGym © 2026 | Keep practicing to see your progress!
        </p>
      </footer>
    </div>
  );
}

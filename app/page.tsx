import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { LessonCard } from "@/components/LessonCard";
import { ProgressBar } from "@/components/ProgressBar";
import { getGreeting } from "@/lib/utils";

export default function Home() {
  const greeting = getGreeting();
  const streak = 0; // This would come from database
  const totalSessions = 0;
  const lessonsCompleted = 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {greeting}
            </h1>
            <p className="text-xl text-gray-600">
              Welcome back! Let's improve your English pronunciation today! 🚀
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Current Streak 🔥
                </p>
                <p className="text-3xl font-bold text-orange-500">{streak}</p>
              </div>
              <span className="text-5xl">🔥</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Sessions Completed
                </p>
                <p className="text-3xl font-bold text-blue-500">
                  {totalSessions}
                </p>
              </div>
              <span className="text-5xl">📊</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Lessons Completed
                </p>
                <p className="text-3xl font-bold text-green-500">
                  {lessonsCompleted}/{5}
                </p>
              </div>
              <span className="text-5xl">✅</span>
            </div>
          </div>
        </section>

        {/* Today's Mission */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📋 Today&apos;s Mission
          </h2>
          <Link
            href="/practice"
            className="block bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Voice Practice</h3>
                <p className="opacity-90">
                  Record and improve your pronunciation with real-time
                  feedback
                </p>
              </div>
              <span className="text-6xl">🎤</span>
            </div>
          </Link>
        </section>

        {/* Quick Navigation */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Navigation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/lessons"
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-all hover:scale-105 transform"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">📚</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Lessons
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Learn sound patterns (R/L, TH, V/F)
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/progress"
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-all hover:scale-105 transform"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">📈</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Progress
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Track your improvement over time
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Lessons */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎓 Start Learning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LessonCard
              title="R vs L"
              description="Master the challenging R and L sounds. Learn pronunciation techniques and practice with native speakers."
              icon="🔴"
              difficulty="Beginner"
              isCompleted={false}
            />

            <div className="bg-gray-100 rounded-2xl p-6 opacity-60">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                TH Sound Coming Soon!
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Complete the R vs L lesson to unlock this lesson
              </p>
            </div>
          </div>
        </section>

        {/* Overall Progress */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📊 Overall Progress
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow">
            <ProgressBar current={lessonsCompleted} total={5} label="Lessons Completed" />
          </div>
        </section>

        {/* Motivational Footer */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200">
            <p className="text-gray-900 font-medium text-center">
              💪 Remember: Consistent practice is the key to fluent English!
              Start with a 5-minute session today.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center">
        <p className="text-sm opacity-75">
          VoiceGym © 2026 | AI English Pronunciation Trainer
        </p>
      </footer>
    </div>
  );
}
       
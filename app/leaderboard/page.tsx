"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

interface LeaderboardEntry {
  user: string;
  streak: number;
  totalSessions: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setEntries(data.leaderboard || []))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar title="Leaderboard" />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">🏆 Leaderboard</h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full bg-white rounded-2xl shadow overflow-hidden">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Streak 🔥</th>
                <th className="p-3 text-left">Sessions 📊</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={entry.user} className={idx % 2 ? "bg-blue-50" : ""}>
                  <td className="p-3 font-semibold">{entry.user}</td>
                  <td className="p-3">{entry.streak}</td>
                  <td className="p-3">{entry.totalSessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

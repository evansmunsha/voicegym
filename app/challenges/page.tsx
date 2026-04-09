"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";

export default function ChallengesPage() {
  const [challengeSent, setChallengeSent] = useState(false);
  const [friend, setFriend] = useState("");
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      <Navbar title="Friend Challenges" />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Challenge a Friend</h1>
        <div className="bg-white rounded-2xl p-6 shadow">
          <input
            type="text"
            value={friend}
            onChange={e => setFriend(e.target.value)}
            placeholder="Friend's username or email"
            className="px-4 py-2 rounded border w-full mb-4"
          />
          <button
            onClick={() => setChallengeSent(true)}
            className="px-8 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all w-full"
            disabled={!friend.trim()}
          >
            Send Challenge
          </button>
          {challengeSent && (
            <div className="mt-4 text-green-700 font-semibold">Challenge sent to {friend}!</div>
          )}
        </div>
      </main>
    </div>
  );
}
